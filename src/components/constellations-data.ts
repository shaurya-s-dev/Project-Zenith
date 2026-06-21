// IAU subset: 20 well-known constellations with star pairs for line-drawing
// Each entry: name, mythology snippet, stars as [lat, lon] pairs (approx RA/Dec → lon/lat mapping)
// lon = (RA_hours / 24) * 360 - 180   lat = Dec degrees
// Stars listed as segments: each pair [A, B] draws one line

export interface ConstellationStar {
  lat: number
  lon: number
  name?: string
}

export interface Constellation {
  id: string
  name: string
  abbr: string
  mythology: string
  season: string
  stars: ConstellationStar[]   // unique star positions
  lines: [number, number][]    // index pairs into stars[]
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'ori', name: 'Orion', abbr: 'Ori', season: 'Winter',
    mythology: 'The great hunter of Greek myth, placed in the sky by Zeus. Betelgeuse marks his right shoulder, Rigel his left foot.',
    stars: [
      { lat: 7.4, lon: -75.8, name: 'Betelgeuse' },   // 0
      { lat: -8.2, lon: -78.2, name: 'Rigel' },        // 1
      { lat: 6.4, lon: -80.5, name: 'Bellatrix' },     // 2
      { lat: -0.3, lon: -79.2, name: 'Alnilam' },      // 3
      { lat: -1.9, lon: -77.9, name: 'Alnitak' },      // 4
      { lat: 1.4, lon: -80.3, name: 'Mintaka' },       // 5
      { lat: -5.9, lon: -82.5, name: 'Saiph' },        // 6
      { lat: 9.9, lon: -78.1, name: 'Meissa' },        // 7
    ],
    lines: [[0,3],[3,4],[4,5],[5,3],[0,2],[2,7],[7,0],[1,6],[1,4],[6,4]],
  },
  {
    id: 'uma', name: 'Ursa Major', abbr: 'UMa', season: 'Spring',
    mythology: 'Zeus transformed Callisto into a bear and placed her in the sky. The Big Dipper asterism forms the bear\'s back and tail.',
    stars: [
      { lat: 61.7, lon: -165.5, name: 'Dubhe' },      // 0
      { lat: 56.4, lon: -162.3, name: 'Merak' },      // 1
      { lat: 53.7, lon: -156.5, name: 'Phecda' },     // 2
      { lat: 57.0, lon: -154.5, name: 'Megrez' },     // 3
      { lat: 55.9, lon: -148.2, name: 'Alioth' },     // 4
      { lat: 54.9, lon: -138.2, name: 'Mizar' },      // 5
      { lat: 49.3, lon: -130.8, name: 'Alkaid' },     // 6
    ],
    lines: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]],
  },
  {
    id: 'cas', name: 'Cassiopeia', abbr: 'Cas', season: 'Autumn',
    mythology: 'The vain queen of Ethiopia, chained to her throne by Poseidon and condemned to circle the North Pole forever.',
    stars: [
      { lat: 56.5, lon: 2.3, name: 'Schedar' },       // 0
      { lat: 59.1, lon: 10.1, name: 'Caph' },          // 1
      { lat: 60.7, lon: 21.7, name: 'Gamma Cas' },    // 2
      { lat: 60.2, lon: 28.6, name: 'Ruchbah' },      // 3
      { lat: 63.7, lon: 36.0, name: 'Segin' },         // 4
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    id: 'cyg', name: 'Cygnus', abbr: 'Cyg', season: 'Summer',
    mythology: 'The swan, associated with Zeus who transformed himself into one. Deneb marks the tail of the Northern Cross.',
    stars: [
      { lat: 45.3, lon: -48.8, name: 'Deneb' },       // 0
      { lat: 33.9, lon: -57.8, name: 'Sadr' },         // 1
      { lat: 27.9, lon: -60.8, name: 'Albireo' },     // 2
      { lat: 40.3, lon: -65.5, name: 'Gienah' },      // 3
      { lat: 29.7, lon: -51.0, name: 'Delta Cyg' },   // 4
    ],
    lines: [[0,1],[1,2],[1,3],[1,4],[3,4]],
  },
  {
    id: 'leo', name: 'Leo', abbr: 'Leo', season: 'Spring',
    mythology: 'The Nemean Lion slain by Hercules as his first labor. Regulus, the "little king", anchors the lion\'s chest.',
    stars: [
      { lat: 11.9, lon: -152.1, name: 'Regulus' },    // 0
      { lat: 23.8, lon: -155.0, name: 'Algieba' },    // 1
      { lat: 20.5, lon: -163.3, name: 'Adhafera' },   // 2
      { lat: 14.6, lon: -170.2, name: 'Rasalas' },    // 3
      { lat: 14.6, lon: -143.7, name: 'Denebola' },   // 4
      { lat: 20.5, lon: -148.0, name: 'Zosma' },      // 5
    ],
    lines: [[0,1],[1,2],[2,3],[0,5],[5,4],[1,5]],
  },
  {
    id: 'sco', name: 'Scorpius', abbr: 'Sco', season: 'Summer',
    mythology: 'The scorpion sent by Gaia to sting Orion. They never share the sky — as Scorpius rises, Orion sets.',
    stars: [
      { lat: -26.4, lon: -112.5, name: 'Antares' },   // 0
      { lat: -19.8, lon: -113.0, name: 'Graffias' },  // 1
      { lat: -22.6, lon: -114.5, name: 'Dschubba' },  // 2
      { lat: -28.2, lon: -116.0, name: 'Sigma Sco' }, // 3
      { lat: -34.3, lon: -114.5, name: 'Zeta Sco' },  // 4
      { lat: -37.1, lon: -117.4, name: 'Eta Sco' },   // 5
      { lat: -42.9, lon: -122.0, name: 'Shaula' },    // 6
    ],
    lines: [[1,2],[2,0],[0,3],[3,4],[4,5],[5,6]],
  },
  {
    id: 'tau', name: 'Taurus', abbr: 'Tau', season: 'Winter',
    mythology: 'Zeus disguised as a white bull who carried Europa across the sea. The Pleiades star cluster rides on the bull\'s shoulder.',
    stars: [
      { lat: 16.5, lon: -65.5, name: 'Aldebaran' },   // 0
      { lat: 19.2, lon: -63.0, name: 'Zeta Tau' },    // 1
      { lat: 28.6, lon: -57.0, name: 'Pleiades' },    // 2 (approximate center)
      { lat: 15.6, lon: -61.5, name: 'Lambda Tau' },  // 3
    ],
    lines: [[0,1],[0,3],[0,2]],
  },
  {
    id: 'gem', name: 'Gemini', abbr: 'Gem', season: 'Winter',
    mythology: 'Castor and Pollux, the twin sons of Zeus — one mortal, one immortal. They sailed with Jason on the Argo.',
    stars: [
      { lat: 31.9, lon: -113.5, name: 'Castor' },     // 0
      { lat: 28.0, lon: -112.6, name: 'Pollux' },     // 1
      { lat: 25.1, lon: -100.5, name: 'Alhena' },     // 2
      { lat: 22.5, lon: -103.2, name: 'Wasat' },      // 3
      { lat: 16.2, lon: -105.8, name: 'Mekbuda' },    // 4
      { lat: 35.2, lon: -106.1, name: 'Mebsuda' },    // 5
    ],
    lines: [[0,1],[0,5],[5,3],[3,2],[1,3],[3,4]],
  },
  {
    id: 'vir', name: 'Virgo', abbr: 'Vir', season: 'Spring',
    mythology: 'Demeter, goddess of the harvest, or her daughter Persephone. Spica, the brightest star, is one of the fastest rotating stars known.',
    stars: [
      { lat: -11.2, lon: -171.0, name: 'Spica' },     // 0
      { lat: 10.9, lon: -166.0, name: 'Vindemiatrix' },// 1
      { lat: 1.4, lon: -174.0, name: 'Porrima' },     // 2
      { lat: -6.0, lon: 179.5, name: 'Heze' },        // 3
    ],
    lines: [[0,2],[2,1],[2,3]],
  },
  {
    id: 'aql', name: 'Aquila', abbr: 'Aql', season: 'Summer',
    mythology: 'The eagle of Zeus, who carried thunderbolts and abducted Ganymede. Altair is one of the closest stars visible to the naked eye.',
    stars: [
      { lat: 8.9, lon: -82.6, name: 'Altair' },       // 0
      { lat: 13.9, lon: -81.9, name: 'Tarazed' },     // 1
      { lat: 6.4, lon: -82.0, name: 'Alshain' },      // 2
      { lat: 1.0, lon: -79.9, name: 'Lambda Aql' },   // 3
      { lat: 10.6, lon: -75.4, name: 'Delta Aql' },   // 4
    ],
    lines: [[1,0],[0,2],[0,4],[4,3]],
  },
]