/**
 * OpenStreetMap Nominatim Geocoding & Reverse Geocoding utility
 * Free, client-safe geocoding for Indian addresses, pincodes, and GPS coordinates
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  displayName: string;
}

export interface PopularArea {
  name: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export const PUNE_POPULAR_AREAS: PopularArea[] = [
  {
    name: "Shivajinagar / FC Road",
    area: "Shivajinagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411005",
    latitude: 18.5314,
    longitude: 73.8446,
  },
  {
    name: "Kothrud / Paud Road",
    area: "Kothrud",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411038",
    latitude: 18.5074,
    longitude: 73.8077,
  },
  {
    name: "Viman Nagar / Airport Rd",
    area: "Viman Nagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411014",
    latitude: 18.5679,
    longitude: 73.9143,
  },
  {
    name: "Baner / Balewadi",
    area: "Baner",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411045",
    latitude: 18.5590,
    longitude: 73.7868,
  },
  {
    name: "Wakad / Hinjawadi",
    area: "Wakad",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411057",
    latitude: 18.5987,
    longitude: 73.7684,
  },
  {
    name: "Aundh / University Road",
    area: "Aundh",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411007",
    latitude: 18.5580,
    longitude: 73.8070,
  },
  {
    name: "Kalyani Nagar / KP",
    area: "Kalyani Nagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411006",
    latitude: 18.5463,
    longitude: 73.9033,
  },
  {
    name: "Hadapsar / Magarpatta",
    area: "Hadapsar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    latitude: 18.5089,
    longitude: 73.9260,
  },
];

const NOMINATIM_HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'KMart-Grocery-App/1.0 (support@kmart.com)',
};

export async function geocodeAddress(query: {
  line1?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): Promise<GeocodeResult> {
  // 1. Try Google Maps Geocoder first if loaded in browser
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const parts = [query.line1, query.area, query.city, query.pincode, query.state, 'India']
        .filter(Boolean)
        .join(', ');
      const res = await new Promise<any>((resolve) => {
        geocoder.geocode({ address: parts }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]?.geometry?.location) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        });
      });
      if (res && res.geometry?.location) {
        const loc = res.geometry.location;
        return {
          latitude: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
          longitude: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
          displayName: res.formatted_address || parts,
        };
      }
    } catch (e) {
      console.warn('[geocodeAddress google] error:', e);
    }
  }

  // 2. Nominatim with full query
  try {
    const parts = [query.line1, query.area, query.city, query.pincode, 'India']
      .filter(Boolean)
      .join(', ');

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      parts
    )}&limit=1`;

    const res = await fetch(url, {
      headers: NOMINATIM_HEADERS,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    }

    // 2b. If line1 had a specific flat/house number that Nominatim didn't match, search by area + city + pin
    if (query.area || query.city) {
      const fallbackParts = [query.area, query.city, query.pincode, 'India']
        .filter(Boolean)
        .join(', ');
      if (fallbackParts !== parts) {
        const areaUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fallbackParts
        )}&limit=1`;
        const areaRes = await fetch(areaUrl, { headers: NOMINATIM_HEADERS });
        if (areaRes.ok) {
          const areaData = await areaRes.json();
          if (areaData && areaData.length > 0) {
            return {
              latitude: parseFloat(areaData[0].lat),
              longitude: parseFloat(areaData[0].lon),
              displayName: areaData[0].display_name,
            };
          }
        }
      }
    }

    // 2c. Fallback: try just pincode + India
    if (query.pincode) {
      const pinUrl = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(
        query.pincode
      )}&country=India&limit=1`;
      const pinRes = await fetch(pinUrl, {
        headers: NOMINATIM_HEADERS,
      });
      if (pinRes.ok) {
        const pinData = await pinRes.json();
        if (pinData && pinData.length > 0) {
          return {
            latitude: parseFloat(pinData[0].lat),
            longitude: parseFloat(pinData[0].lon),
            displayName: pinData[0].display_name,
          };
        }
      }
    }

    return getFallbackCoords(query);
  } catch (err) {
    console.warn('[geocodeAddress] error:', err);
    return getFallbackCoords(query);
  }
}

/**
 * Reverse geocode GPS coordinates to a structured Indian postal address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: NOMINATIM_HEADERS,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        
        const road = addr.road || addr.pedestrian || addr.suburb || '';
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || '';
        const city = addr.city || addr.town || addr.village || addr.county || 'Pune';
        const state = addr.state || 'Maharashtra';
        const pincode = addr.postcode || '411001';

        const line1 = road ? (area && area !== road ? `${road}, ${area}` : road) : (area || data.display_name.split(',')[0]);
        const line2 = area && line1 !== area ? area : '';

        return {
          latitude,
          longitude,
          line1: line1 || 'Nearby Location',
          line2: line2 || undefined as any,
          city,
          state,
          pincode,
          displayName: data.display_name || `${line1}, ${city}`,
        };
      }
    }
  } catch (err) {
    console.warn('[reverseGeocode] error:', err);
  }

  // Find nearest Pune neighborhood fallback
  const nearest = findNearestPuneArea(latitude, longitude);
  return {
    latitude,
    longitude,
    line1: nearest.area,
    line2: nearest.name,
    city: nearest.city,
    state: nearest.state,
    pincode: nearest.pincode,
    displayName: `${nearest.name}, ${nearest.city}, ${nearest.state} ${nearest.pincode}`,
  };
}

/**
 * Request real device GPS coordinates with robust error handling and reverse geocoding
 */
