export interface Satellite {
  id: string
  name: string
  type: string
  status: string
  lat: number
  lon: number
  alt: number
  speed: number
}

export const SAT_DATA: Satellite[] = [
  // ISS
  { id: 'ISS', name: 'ISS (ZARYA)', type: 'ISS', status: 'GREEN', lat: 42.46, lon: -70.71, alt: 408, speed: 27600 },
  
  // Tiangong
  { id: 'TG', name: 'TIANGONG (CSS)', type: 'SAT', status: 'GREEN', lat: 33.94, lon: -118.12, alt: 390, speed: 27600 },
  
  // Hubble
  { id: 'HST', name: 'HUBBLE (HST)', type: 'SAT', status: 'GREEN', lat: 28.03, lon: -80.90, alt: 547, speed: 27300 },
  
  // Starlink (12 variants)
  { id: 'SL1007', name: 'STARLINK-1007', type: 'SAT', status: 'GREEN', lat: -12.65, lon: 131.02, alt: 550, speed: 27000 },
  { id: 'SL1012', name: 'STARLINK-1012', type: 'SAT', status: 'GREEN', lat: 23.11, lon: -45.33, alt: 550, speed: 27000 },
  { id: 'SL1023', name: 'STARLINK-1023', type: 'SAT', status: 'YELLOW', lat: 51.5, lon: -0.12, alt: 540, speed: 26900 },
  { id: 'SL1045', name: 'STARLINK-1045', type: 'SAT', status: 'GREEN', lat: -23.5, lon: -46.6, alt: 550, speed: 27000 },
  { id: 'SL1056', name: 'STARLINK-1056', type: 'SAT', status: 'GREEN', lat: -45.2, lon: 165.1, alt: 550, speed: 27000 },
  { id: 'SL1067', name: 'STARLINK-1067', type: 'SAT', status: 'YELLOW', lat: 67.8, lon: 22.0, alt: 545, speed: 26950 },
  { id: 'SL1078', name: 'STARLINK-1078', type: 'SAT', status: 'GREEN', lat: 11.0, lon: -165.0, alt: 550, speed: 27000 },
  { id: 'SL1089', name: 'STARLINK-1089', type: 'SAT', status: 'GREEN', lat: -36.4, lon: -135.6, alt: 550, speed: 27000 },
  { id: 'SL1090', name: 'STARLINK-1090', type: 'SAT', status: 'GREEN', lat: 35.68, lon: 139.69, alt: 550, speed: 27000 },
  { id: 'SL1101', name: 'STARLINK-1101', type: 'SAT', status: 'GREEN', lat: -33.86, lon: 151.20, alt: 548, speed: 27010 },
  { id: 'SL1112', name: 'STARLINK-1112', type: 'SAT', status: 'YELLOW', lat: 19.43, lon: -99.13, alt: 542, speed: 26920 },
  { id: 'SL1123', name: 'STARLINK-1123', type: 'SAT', status: 'GREEN', lat: 30.04, lon: 31.23, alt: 550, speed: 27000 },
  
  // GPS (10 variants)
  { id: 'GPS1', name: 'GPS IIF-1', type: 'SAT', status: 'GREEN', lat: 55.22, lon: 44.11, alt: 20200, speed: 14000 },
  { id: 'GPS2', name: 'GPS IIF-2', type: 'SAT', status: 'GREEN', lat: -10.2, lon: 120.4, alt: 20200, speed: 14000 },
  { id: 'GPS3', name: 'GPS IIF-3', type: 'SAT', status: 'YELLOW', lat: 38.5, lon: -9.4, alt: 20180, speed: 13980 },
  { id: 'GPS4', name: 'GPS IIF-4', type: 'SAT', status: 'GREEN', lat: 40.71, lon: -74.00, alt: 20200, speed: 14000 },
  { id: 'GPS5', name: 'GPS IIF-5', type: 'SAT', status: 'GREEN', lat: 34.05, lon: -118.24, alt: 20200, speed: 14000 },
  { id: 'GPS6', name: 'GPS IIF-6', type: 'SAT', status: 'GREEN', lat: 51.50, lon: -0.12, alt: 20210, speed: 14005 },
  { id: 'GPS7', name: 'GPS IIF-7', type: 'SAT', status: 'YELLOW', lat: 48.85, lon: 2.35, alt: 20190, speed: 13990 },
  { id: 'GPS8', name: 'GPS IIF-8', type: 'SAT', status: 'GREEN', lat: 35.67, lon: 139.65, alt: 20200, speed: 14000 },
  { id: 'GPS9', name: 'GPS IIF-9', type: 'SAT', status: 'GREEN', lat: -22.90, lon: -43.17, alt: 20200, speed: 14000 },
  { id: 'GPS10', name: 'GPS IIF-10', type: 'SAT', status: 'GREEN', lat: 37.77, lon: -122.41, alt: 20200, speed: 14000 },
  
  // Iridium (10 variants)
  { id: 'IR1', name: 'IRIDIUM-1', type: 'SAT', status: 'GREEN', lat: 45.1, lon: 65.2, alt: 780, speed: 26800 },
  { id: 'IR2', name: 'IRIDIUM-2', type: 'SAT', status: 'GREEN', lat: -5.6, lon: 35.8, alt: 780, speed: 26800 },
  { id: 'IR3', name: 'IRIDIUM-3', type: 'SAT', status: 'GREEN', lat: 12.3, lon: -85.4, alt: 780, speed: 26800 },
  { id: 'IR4', name: 'IRIDIUM-4', type: 'SAT', status: 'GREEN', lat: 39.90, lon: 116.40, alt: 780, speed: 26800 },
  { id: 'IR5', name: 'IRIDIUM-5', type: 'SAT', status: 'YELLOW', lat: -34.60, lon: -58.38, alt: 778, speed: 26780 },
  { id: 'IR6', name: 'IRIDIUM-6', type: 'SAT', status: 'GREEN', lat: 55.75, lon: 37.61, alt: 780, speed: 26800 },
  { id: 'IR7', name: 'IRIDIUM-7', type: 'SAT', status: 'GREEN', lat: 28.61, lon: 77.20, alt: 780, speed: 26800 },
  { id: 'IR8', name: 'IRIDIUM-8', type: 'SAT', status: 'GREEN', lat: -26.20, lon: 28.04, alt: 780, speed: 26800 },
  { id: 'IR9', name: 'IRIDIUM-9', type: 'SAT', status: 'YELLOW', lat: 1.35, lon: 103.81, alt: 775, speed: 26750 },
  { id: 'IR10', name: 'IRIDIUM-10', type: 'SAT', status: 'GREEN', lat: 31.23, lon: 121.47, alt: 780, speed: 26800 },
  
  // Cosmos (9 variants)
  { id: 'C2542', name: 'COSMOS-2542', type: 'CLASSIFIED', status: 'BLUE', lat: 62.4, lon: -25.7, alt: 360, speed: 27800 },
  { id: 'C2543', name: 'COSMOS-2543', type: 'CLASSIFIED', status: 'BLUE', lat: -25.4, lon: 134.2, alt: 380, speed: 27750 },
  { id: 'C2544', name: 'COSMOS-2544', type: 'CLASSIFIED', status: 'BLUE', lat: 48.7, lon: 42.3, alt: 370, speed: 27820 },
  { id: 'C2545', name: 'COSMOS-2545', type: 'CLASSIFIED', status: 'BLUE', lat: 59.93, lon: 30.33, alt: 365, speed: 27810 },
  { id: 'C2546', name: 'COSMOS-2546', type: 'CLASSIFIED', status: 'BLUE', lat: 50.45, lon: 30.52, alt: 375, speed: 27780 },
  { id: 'C2547', name: 'COSMOS-2547', type: 'CLASSIFIED', status: 'BLUE', lat: 41.00, lon: 28.97, alt: 382, speed: 27740 },
  { id: 'C2548', name: 'COSMOS-2548', type: 'CLASSIFIED', status: 'BLUE', lat: 52.52, lon: 13.40, alt: 368, speed: 27830 },
  { id: 'C2549', name: 'COSMOS-2549', type: 'CLASSIFIED', status: 'BLUE', lat: 48.20, lon: 16.37, alt: 372, speed: 27790 },
  { id: 'C2550', name: 'COSMOS-2550', type: 'CLASSIFIED', status: 'BLUE', lat: 45.46, lon: 9.18, alt: 378, speed: 27760 },
  
  // NOAA (5 variants)
  { id: 'N19', name: 'NOAA-19', type: 'SAT', status: 'GREEN', lat: 29.5, lon: 94.2, alt: 870, speed: 26100 },
  { id: 'N20', name: 'NOAA-20', type: 'SAT', status: 'GREEN', lat: 1.3, lon: 103.8, alt: 824, speed: 26200 },
  { id: 'N21', name: 'NOAA-21', type: 'SAT', status: 'GREEN', lat: -15.8, lon: -170.3, alt: 824, speed: 26200 },
  { id: 'N22', name: 'NOAA-22', type: 'SAT', status: 'GREEN', lat: -33.92, lon: 18.42, alt: 824, speed: 26200 },
  { id: 'N23', name: 'NOAA-23', type: 'SAT', status: 'YELLOW', lat: -37.81, lon: 144.96, alt: 820, speed: 26180 },
  
  // GOES (4 variants)
  { id: 'G16', name: 'GOES-16', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -75.2, alt: 35786, speed: 11070 },
  { id: 'G17', name: 'GOES-17', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -137.2, alt: 35786, speed: 11070 },
  { id: 'G18', name: 'GOES-18', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -137.0, alt: 35780, speed: 11070 },
  { id: 'G19', name: 'GOES-19', type: 'SAT', status: 'GREEN', lat: 0.0, lon: -135.0, alt: 35782, speed: 11070 },
  
  // Sentinel (4 variants)
  { id: 'S6A', name: 'SENTINEL-6A', type: 'SAT', status: 'GREEN', lat: 35.0, lon: -4.5, alt: 1336, speed: 25900 },
  { id: 'S6B', name: 'SENTINEL-6B', type: 'SAT', status: 'GREEN', lat: -3.5, lon: 132.8, alt: 1336, speed: 25900 },
  { id: 'S6C', name: 'SENTINEL-6C', type: 'SAT', status: 'GREEN', lat: 59.32, lon: 18.06, alt: 1336, speed: 25900 },
  { id: 'S6D', name: 'SENTINEL-6D', type: 'SAT', status: 'YELLOW', lat: 60.16, lon: 24.93, alt: 1330, speed: 25880 },
  
  // Landsat (4 variants)
  { id: 'L8', name: 'LANDSAT-8', type: 'SAT', status: 'GREEN', lat: 38.9, lon: -77.0, alt: 705, speed: 26600 },
  { id: 'L9', name: 'LANDSAT-9', type: 'SAT', status: 'GREEN', lat: -23.6, lon: -46.5, alt: 705, speed: 26600 },
  { id: 'L10', name: 'LANDSAT-10', type: 'SAT', status: 'GREEN', lat: 39.95, lon: -75.16, alt: 705, speed: 26600 },
  { id: 'L11', name: 'LANDSAT-11', type: 'SAT', status: 'YELLOW', lat: 47.60, lon: -122.33, alt: 700, speed: 26580 },
  
  // Debris (6 variants)
  { id: 'DB22', name: 'DEBRIS-2022-041A', type: 'DEBRIS', status: 'RED', lat: -33.0, lon: 150.0, alt: 380, speed: 27800 },
  { id: 'DB23', name: 'DEBRIS-2023-089B', type: 'DEBRIS', status: 'RED', lat: 40.7, lon: -74.0, alt: 420, speed: 27700 },
  { id: 'DB24', name: 'DEBRIS-2024-012C', type: 'DEBRIS', status: 'RED', lat: 3.5, lon: 112.8, alt: 340, speed: 27950 },
  { id: 'DB24D', name: 'DEBRIS-2024-045D', type: 'DEBRIS', status: 'RED', lat: 43.65, lon: -79.38, alt: 395, speed: 27750 },
  { id: 'DB25A', name: 'DEBRIS-2025-001A', type: 'DEBRIS', status: 'RED', lat: 45.42, lon: -75.69, alt: 410, speed: 27680 },
  { id: 'DB25C', name: 'DEBRIS-2025-024C', type: 'DEBRIS', status: 'RED', lat: 53.54, lon: -113.49, alt: 360, speed: 27850 },
  
  // Classified (4 variants)
  { id: 'OBJ123', name: 'OBJECT 12345 (CLASSIFIED)', type: 'CLASSIFIED', status: 'BLUE', lat: 40.0, lon: -110.0, alt: 250, speed: 28200 },
  { id: 'OBJ678', name: 'OBJECT 67890 (CLASSIFIED)', type: 'CLASSIFIED', status: 'BLUE', lat: -37.81, lon: 144.96, alt: 270, speed: 28150 },
  { id: 'OBJ112', name: 'OBJECT 11223 (CLASSIFIED)', type: 'CLASSIFIED', status: 'BLUE', lat: 35.67, lon: 139.65, alt: 260, speed: 28180 },
  { id: 'OBJ445', name: 'OBJECT 44556 (CLASSIFIED)', type: 'CLASSIFIED', status: 'BLUE', lat: 51.50, lon: -0.12, alt: 285, speed: 28110 },
]
