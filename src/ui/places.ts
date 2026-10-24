// A small bundled list of cities so users can pick a birthplace without an
// external geocoding API (keeps the app fully static). Users can also enter
// latitude/longitude manually. tz is the IANA timezone name.

export interface Place {
  name: string
  country: string
  lat: number
  lon: number
  tz: string
}

export const PLACES: Place[] = [
  { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad', country: 'India', lat: 17.385, lon: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'Pune', country: 'India', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
  { name: 'Ahmedabad', country: 'India', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
  { name: 'Varanasi', country: 'India', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.324, tz: 'Asia/Kathmandu' },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612, tz: 'Asia/Colombo' },
]
