import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json()

  const systemPrompt = `You are SkyLens AI, the onboard intelligence system for Project Zenith: The Celestial Eye, a NASA Mission Control style satellite and space tracking platform.

You answer questions about astronomy, satellites, the ISS, space weather, orbital mechanics, and the night sky. Keep answers concise (2-5 sentences unless asked for more detail), technically accurate, and in a calm mission-control tone. Use metric units. If asked something outside space/astronomy, politely redirect to your domain.

${context ? `CURRENT LIVE TELEMETRY CONTEXT:\n${context}` : ''}`

  try {
    const stream = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.6,
      max_tokens: 600,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) controller.enqueue(encoder.encode(text))
          }
        } catch (e) {
          controller.error(e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (err) {
    return new Response('SkyLens core unreachable. Check GROQ_API_KEY.', { status: 500 })
  }
}