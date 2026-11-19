import type {
  AirQualityPayload,
  AqiStatus,
  CityPreset,
  DailyOutlookPoint,
  HourlyPoint,
  NeighborhoodPreset,
} from '../types/airQuality';

export const INDIAN_METRO_NAMES = ['Bengaluru', 'Delhi', 'Chennai', 'Mumbai'] as const;

export const CITY_PRESETS: CityPreset[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    aliases: ['bangalore', 'blr'],
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    timezone: 'Asia/Kolkata',
    basePm25: 27,
    basePm10: 56,
    baseNo2: 34,
    tempC: 24,
    humidityPct: 61,
    windKmh: 11,
    neighborhoods: [
      { id: 'indiranagar', name: 'Indiranagar', aliases: ['indira nagar'], zoneType: 'Tree-Lined Residential & Metro Corridor', lat: 12.9784, lon: 77.6408, pm25Factor: 0.94, pm10Factor: 0.88, no2Factor: 0.94 },
      { id: 'koramangala', name: 'Koramangala', aliases: ['koramangla', 'kormangala'], zoneType: 'Urban Arterial & Tech Hub', lat: 12.9352, lon: 77.6245, pm25Factor: 0.99, pm10Factor: 1.02, no2Factor: 1.06 },
      { id: 'whitefield', name: 'Whitefield', aliases: ['white field'], zoneType: 'East IT Corridor & Construction Belt', lat: 12.9698, lon: 77.7500, pm25Factor: 1.05, pm10Factor: 1.15, no2Factor: 1.12 },
      { id: 'hsr-layout', name: 'HSR Layout', aliases: ['hsr', 'hsr sector'], zoneType: 'South-East Residential & ORR Edge', lat: 12.9116, lon: 77.6389, pm25Factor: 0.97, pm10Factor: 0.98, no2Factor: 1.02 },
      { id: 'jayanagar', name: 'Jayanagar', aliases: ['jaynagar', 'jaya nagar'], zoneType: 'Mature Canopy South Residential', lat: 12.9250, lon: 77.5938, pm25Factor: 0.90, pm10Factor: 0.85, no2Factor: 0.88 },
      { id: 'electronic-city', name: 'Electronic City', aliases: ['e city', 'ecity', 'electronic city phase 1', 'electronic city phase 2'], zoneType: 'Elevated Expressway & Tech Park', lat: 12.8399, lon: 77.6770, pm25Factor: 1.03, pm10Factor: 1.12, no2Factor: 1.10 },
      { id: 'hebbal', name: 'Hebbal', aliases: ['hebal'], zoneType: 'North Flyover & Airport Highway', lat: 13.0358, lon: 77.5970, pm25Factor: 1.04, pm10Factor: 1.14, no2Factor: 1.16 },
      { id: 'peenya', name: 'Peenya', aliases: ['peenya industrial area'], zoneType: 'West Industrial & Freight Corridor', lat: 13.0285, lon: 77.5197, pm25Factor: 1.06, pm10Factor: 1.18, no2Factor: 1.18 },
      { id: 'btm-layout', name: 'BTM Layout', aliases: ['btm', 'btm stage'], zoneType: 'Dense Junction & Silk Board Basin', lat: 12.9166, lon: 77.6101, pm25Factor: 1.05, pm10Factor: 1.14, no2Factor: 1.16 },
      { id: 'silk-board', name: 'Silk Board', aliases: ['silkboard'], zoneType: 'Outer Ring Bottleneck & Flyover', lat: 12.9177, lon: 77.6238, pm25Factor: 1.08, pm10Factor: 1.18, no2Factor: 1.22 },
      { id: 'bellandur', name: 'Bellandur', aliases: ['belandur'], zoneType: 'Outer Ring IT & Lake Corridor', lat: 12.9255, lon: 77.6762, pm25Factor: 1.04, pm10Factor: 1.14, no2Factor: 1.12 },
      { id: 'marathahalli', name: 'Marathahalli', aliases: ['marathalli', 'marthahalli'], zoneType: 'Outer Ring Traffic & Metro Works', lat: 12.9592, lon: 77.6974, pm25Factor: 1.06, pm10Factor: 1.16, no2Factor: 1.16 },
      { id: 'malleswaram', name: 'Malleswaram', aliases: ['malleshwaram'], zoneType: 'Heritage Canopy & North-West Urban', lat: 13.0031, lon: 77.5643, pm25Factor: 0.91, pm10Factor: 0.86, no2Factor: 0.89 },
      { id: 'jp-nagar', name: 'JP Nagar', aliases: ['j p nagar', 'jayaprakash nagar'], zoneType: 'South Residential & Bannerghatta Link', lat: 12.9063, lon: 77.5857, pm25Factor: 0.94, pm10Factor: 0.90, no2Factor: 0.93 },
      { id: 'yelahanka', name: 'Yelahanka', aliases: ['yelhanka'], zoneType: 'North Suburb & Open Airshed', lat: 13.1007, lon: 77.5963, pm25Factor: 0.92, pm10Factor: 0.92, no2Factor: 0.88 },
      { id: 'rajajinagar', name: 'Rajajinagar', aliases: ['rajaji nagar'], zoneType: 'West Residential & Metro Rail Edge', lat: 12.9982, lon: 77.5530, pm25Factor: 0.97, pm10Factor: 0.96, no2Factor: 0.98 },
      { id: 'sarjapur-road', name: 'Sarjapur Road', aliases: ['sarjapur', 'sarjapura'], zoneType: 'South-East IT & Residential Corridor', lat: 12.9081, lon: 77.6845, pm25Factor: 1.02, pm10Factor: 1.10, no2Factor: 1.06 },
      { id: 'banashankari', name: 'Banashankari', aliases: ['bsk'], zoneType: 'South-West Residential Hub', lat: 12.9255, lon: 77.5468, pm25Factor: 0.93, pm10Factor: 0.92, no2Factor: 0.94 },
      { id: 'yeshwanthpur', name: 'Yeshwanthpur', aliases: ['yeshwantpur'], zoneType: 'North-West Rail & Industrial Belt', lat: 13.0250, lon: 77.5430, pm25Factor: 1.04, pm10Factor: 1.12, no2Factor: 1.14 },
      { id: 'kr-puram', name: 'KR Puram', aliases: ['krishnarajapuram', 'k r puram'], zoneType: 'East Ring Junction & Highway', lat: 13.0012, lon: 77.6950, pm25Factor: 1.05, pm10Factor: 1.15, no2Factor: 1.15 },
      { id: 'vijayanagar', name: 'Vijayanagar', aliases: ['vijaya nagar'], zoneType: 'West Metro & Residential Grid', lat: 12.9719, lon: 77.5327, pm25Factor: 0.96, pm10Factor: 0.96, no2Factor: 0.98 },
      { id: 'rt-nagar', name: 'RT Nagar', aliases: ['r t nagar', 'rabindranath tagore nagar'], zoneType: 'North Residential Pocket', lat: 13.0247, lon: 77.5948, pm25Factor: 0.95, pm10Factor: 0.94, no2Factor: 0.97 },
      { id: 'ulsoor', name: 'Ulsoor', aliases: ['halasuru'], zoneType: 'Central Lake & Tree Canopy', lat: 12.9817, lon: 77.6285, pm25Factor: 0.93, pm10Factor: 0.89, no2Factor: 0.95 },
      { id: 'basavanagudi', name: 'Basavanagudi', aliases: ['basavangudi'], zoneType: 'Heritage South Canopy Zone', lat: 12.9406, lon: 77.5738, pm25Factor: 0.90, pm10Factor: 0.86, no2Factor: 0.89 },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    aliases: ['new delhi', 'delhi ncr'],
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
    timezone: 'Asia/Kolkata',
    basePm25: 138,
    basePm10: 232,
    baseNo2: 68,
    tempC: 21,
    humidityPct: 58,
    windKmh: 5,
    neighborhoods: [
      { id: 'connaught-place', name: 'Connaught Place', aliases: ['cp'], zoneType: 'Central Commercial Ring', lat: 28.6315, lon: 77.2167, pm25Factor: 1.02, pm10Factor: 1.04, no2Factor: 1.14 },
      { id: 'hauz-khas', name: 'Hauz Khas', zoneType: 'Green Park & South Urban', lat: 28.5494, lon: 77.2001, pm25Factor: 0.90, pm10Factor: 0.88, no2Factor: 0.86 },
      { id: 'anand-vihar', name: 'Anand Vihar', zoneType: 'Transit Terminal & Industrial Edge', lat: 28.6469, lon: 77.3160, pm25Factor: 1.12, pm10Factor: 1.20, no2Factor: 1.22 },
      { id: 'dwarka', name: 'Dwarka', zoneType: 'South-West Sub-City Grid', lat: 28.5921, lon: 77.0460, pm25Factor: 0.95, pm10Factor: 1.00, no2Factor: 0.94 },
      { id: 'rohini', name: 'Rohini', zoneType: 'North-West Residential Basin', lat: 28.7495, lon: 77.0565, pm25Factor: 1.05, pm10Factor: 1.10, no2Factor: 1.06 },
      { id: 'saket', name: 'Saket', zoneType: 'South Residential & Mall Corridor', lat: 28.5246, lon: 77.2066, pm25Factor: 0.93, pm10Factor: 0.92, no2Factor: 0.94 },
      { id: 'vasant-kunj', name: 'Vasant Kunj', zoneType: 'South-West Ridge & Green Belt', lat: 28.5293, lon: 77.1539, pm25Factor: 0.90, pm10Factor: 0.89, no2Factor: 0.88 },
      { id: 'lajpat-nagar', name: 'Lajpat Nagar', zoneType: 'Ring Road Commercial & Metro', lat: 28.5677, lon: 77.2433, pm25Factor: 1.03, pm10Factor: 1.06, no2Factor: 1.08 },
      { id: 'karol-bagh', name: 'Karol Bagh', zoneType: 'Central Dense Market Grid', lat: 28.6519, lon: 77.1909, pm25Factor: 1.05, pm10Factor: 1.08, no2Factor: 1.12 },
      { id: 'janakpuri', name: 'Janakpuri', zoneType: 'West Residential District', lat: 28.6219, lon: 77.0878, pm25Factor: 0.98, pm10Factor: 1.02, no2Factor: 0.98 },
      { id: 'nehru-place', name: 'Nehru Place', zoneType: 'South Commercial & Flyover Hub', lat: 28.5494, lon: 77.2519, pm25Factor: 1.02, pm10Factor: 1.04, no2Factor: 1.10 },
      { id: 'mayur-vihar', name: 'Mayur Vihar', zoneType: 'East Yamuna Floodplain Residential', lat: 28.6046, lon: 77.2947, pm25Factor: 1.00, pm10Factor: 1.04, no2Factor: 1.02 },
      { id: 'punjabi-bagh', name: 'Punjabi Bagh', zoneType: 'West Ring Road Junction', lat: 28.6686, lon: 77.1311, pm25Factor: 1.06, pm10Factor: 1.12, no2Factor: 1.14 },
      { id: 'pitampura', name: 'Pitampura', zoneType: 'North-West Metro & Residential', lat: 28.7033, lon: 77.1323, pm25Factor: 1.02, pm10Factor: 1.06, no2Factor: 1.04 },
      { id: 'noida-sector-62', name: 'Noida Sector 62', aliases: ['noida', 'sector 62 noida'], zoneType: 'NCR East Tech & Expressway', lat: 28.6279, lon: 77.3649, pm25Factor: 1.04, pm10Factor: 1.10, no2Factor: 1.08 },
      { id: 'gurugram-cyber-city', name: 'Gurugram Cyber City', aliases: ['gurugram', 'gurgaon', 'cyber city'], zoneType: 'NCR South-West Highway & IT Hub', lat: 28.4950, lon: 77.0895, pm25Factor: 1.02, pm10Factor: 1.10, no2Factor: 1.10 },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    aliases: ['madras'],
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
    timezone: 'Asia/Kolkata',
    basePm25: 24,
    basePm10: 49,
    baseNo2: 29,
    tempC: 30,
    humidityPct: 75,
    windKmh: 16,
    neighborhoods: [
      { id: 'adyar', name: 'Adyar', zoneType: 'Coastal Tree Canopy & Estuary', lat: 13.0012, lon: 80.2565, pm25Factor: 0.90, pm10Factor: 0.88, no2Factor: 0.86 },
      { id: 't-nagar', name: 'T. Nagar', aliases: ['t nagar', 'thyagaraya nagar'], zoneType: 'Dense Commercial & Bus Corridor', lat: 13.0418, lon: 80.2341, pm25Factor: 1.06, pm10Factor: 1.12, no2Factor: 1.16 },
      { id: 'velachery', name: 'Velachery', zoneType: 'IT Arterial & Junction Basin', lat: 12.9815, lon: 80.2180, pm25Factor: 1.07, pm10Factor: 1.14, no2Factor: 1.14 },
      { id: 'anna-nagar', name: 'Anna Nagar', zoneType: 'North-West Planned Grid', lat: 13.0850, lon: 80.2101, pm25Factor: 0.95, pm10Factor: 0.96, no2Factor: 0.98 },
      { id: 'besant-nagar', name: 'Besant Nagar', aliases: ['elliots beach'], zoneType: 'Open Coastline & Sea Breeze', lat: 13.0003, lon: 80.2667, pm25Factor: 0.88, pm10Factor: 0.85, no2Factor: 0.84 },
      { id: 'omr-sholinganallur', name: 'OMR Sholinganallur', aliases: ['omr', 'sholinganallur'], zoneType: 'South IT Highway Corridor', lat: 12.9010, lon: 80.2279, pm25Factor: 1.03, pm10Factor: 1.08, no2Factor: 1.08 },
      { id: 'guindy', name: 'Guindy', zoneType: 'Industrial Estate & Park Edge', lat: 13.0067, lon: 80.2206, pm25Factor: 1.06, pm10Factor: 1.14, no2Factor: 1.16 },
      { id: 'mylapore', name: 'Mylapore', zoneType: 'Heritage Coastal Residential', lat: 13.0368, lon: 80.2676, pm25Factor: 0.94, pm10Factor: 0.92, no2Factor: 0.95 },
      { id: 'tambaram', name: 'Tambaram', zoneType: 'South Rail & GST Highway', lat: 12.9249, lon: 80.1000, pm25Factor: 1.02, pm10Factor: 1.08, no2Factor: 1.06 },
      { id: 'porur', name: 'Porur', zoneType: 'West Lake & Outer Ring Junction', lat: 13.0382, lon: 80.1565, pm25Factor: 1.04, pm10Factor: 1.10, no2Factor: 1.08 },
      { id: 'thiruvanmiyur', name: 'Thiruvanmiyur', zoneType: 'East Coast Road & Breeze Belt', lat: 12.9830, lon: 80.2594, pm25Factor: 0.91, pm10Factor: 0.90, no2Factor: 0.89 },
      { id: 'nungambakkam', name: 'Nungambakkam', zoneType: 'Central Urban & Institutional', lat: 13.0569, lon: 80.2425, pm25Factor: 0.99, pm10Factor: 1.00, no2Factor: 1.04 },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    aliases: ['bombay'],
    country: 'India',
    lat: 19.076,
    lon: 72.8777,
    timezone: 'Asia/Kolkata',
    basePm25: 56,
    basePm10: 108,
    baseNo2: 46,
    tempC: 29,
    humidityPct: 72,
    windKmh: 14,
    neighborhoods: [
      { id: 'bandra-west', name: 'Bandra West', aliases: ['bandra'], zoneType: 'Coastal Promenade & Arterial', lat: 19.0596, lon: 72.8295, pm25Factor: 0.92, pm10Factor: 0.92, no2Factor: 0.94 },
      { id: 'colaba', name: 'Colaba', zoneType: 'Harbor Tip & Sea Breeze', lat: 18.9067, lon: 72.8147, pm25Factor: 0.88, pm10Factor: 0.86, no2Factor: 0.84 },
      { id: 'powai', name: 'Powai', zoneType: 'Inland Lake Basin & Highway', lat: 19.1176, lon: 72.9060, pm25Factor: 1.04, pm10Factor: 1.08, no2Factor: 1.08 },
      { id: 'andheri-east', name: 'Andheri East', aliases: ['andheri'], zoneType: 'Metro Junction & Airport Link', lat: 19.1136, lon: 72.8697, pm25Factor: 1.08, pm10Factor: 1.15, no2Factor: 1.16 },
      { id: 'juhu', name: 'Juhu', zoneType: 'West Coast Beachfront', lat: 19.1075, lon: 72.8263, pm25Factor: 0.90, pm10Factor: 0.90, no2Factor: 0.90 },
      { id: 'dadar', name: 'Dadar', zoneType: 'Central Rail Interchange & Coastal Park', lat: 19.0178, lon: 72.8478, pm25Factor: 1.02, pm10Factor: 1.06, no2Factor: 1.08 },
      { id: 'lower-parel', name: 'Lower Parel', aliases: ['parel'], zoneType: 'Central Business Towers', lat: 18.9982, lon: 72.8300, pm25Factor: 1.01, pm10Factor: 1.04, no2Factor: 1.06 },
      { id: 'worli', name: 'Worli', zoneType: 'Sea Face & Coastal Link', lat: 19.0167, lon: 72.8167, pm25Factor: 0.91, pm10Factor: 0.90, no2Factor: 0.92 },
      { id: 'malad-west', name: 'Malad West', aliases: ['malad'], zoneType: 'West Suburb & Creek Corridor', lat: 19.1874, lon: 72.8484, pm25Factor: 1.03, pm10Factor: 1.08, no2Factor: 1.06 },
      { id: 'borivali', name: 'Borivali', zoneType: 'National Park Edge Residential', lat: 19.2307, lon: 72.8567, pm25Factor: 0.94, pm10Factor: 0.95, no2Factor: 0.92 },
      { id: 'chembur', name: 'Chembur', zoneType: 'East Industrial & Express Highway', lat: 19.0522, lon: 72.9005, pm25Factor: 1.08, pm10Factor: 1.16, no2Factor: 1.14 },
      { id: 'thane-west', name: 'Thane West', aliases: ['thane'], zoneType: 'Creek Suburb & Eastern Express', lat: 19.2183, lon: 72.9781, pm25Factor: 1.03, pm10Factor: 1.08, no2Factor: 1.05 },
      { id: 'vashi', name: 'Vashi', aliases: ['navi mumbai'], zoneType: 'Navi Mumbai Creek Node', lat: 19.0745, lon: 72.9978, pm25Factor: 1.00, pm10Factor: 1.04, no2Factor: 1.02 },
      { id: 'bkc', name: 'BKC', aliases: ['bandra kurla complex'], zoneType: 'Central Financial District', lat: 19.0653, lon: 72.8682, pm25Factor: 1.04, pm10Factor: 1.08, no2Factor: 1.12 },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    aliases: ['hyd', 'cyberabad'],
    country: 'India',
    lat: 17.3850,
    lon: 78.4867,
    timezone: 'Asia/Kolkata',
    basePm25: 38,
    basePm10: 76,
    baseNo2: 36,
    tempC: 27,
    humidityPct: 54,
    windKmh: 12,
    neighborhoods: [
      { id: 'banjara-hills', name: 'Banjara Hills', zoneType: 'Elevated Central Canopy & Hills', lat: 17.4156, lon: 78.4347, pm25Factor: 0.92, pm10Factor: 0.90, no2Factor: 0.92 },
      { id: 'jubilee-hills', name: 'Jubilee Hills', zoneType: 'West Urban Forest & Residential', lat: 17.4326, lon: 78.4071, pm25Factor: 0.91, pm10Factor: 0.89, no2Factor: 0.90 },
      { id: 'gachibowli', name: 'Gachibowli', zoneType: 'West ORR & Financial Campus', lat: 17.4401, lon: 78.3489, pm25Factor: 0.98, pm10Factor: 1.04, no2Factor: 1.02 },
      { id: 'madhapur-hitec', name: 'Madhapur HITEC', aliases: ['madhapur', 'hitec city', 'hitech city'], zoneType: 'IT Park & Metro Corridor', lat: 17.4483, lon: 78.3915, pm25Factor: 1.04, pm10Factor: 1.10, no2Factor: 1.12 },
      { id: 'secunderabad', name: 'Secunderabad', zoneType: 'Twin City Rail & Cantonment', lat: 17.4399, lon: 78.4983, pm25Factor: 1.01, pm10Factor: 1.04, no2Factor: 1.06 },
      { id: 'kondapur', name: 'Kondapur', zoneType: 'West Residential & Botanical Edge', lat: 17.4622, lon: 78.3568, pm25Factor: 0.97, pm10Factor: 1.00, no2Factor: 0.99 },
      { id: 'kukatpally', name: 'Kukatpally', aliases: ['kphb'], zoneType: 'North-West Dense Metro Arterial', lat: 17.4948, lon: 78.3996, pm25Factor: 1.06, pm10Factor: 1.12, no2Factor: 1.12 },
      { id: 'begumpet', name: 'Begumpet', zoneType: 'Central Highway & Tank Bund Edge', lat: 17.4436, lon: 78.4660, pm25Factor: 1.02, pm10Factor: 1.04, no2Factor: 1.08 },
      { id: 'charminar', name: 'Charminar', zoneType: 'Old City Heritage Market Basin', lat: 17.3616, lon: 78.4747, pm25Factor: 1.05, pm10Factor: 1.10, no2Factor: 1.12 },
      { id: 'somajiguda', name: 'Somajiguda', zoneType: 'Central Commercial Circle', lat: 17.4265, lon: 78.4593, pm25Factor: 1.01, pm10Factor: 1.03, no2Factor: 1.06 },
      { id: 'lb-nagar', name: 'LB Nagar', aliases: ['l b nagar'], zoneType: 'South-East Ring Highway Hub', lat: 17.3457, lon: 78.5522, pm25Factor: 1.05, pm10Factor: 1.12, no2Factor: 1.10 },
      { id: 'uppal', name: 'Uppal', zoneType: 'East Industrial & Metro Terminal', lat: 17.4058, lon: 78.5591, pm25Factor: 1.05, pm10Factor: 1.12, no2Factor: 1.10 },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    aliases: ['poona'],
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
    timezone: 'Asia/Kolkata',
    basePm25: 36,
    basePm10: 74,
    baseNo2: 33,
    tempC: 26,
    humidityPct: 52,
    windKmh: 13,
    neighborhoods: [
      { id: 'koregaon-park', name: 'Koregaon Park', aliases: ['kp'], zoneType: 'Tree-Lined Riverside Canopy', lat: 18.5362, lon: 73.8940, pm25Factor: 0.90, pm10Factor: 0.87, no2Factor: 0.90 },
      { id: 'hinjewadi', name: 'Hinjewadi', aliases: ['hinjawadi'], zoneType: 'North-West IT Park & Expressway', lat: 18.5913, lon: 73.7389, pm25Factor: 1.04, pm10Factor: 1.12, no2Factor: 1.08 },
      { id: 'kothrud', name: 'Kothrud', zoneType: 'West Foothills Residential', lat: 18.5074, lon: 73.8077, pm25Factor: 0.94, pm10Factor: 0.94, no2Factor: 0.95 },
      { id: 'baner', name: 'Baner', zoneType: 'North-West Highway & Residential', lat: 18.5590, lon: 73.7868, pm25Factor: 0.99, pm10Factor: 1.04, no2Factor: 1.02 },
      { id: 'viman-nagar', name: 'Viman Nagar', zoneType: 'East Airport & Tech Corridor', lat: 18.5679, lon: 73.9143, pm25Factor: 1.01, pm10Factor: 1.06, no2Factor: 1.04 },
      { id: 'shivajinagar', name: 'Shivajinagar', aliases: ['shivaji nagar'], zoneType: 'Central Transit & University Edge', lat: 18.5308, lon: 73.8475, pm25Factor: 1.04, pm10Factor: 1.08, no2Factor: 1.12 },
      { id: 'aundh', name: 'Aundh', zoneType: 'North-West Leafy Residential', lat: 18.5580, lon: 73.8075, pm25Factor: 0.93, pm10Factor: 0.92, no2Factor: 0.94 },
      { id: 'hadapsar', name: 'Hadapsar', zoneType: 'East Industrial & Solapur Highway', lat: 18.5089, lon: 73.9259, pm25Factor: 1.06, pm10Factor: 1.14, no2Factor: 1.12 },
      { id: 'wakad', name: 'Wakad', zoneType: 'West Expressway Residential Growth', lat: 18.5987, lon: 73.7606, pm25Factor: 1.02, pm10Factor: 1.08, no2Factor: 1.05 },
      { id: 'kharadi', name: 'Kharadi', zoneType: 'East Riverfront IT Corridor', lat: 18.5515, lon: 73.9348, pm25Factor: 1.01, pm10Factor: 1.06, no2Factor: 1.04 },
      { id: 'camp-pune', name: 'Camp', aliases: ['mg road pune'], zoneType: 'Cantonment Green Grid', lat: 18.5133, lon: 73.8805, pm25Factor: 0.95, pm10Factor: 0.94, no2Factor: 0.98 },
      { id: 'pimpri-chinchwad', name: 'Pimpri Chinchwad', aliases: ['pcmc', 'pimpri'], zoneType: 'North-West Auto & Manufacturing Belt', lat: 18.6298, lon: 73.7997, pm25Factor: 1.06, pm10Factor: 1.14, no2Factor: 1.14 },
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    aliases: ['calcutta'],
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
    timezone: 'Asia/Kolkata',
    basePm25: 68,
    basePm10: 122,
    baseNo2: 44,
    tempC: 27,
    humidityPct: 71,
    windKmh: 9,
    neighborhoods: [
      { id: 'salt-lake', name: 'Salt Lake', aliases: ['bidhannagar', 'sector 5', 'salt lake city'], zoneType: 'Planned East Township & Lakes', lat: 22.5867, lon: 88.4171, pm25Factor: 0.93, pm10Factor: 0.92, no2Factor: 0.94 },
      { id: 'park-street', name: 'Park Street', zoneType: 'Central Maidan Canopy & Business', lat: 22.5535, lon: 88.3526, pm25Factor: 0.98, pm10Factor: 0.98, no2Factor: 1.06 },
      { id: 'ballygunge', name: 'Ballygunge', zoneType: 'South Tree-Lined Residential', lat: 22.5280, lon: 88.3659, pm25Factor: 0.95, pm10Factor: 0.94, no2Factor: 0.98 },
      { id: 'new-town', name: 'New Town', aliases: ['rajarhat'], zoneType: 'East Open Grid & Eco Park', lat: 22.5800, lon: 88.4777, pm25Factor: 0.94, pm10Factor: 0.96, no2Factor: 0.92 },
      { id: 'alipore', name: 'Alipore', zoneType: 'South Green Zoo & Garden Belt', lat: 22.5335, lon: 88.3324, pm25Factor: 0.92, pm10Factor: 0.90, no2Factor: 0.93 },
      { id: 'howrah', name: 'Howrah', zoneType: 'West Hooghly Bridge & Rail Basin', lat: 22.5958, lon: 88.2636, pm25Factor: 1.08, pm10Factor: 1.16, no2Factor: 1.15 },
      { id: 'jadavpur', name: 'Jadavpur', zoneType: 'South University & Transit Road', lat: 22.4989, lon: 88.3714, pm25Factor: 0.99, pm10Factor: 1.02, no2Factor: 1.02 },
      { id: 'behala', name: 'Behala', zoneType: 'South-West Diamond Harbour Road', lat: 22.5015, lon: 88.3168, pm25Factor: 1.03, pm10Factor: 1.08, no2Factor: 1.06 },
      { id: 'dum-dum', name: 'Dum Dum', aliases: ['dumdum'], zoneType: 'North Airport & Metro Junction', lat: 22.6420, lon: 88.4312, pm25Factor: 1.04, pm10Factor: 1.10, no2Factor: 1.08 },
      { id: 'esplanade', name: 'Esplanade', aliases: ['dharmatala'], zoneType: 'Central Transit & River Breeze', lat: 22.5649, lon: 88.3517, pm25Factor: 1.02, pm10Factor: 1.04, no2Factor: 1.10 },
      { id: 'tollygunge', name: 'Tollygunge', zoneType: 'South Canal & Metro Corridor', lat: 22.4981, lon: 88.3454, pm25Factor: 0.97, pm10Factor: 0.98, no2Factor: 0.99 },
      { id: 'garia', name: 'Garia', zoneType: 'South Bypass & Suburban Terminal', lat: 22.4631, lon: 88.3935, pm25Factor: 1.01, pm10Factor: 1.04, no2Factor: 1.03 },
    ],
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5072,
    lon: -0.1276,
    timezone: 'Europe/London',
    basePm25: 9,
    basePm10: 17,
    baseNo2: 26,
    tempC: 13,
    humidityPct: 74,
    windKmh: 18,
    neighborhoods: [
      { id: 'hampstead', name: 'Hampstead', zoneType: 'Heathland Elevated Park', lat: 51.5569, lon: -0.1782, pm25Factor: 0.86, pm10Factor: 0.84, no2Factor: 0.78 },
      { id: 'soho', name: 'Soho', zoneType: 'Central Low-Emission Street Grid', lat: 51.5136, lon: -0.1365, pm25Factor: 1.06, pm10Factor: 1.06, no2Factor: 1.18 },
      { id: 'canary-wharf', name: 'Canary Wharf', zoneType: 'Thames Basin & Docklands', lat: 51.5054, lon: -0.0235, pm25Factor: 1.00, pm10Factor: 1.02, no2Factor: 1.08 },
      { id: 'camden-town', name: 'Camden Town', aliases: ['camden'], zoneType: 'North Canal & Rail Corridor', lat: 51.5390, lon: -0.1426, pm25Factor: 1.02, pm10Factor: 1.04, no2Factor: 1.10 },
      { id: 'kensington', name: 'Kensington', zoneType: 'West Garden Square & Museums', lat: 51.4991, lon: -0.1938, pm25Factor: 0.96, pm10Factor: 0.96, no2Factor: 1.02 },
      { id: 'greenwich', name: 'Greenwich', zoneType: 'Royal Park & Thames Peninsula', lat: 51.4826, lon: 0.0077, pm25Factor: 0.92, pm10Factor: 0.92, no2Factor: 0.94 },
      { id: 'shoreditch', name: 'Shoreditch', zoneType: 'East City Fringe & Arterial', lat: 51.5229, lon: -0.0777, pm25Factor: 1.04, pm10Factor: 1.06, no2Factor: 1.12 },
      { id: 'brixton', name: 'Brixton', zoneType: 'South Urban Town Center', lat: 51.4613, lon: -0.1156, pm25Factor: 1.03, pm10Factor: 1.04, no2Factor: 1.10 },
      { id: 'wimbledon', name: 'Wimbledon', zoneType: 'South-West Common & Leafy Suburb', lat: 51.4214, lon: -0.2064, pm25Factor: 0.88, pm10Factor: 0.88, no2Factor: 0.84 },
      { id: 'stratford', name: 'Stratford', zoneType: 'East Olympic Park & Rail Hub', lat: 51.5416, lon: -0.0033, pm25Factor: 1.01, pm10Factor: 1.04, no2Factor: 1.08 },
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    aliases: ['nyc', 'new york city'],
    country: 'United States',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
    basePm25: 13,
    basePm10: 24,
    baseNo2: 31,
    tempC: 15,
    humidityPct: 55,
    windKmh: 16,
    neighborhoods: [
      { id: 'astoria', name: 'Astoria', zoneType: 'East River Residential', lat: 40.7644, lon: -73.9235, pm25Factor: 0.92, pm10Factor: 0.92, no2Factor: 0.90 },
      { id: 'brooklyn-heights', name: 'Brooklyn Heights', zoneType: 'Waterfront Promenade', lat: 40.6960, lon: -73.9933, pm25Factor: 0.94, pm10Factor: 0.94, no2Factor: 0.94 },
      { id: 'midtown', name: 'Midtown Manhattan', aliases: ['midtown'], zoneType: 'High-Density Avenue Canyon', lat: 40.7549, lon: -73.9840, pm25Factor: 1.08, pm10Factor: 1.12, no2Factor: 1.22 },
      { id: 'upper-west-side', name: 'Upper West Side', aliases: ['uws'], zoneType: 'Riverside & Central Park Edge', lat: 40.7870, lon: -73.9754, pm25Factor: 0.91, pm10Factor: 0.90, no2Factor: 0.92 },
      { id: 'soho-nyc', name: 'SoHo NYC', aliases: ['soho manhattan'], zoneType: 'Lower Manhattan Canal Corridor', lat: 40.7233, lon: -74.0030, pm25Factor: 1.04, pm10Factor: 1.06, no2Factor: 1.14 },
      { id: 'williamsburg', name: 'Williamsburg', zoneType: 'East River Waterfront & Expressway', lat: 40.7081, lon: -73.9571, pm25Factor: 1.00, pm10Factor: 1.02, no2Factor: 1.04 },
      { id: 'harlem', name: 'Harlem', zoneType: 'Upper Manhattan & River Park', lat: 40.8116, lon: -73.9465, pm25Factor: 0.98, pm10Factor: 1.00, no2Factor: 1.02 },
      { id: 'financial-district', name: 'Financial District', aliases: ['fidi', 'wall street'], zoneType: 'Harbor Tip & Ferry Terminal', lat: 40.7075, lon: -74.0113, pm25Factor: 0.98, pm10Factor: 1.00, no2Factor: 1.06 },
      { id: 'flushing', name: 'Flushing', zoneType: 'Queens Bay & Meadow Park', lat: 40.7675, lon: -73.8331, pm25Factor: 0.97, pm10Factor: 1.00, no2Factor: 0.99 },
      { id: 'greenwich-village', name: 'Greenwich Village', aliases: ['west village'], zoneType: 'Tree-Lined Historic Street Grid', lat: 40.7336, lon: -74.0027, pm25Factor: 0.96, pm10Factor: 0.96, no2Factor: 1.00 },
    ],
  },
];

export function getAqiStatus(aqi: number): AqiStatus {
  if (aqi <= 50) return 'Good';
  if (aqi <= 150) return 'Moderate';
  if (aqi <= 220) return 'Poor';
  return 'Severe';
}

function interpolateBps(val: number, bps: [number, number, number, number][], maxVal: number): number {
  const c = Math.max(0, val);
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  return maxVal;
}

// Official India CPCB National AQI (NAQI) breakpoints
export function computeIndiaNaqi(pm25: number, pm10: number, no2: number): number {
  const subPm25 = interpolateBps(
    pm25,
    [
      [0, 30, 0, 50],
      [30, 60, 51, 100],
      [60, 90, 101, 200],
      [90, 120, 201, 300],
      [120, 250, 301, 400],
      [250, 500, 401, 500],
    ],
    500
  );
  const subPm10 = interpolateBps(
    pm10,
    [
      [0, 50, 0, 50],
      [50, 100, 51, 100],
      [100, 250, 101, 200],
      [250, 350, 201, 300],
      [350, 430, 301, 400],
      [430, 650, 401, 500],
    ],
    500
  );
  const subNo2 = interpolateBps(
    no2,
    [
      [0, 40, 0, 50],
      [40, 80, 51, 100],
      [80, 180, 101, 200],
      [180, 280, 201, 300],
      [280, 400, 301, 400],
      [400, 600, 401, 500],
    ],
    500
  );
  return Math.max(10, Math.min(500, Math.max(subPm25, subPm10, subNo2)));
}

export function getIndiaNaqiStatus(naqi: number): string {
  if (naqi <= 50) return 'Good';
  if (naqi <= 100) return 'Satisfactory';
  if (naqi <= 200) return 'Moderate';
  if (naqi <= 300) return 'Poor';
  if (naqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function pm25ToAqi(pm25: number): number {
  const c = Math.max(0, pm25);
  // US EPA 2024 PM2.5 AQI breakpoints (continuous bounds)
  const bps: [number, number, number, number][] = [
    [0, 9.0, 0, 50],
    [9.0, 35.4, 51, 100],
    [35.4, 55.4, 101, 150],
    [55.4, 125.4, 151, 200],
    [125.4, 225.4, 201, 300],
    [225.4, 500.4, 301, 500],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  return 500;
}

export function pm10ToAqi(pm10: number): number {
  const c = Math.max(0, pm10);
  const bps: [number, number, number, number][] = [
    [0, 54, 0, 50],
    [54, 154, 51, 100],
    [154, 254, 101, 150],
    [254, 354, 151, 200],
    [354, 424, 201, 300],
    [424, 604, 301, 500],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  return 500;
}

export function no2ToAqi(no2Ugm3: number): number {
  // Convert ug/m3 to ppb approx (1 ppb NO2 ≈ 1.88 ug/m3)
  const ppb = Math.max(0, no2Ugm3 / 1.88);
  const bps: [number, number, number, number][] = [
    [0, 53, 0, 50],
    [53, 100, 51, 100],
    [100, 360, 101, 150],
    [360, 649, 151, 200],
    [649, 1249, 201, 300],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (ppb <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (ppb - cLow) + iLow);
    }
  }
  return 350;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function matchPresetByNameOrAlias(query: string): CityPreset | undefined {
  const q = query.trim().toLowerCase();
  return CITY_PRESETS.find(
    (c) =>
      c.name.toLowerCase() === q ||
      c.id === q ||
      c.aliases?.some((a) => a === q)
  );
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function matchNeighborhood(
  preset: CityPreset,
  query: string
): NeighborhoodPreset | undefined {
  const q = query.trim().toLowerCase();
  const qNorm = q.replace(/[^a-z0-9]/g, '');
  if (!qNorm) return undefined;

  // 1. Exact name, id, or alias match
  const exact = preset.neighborhoods.find((n) => {
    const nNorm = n.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n.name.toLowerCase() === q || n.id === q || nNorm === qNorm) return true;
    return n.aliases?.some(
      (a) => a === q || a.replace(/[^a-z0-9]/g, '') === qNorm
    );
  });
  if (exact) return exact;

  // 2. Conservative typo tolerance (e.g. "Jaynagar" -> "Jayanagar", "Malleshwaram" -> "Malleswaram")
  if (qNorm.length >= 6) {
    const maxDist = qNorm.length >= 10 ? 2 : 1;
    let best: { nb: NeighborhoodPreset; dist: number } | null = null;
    for (const n of preset.neighborhoods) {
      const nNorm = n.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (nNorm[0] !== qNorm[0]) continue;
      if (Math.abs(nNorm.length - qNorm.length) > maxDist) continue;
      const d = levenshtein(qNorm, nNorm);
      if (d <= maxDist && (!best || d < best.dist)) {
        best = { nb: n, dist: d };
      }
    }
    if (best) return best.nb;
  }

  return undefined;
}

export function resolveCityAndNeighborhood(
  cityQuery: string,
  neighborhoodQuery?: string
): {
  preset?: CityPreset;
  neighborhood?: NeighborhoodPreset;
  resolvedCityName: string;
  resolvedNeighborhoodName?: string;
} {
  const cleanCity = cityQuery.trim();
  const cleanNb = neighborhoodQuery?.trim();

  // Check if user typed "Area, City" or "City - Area" in city search
  const parts = cleanCity.split(/[,-]/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 2) {
    const firstCity = matchPresetByNameOrAlias(parts[0]);
    const secondCity = matchPresetByNameOrAlias(parts[1]);
    if (firstCity) {
      const nb = matchNeighborhood(firstCity, cleanNb || parts[1]);
      return {
        preset: firstCity,
        neighborhood: nb,
        resolvedCityName: firstCity.name,
        resolvedNeighborhoodName: nb?.name ?? (cleanNb || parts[1]),
      };
    }
    if (secondCity) {
      const nb = matchNeighborhood(secondCity, cleanNb || parts[0]);
      return {
        preset: secondCity,
        neighborhood: nb,
        resolvedCityName: secondCity.name,
        resolvedNeighborhoodName: nb?.name ?? (cleanNb || parts[0]),
      };
    }
  }

  // Direct city or alias match (e.g., "Bangalore" -> "Bengaluru")
  const directPreset = matchPresetByNameOrAlias(cleanCity);
  if (directPreset) {
    const nb = cleanNb ? matchNeighborhood(directPreset, cleanNb) : undefined;
    return {
      preset: directPreset,
      neighborhood: nb ?? (cleanNb ? undefined : directPreset.neighborhoods[0]),
      resolvedCityName: directPreset.name,
      resolvedNeighborhoodName:
        nb?.name ?? cleanNb ?? directPreset.neighborhoods[0].name,
    };
  }

  // Check if user typed a neighborhood name directly in the city search box (e.g. "HSR Layout", "Peenya", "Whitefield")
  for (const preset of CITY_PRESETS) {
    const nbMatch = matchNeighborhood(preset, cleanCity);
    if (nbMatch) {
      return {
        preset,
        neighborhood: nbMatch,
        resolvedCityName: preset.name,
        resolvedNeighborhoodName: nbMatch.name,
      };
    }
  }

  // Check if query starts/ends with city + area like "Whitefield Bangalore" or "Bandra Mumbai"
  const lower = cleanCity.toLowerCase();
  for (const preset of CITY_PRESETS) {
    const tokens = [preset.name.toLowerCase(), ...(preset.aliases ?? [])];
    for (const token of tokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tokenRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (tokenRegex.test(lower)) {
        const remainder = lower.replace(tokenRegex, '').trim();
        const nbMatch = remainder ? matchNeighborhood(preset, remainder) : undefined;
        const displayNb =
          nbMatch?.name ??
          (remainder
            ? remainder
                .split(/\s+/)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
            : preset.neighborhoods[0].name);
        return {
          preset,
          neighborhood: nbMatch,
          resolvedCityName: preset.name,
          resolvedNeighborhoodName: cleanNb || displayNb,
        };
      }
    }
  }

  return {
    resolvedCityName: cleanCity,
    resolvedNeighborhoodName: cleanNb,
  };
}

export function getCustomNeighborhoodFactors(
  cityName: string,
  neighborhoodName: string
): NeighborhoodPreset {
  const q = neighborhoodName.toLowerCase();
  const seed = hashSeed(`${cityName.toLowerCase()}::${q}`);

  // Infer urban micro-corridor type from common neighborhood keywords
  const isIndustrialOrJunction =
    /\b(industrial|estate|junction|flyover|highway|orr|ring|terminal|bypass|toll|silk|peenya|tin factory)\b/.test(
      q
    );
  const isGreenOrPark =
    /\b(park|garden|lake|woods|hills|heights|heath|grove|cantonment|sadashiva|cubbon|lalbagh)\b/.test(
      q
    );

  let pm25Factor = 0.94 + (seed % 13) * 0.01; // 0.94 - 1.06 (regional PM2.5 varies gently)
  let pm10Factor = 0.92 + (seed % 22) * 0.01;
  let no2Factor = 0.92 + ((seed >> 3) % 22) * 0.01;

  if (isIndustrialOrJunction) {
    pm25Factor = Math.max(pm25Factor, 1.06);
    pm10Factor = Math.max(pm10Factor, 1.16);
    no2Factor = Math.max(no2Factor, 1.15);
  } else if (isGreenOrPark) {
    pm25Factor = Math.min(pm25Factor, 0.91);
    pm10Factor = Math.min(pm10Factor, 0.87);
    no2Factor = Math.min(no2Factor, 0.89);
  }

  const displayNb = neighborhoodName
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: q.replace(/[^a-z0-9]+/g, '-'),
    name: displayNb,
    zoneType: isIndustrialOrJunction
      ? 'Traffic & Industrial Corridor'
      : isGreenOrPark
      ? 'Green Canopy Micro-Zone'
      : 'Local Urban Ward',
    pm25Factor: Number(pm25Factor.toFixed(2)),
    pm10Factor: Number(pm10Factor.toFixed(2)),
    no2Factor: Number(no2Factor.toFixed(2)),
  };
}

// Diurnal traffic + atmospheric boundary layer multipliers for 24h curve
const DIURNAL_FACTORS = [
  0.84, 0.78, 0.72, 0.68, 0.66, 0.70, // 00:00 - 05:00 (overnight / early clean)
  0.82, 1.04, 1.24, 1.28, 1.12, 0.94, // 06:00 - 11:00 (morning rush)
  0.82, 0.74, 0.71, 0.73, 0.84, 1.06, // 12:00 - 17:00 (midday dispersion -> evening buildup)
  1.26, 1.34, 1.28, 1.16, 1.02, 0.92, // 18:00 - 23:00 (evening peak traffic)
];

export function formatHourLabel(hour24: number): string {
  if (hour24 === 0) return '12 AM';
  if (hour24 < 12) return `${hour24} AM`;
  if (hour24 === 12) return '12 PM';
  return `${hour24 - 12} PM`;
}

export function computeWindows(hourly: HourlyPoint[]): {
  cleanestWindow: { label: string; avgAqi: number };
  peakTrafficWindow: { label: string; avgAqi: number };
} {
  let bestStart = 0;
  let bestAvg = Infinity;
  let worstStart = 0;
  let worstAvg = -Infinity;

  for (let i = 0; i <= hourly.length - 3; i++) {
    const avg = (hourly[i].aqi + hourly[i + 1].aqi + hourly[i + 2].aqi) / 3;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
    if (avg > worstAvg) {
      worstAvg = avg;
      worstStart = i;
    }
  }

  return {
    cleanestWindow: {
      label: `${formatHourLabel(hourly[bestStart].hour24)} – ${formatHourLabel((hourly[bestStart].hour24 + 3) % 24)}`,
      avgAqi: Math.round(bestAvg),
    },
    peakTrafficWindow: {
      label: `${formatHourLabel(hourly[worstStart].hour24)} – ${formatHourLabel((hourly[worstStart].hour24 + 3) % 24)}`,
      avgAqi: Math.round(worstAvg),
    },
  };
}

export function classifyHourBand(aqi: number, minAqi: number, maxAqi: number): 'clean' | 'moderate' | 'peak' {
  if (aqi >= 180) return 'peak';
  if (aqi <= 65) return 'clean';
  const span = Math.max(15, maxAqi - minAqi);
  const rel = (aqi - minAqi) / span;
  if (rel <= 0.34) return 'clean';
  if (rel >= 0.74) return 'peak';
  return 'moderate';
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findClosestPresetByCoords(
  lat: number,
  lon: number
): { preset: CityPreset; neighborhood?: NeighborhoodPreset; distanceKm: number } | null {
  let bestCity: { preset: CityPreset; distanceKm: number } | null = null;
  for (const preset of CITY_PRESETS) {
    const d = haversineKm(lat, lon, preset.lat, preset.lon);
    if (d <= 35 && (!bestCity || d < bestCity.distanceKm)) {
      bestCity = { preset, distanceKm: d };
    }
  }
  if (!bestCity) return null;

  let bestNb: { nb: NeighborhoodPreset; d: number } | null = null;
  for (const nb of bestCity.preset.neighborhoods) {
    if (nb.lat !== undefined && nb.lon !== undefined) {
      const d = haversineKm(lat, lon, nb.lat, nb.lon);
      if (d <= 7 && (!bestNb || d < bestNb.d)) {
        bestNb = { nb, d };
      }
    }
  }

  return {
    preset: bestCity.preset,
    neighborhood: bestNb?.nb,
    distanceKm: bestCity.distanceKm,
  };
}

export function buildSimulatedDailyOutlook(
  baseHourly: HourlyPoint[],
  baseIndiaAqi: number,
  seedKey: string
): DailyOutlookPoint[] {
  const now = new Date();
  const minToday = Math.min(...baseHourly.map((h) => h.aqi));
  const avgToday = Math.round(
    baseHourly.reduce((acc, h) => acc + h.aqi, 0) / baseHourly.length
  );
  const maxToday = Math.max(...baseHourly.map((h) => h.aqi));
  const { cleanestWindow } = computeWindows(baseHourly);

  const offsets = [0, 1, 2];
  return offsets.map((offset) => {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    const dateIso = d.toISOString().slice(0, 10);
    const dayLabel =
      offset === 0
        ? 'Today'
        : offset === 1
        ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (offset === 0) {
      return {
        dayLabel,
        dateIso,
        minAqi: minToday,
        avgAqi: avgToday,
        maxAqi: maxToday,
        indiaAvgAqi: baseIndiaAqi,
        status: getAqiStatus(avgToday),
        indiaStatus: getIndiaNaqiStatus(baseIndiaAqi),
        bestWindowLabel: cleanestWindow.label,
      };
    }

    const drift = ((hashSeed(`${seedKey}-day-${offset}`) % 17) - 8) * 0.015;
    const scale = 1 + drift;
    const minAqi = Math.max(12, Math.round(minToday * scale));
    const avgAqi = Math.max(15, Math.round(avgToday * scale));
    const maxAqi = Math.max(avgAqi, Math.round(maxToday * scale));
    const indiaAvgAqi = Math.max(12, Math.round(baseIndiaAqi * scale));

    return {
      dayLabel,
      dateIso,
      minAqi,
      avgAqi,
      maxAqi,
      indiaAvgAqi,
      status: getAqiStatus(avgAqi),
      indiaStatus: getIndiaNaqiStatus(indiaAvgAqi),
      bestWindowLabel: cleanestWindow.label,
    };
  });
}

export function buildSimulatedAirQuality(
  cityName: string,
  neighborhoodName?: string
): AirQualityPayload {
  const resolved = resolveCityAndNeighborhood(cityName, neighborhoodName);
  const preset = resolved.preset;
  const currentHour = new Date().getHours();

  if (preset) {
    const nb =
      resolved.neighborhood ??
      (resolved.resolvedNeighborhoodName
        ? getCustomNeighborhoodFactors(preset.name, resolved.resolvedNeighborhoodName)
        : preset.neighborhoods[0]);

    const pm25 = Number((preset.basePm25 * nb.pm25Factor).toFixed(1));
    const pm10 = Number((preset.basePm10 * nb.pm10Factor).toFixed(1));
    const no2 = Number((preset.baseNo2 * nb.no2Factor).toFixed(1));

    const aqiPm25 = pm25ToAqi(pm25);
    const aqiPm10 = pm10ToAqi(pm10);
    const aqiNo2 = no2ToAqi(no2);
    const aqi = Math.max(10, Math.min(480, Math.max(aqiPm25, aqiPm10, aqiNo2)));
    const status = getAqiStatus(aqi);

    const dominantPollutant =
      aqiPm25 >= aqiPm10 && aqiPm25 >= aqiNo2
        ? 'PM2.5'
        : aqiPm10 >= aqiNo2
        ? 'PM10'
        : 'NO2';

    const rawHours = DIURNAL_FACTORS.map((factor, hour24) => {
      const jitter = ((hashSeed(`${preset.id}-${nb.id}-${hour24}`) % 9) - 4) * 0.015;
      const hPm25 = Number((pm25 * (factor + jitter)).toFixed(1));
      const hPm10 = Number((pm10 * (factor + jitter)).toFixed(1));
      const hNo2 = Number((no2 * (factor + jitter * 1.4)).toFixed(1));
      const hAqi = Math.max(
        10,
        Math.min(480, Math.max(pm25ToAqi(hPm25), pm10ToAqi(hPm10), no2ToAqi(hNo2)))
      );
      return { hour24, hAqi, hPm25, hNo2 };
    });

    const minAqi = Math.min(...rawHours.map((h) => h.hAqi));
    const maxAqi = Math.max(...rawHours.map((h) => h.hAqi));

    const hourly: HourlyPoint[] = rawHours.map((h) => ({
      hourLabel: formatHourLabel(h.hour24),
      hour24: h.hour24,
      aqi: h.hAqi,
      pm25: h.hPm25,
      no2: h.hNo2,
      status: getAqiStatus(h.hAqi),
      band: classifyHourBand(h.hAqi, minAqi, maxAqi),
      isCurrentHour: h.hour24 === currentHour,
    }));

    const windows = computeWindows(hourly);
    const indiaAqi = computeIndiaNaqi(pm25, pm10, no2);
    const dailyOutlook = buildSimulatedDailyOutlook(hourly, indiaAqi, `${preset.id}-${nb.id}`);

    return {
      city: preset.name,
      country: preset.country,
      neighborhood: nb.name,
      zoneType: nb.zoneType,
      aqi,
      status,
      indiaAqi,
      indiaStatus: getIndiaNaqiStatus(indiaAqi),
      dominantPollutant,
      pm25,
      pm10,
      no2,
      tempC: preset.tempC,
      humidityPct: preset.humidityPct,
      windKmh: preset.windKmh,
      updatedAt: new Date().toISOString(),
      source: 'calibrated',
      sourceLabel: 'Offline Area Estimate (Historical Pattern)',
      hourly,
      dailyOutlook,
      ...windows,
    };
  }

  // Deterministic realistic fallback for any custom city typed by user
  const seed = hashSeed(cityName.trim().toLowerCase() || 'urban-center');
  const pm25 = Number((12 + (seed % 75)).toFixed(1));
  const pm10 = Number((pm25 * (1.75 + (seed % 5) * 0.1)).toFixed(1));
  const no2 = Number((18 + (seed % 46)).toFixed(1));
  const aqi = Math.max(pm25ToAqi(pm25), pm10ToAqi(pm10), no2ToAqi(no2));
  const status = getAqiStatus(aqi);

  const rawHours = DIURNAL_FACTORS.map((factor, hour24) => {
    const jitter = ((hashSeed(`${cityName.toLowerCase()}-${hour24}`) % 9) - 4) * 0.015;
    const hPm25 = Number((pm25 * (factor + jitter)).toFixed(1));
    const hPm10 = Number((pm10 * (factor + jitter)).toFixed(1));
    const hNo2 = Number((no2 * (factor + jitter)).toFixed(1));
    const hAqi = Math.max(
      10,
      Math.min(480, Math.max(pm25ToAqi(hPm25), pm10ToAqi(hPm10), no2ToAqi(hNo2)))
    );
    return { hour24, hAqi, hPm25, hNo2 };
  });
  const minAqi = Math.min(...rawHours.map((h) => h.hAqi));
  const maxAqi = Math.max(...rawHours.map((h) => h.hAqi));

  const hourly: HourlyPoint[] = rawHours.map((h) => ({
    hourLabel: formatHourLabel(h.hour24),
    hour24: h.hour24,
    aqi: h.hAqi,
    pm25: h.hPm25,
    no2: h.hNo2,
    status: getAqiStatus(h.hAqi),
    band: classifyHourBand(h.hAqi, minAqi, maxAqi),
    isCurrentHour: h.hour24 === currentHour,
  }));

  const windows = computeWindows(hourly);
  const displayCity = cityName
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const indiaAqi = computeIndiaNaqi(pm25, pm10, no2);
  const dailyOutlook = buildSimulatedDailyOutlook(hourly, indiaAqi, displayCity || 'metropolis');

  return {
    city: displayCity || 'Metropolis',
    country: 'Regional Grid',
    neighborhood: neighborhoodName?.trim() || 'City Center',
    zoneType: 'Urban Area',
    aqi,
    status,
    indiaAqi,
    indiaStatus: getIndiaNaqiStatus(indiaAqi),
    dominantPollutant: pm25ToAqi(pm25) >= pm10ToAqi(pm10) ? 'PM2.5' : 'PM10',
    pm25,
    pm10,
    no2,
    tempC: 18 + (seed % 14),
    humidityPct: 45 + (seed % 35),
    windKmh: 7 + (seed % 15),
    updatedAt: new Date().toISOString(),
    source: 'calibrated',
    sourceLabel: 'Offline Area Estimate (Historical Pattern)',
    hourly,
    dailyOutlook,
    ...windows,
  };
}