export async function getCurrentDeviceLocation(): Promise<{
  success: boolean;
  data?: ReverseGeocodeResult;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser.',
    };
  }

  return new Promise((resolve) => {
    // First attempt with standard accuracy to avoid timeouts on laptops / WiFi
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const address = await reverseGeocode(lat, lon);
          resolve({
            success: true,
            data: address,
          });
        } catch {
          resolve({
            success: true,
            data: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              line1: 'Detected GPS Location',
              line2: 'Pune Area',
              city: 'Pune',
              state: 'Maharashtra',
              pincode: '411001',
              displayName: 'Detected GPS Location, Pune',
            },
          });
        }
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. Please allow location access in your browser or select your area below.';
        } else if (err.code === 2) {
          msg = 'Location information is currently unavailable. Please pick your area below.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again or select your area below.';
        }
        resolve({
          success: false,
          error: msg,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

function findNearestPuneArea(lat: number, lon: number): PopularArea {
  let minDistance = Infinity;
  let closest = PUNE_POPULAR_AREAS[0];

  for (const area of PUNE_POPULAR_AREAS) {
    const dLat = area.latitude - lat;
    const dLon = area.longitude - lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < minDistance) {
      minDistance = dist;
      closest = area;
    }
  }

  return closest;
}

function getFallbackCoords(query?: {
  line1?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}): GeocodeResult {
  const isBaramati =
    query?.city?.toLowerCase().includes('baramati') ||
    query?.line1?.toLowerCase().includes('baramati') ||
    query?.area?.toLowerCase().includes('baramati') ||
    query?.pincode?.startsWith('413');

  if (isBaramati) {
    return {
      latitude: 18.1517,
      longitude: 74.5772,
      displayName: 'Baramati, Maharashtra, India',
    };
  }

  // Check known popular areas in Pune
  const qStr = `${query?.line1 || ''} ${query?.area || ''} ${query?.city || ''}`.toLowerCase();
  for (const pa of PUNE_POPULAR_AREAS) {
    if (
      qStr.includes(pa.area.toLowerCase()) || 
      qStr.includes(pa.name.toLowerCase()) ||
      (query?.pincode && query.pincode === pa.pincode)
    ) {
      return {
        latitude: pa.latitude,
        longitude: pa.longitude,
        displayName: `${pa.name}, ${pa.city}`,
      };
    }
  }

  return {
    latitude: 18.5204,
    longitude: 73.8567,
    displayName: 'Pune, Maharashtra, India',
  };
}
