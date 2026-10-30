import { supabase } from '../lib/supabase/client';
import { DbStore } from '../types/database';

export function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number {
  const earthRadiusKm = 6371;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const deltaLat = ((latitude2 - latitude1) * Math.PI) / 180;
  const deltaLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

// Temporarily disabled store IDs (can be re-enabled later)
export const DISABLED_STORE_IDS: string[] = [
  'f524383f-c351-41a3-a98d-6fb139e832a7', // Store 2 (Camp / East) - temporarily disabled
];

export const DEFAULT_STORES: DbStore[] = [
  {
    id: '458cbfde-68fd-4e71-86c7-a12a4cecad4d',
    name: 'K MART - Baramati (Kasba / Nira Rd)',
    address: 'Baramati - Nira Rd, Yashwant Nagar, Kasba, Baramati, Maharashtra 413102',
    latitude: 18.1433,
    longitude: 74.5658,
    service_radius_km: 5,
    gofrugal_account_id: 'STORE1',
    active: true,
  },
  {
    id: 'f524383f-c351-41a3-a98d-6fb139e832a7',
    name: 'K MART - Store 2 (Camp / East)',
    address: 'Station / Camp Road, Pune, Maharashtra 411001',
    latitude: 18.5300,
    longitude: 73.8700,
    service_radius_km: 5,
    gofrugal_account_id: 'STORE2',
    active: false, // Temporarily disabled - reactivate later
  },
];

export function findNearestStore(
  stores: DbStore[],
  latitude: number,
  longitude: number
): { store: DbStore; distanceKm: number; isWithinRadius: boolean } | null {
  // Only evaluate active and non-disabled stores
  const storePool = stores && stores.length > 0 ? stores : DEFAULT_STORES;
  const activeStores = storePool.filter(
    (s) => s.active !== false && !DISABLED_STORE_IDS.includes(s.id)
  );
  if (!activeStores || activeStores.length === 0) return null;

  let nearestStore = activeStores[0];
  let minDistance = calculateDistanceKm(
    nearestStore.latitude,
    nearestStore.longitude,
    latitude,
    longitude
  );

  for (let i = 1; i < activeStores.length; i++) {
    const s = activeStores[i];
    const dist = calculateDistanceKm(s.latitude, s.longitude, latitude, longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStore = s;
    }
  }

  const roundedDistance = Number(minDistance.toFixed(2));
  const maxRadius = nearestStore.service_radius_km || 5;

  return {
    store: nearestStore,
    distanceKm: roundedDistance,
    isWithinRadius: roundedDistance <= maxRadius,
  };
}

export const storeService = {
  async getStores(client = supabase): Promise<DbStore[]> {
    try {
      const { data, error } = await client
        .from('stores')
        .select('*')
        .eq('active', true);

      if (error || !data || data.length === 0) {
        return DEFAULT_STORES.filter(
          (s) => s.active !== false && !DISABLED_STORE_IDS.includes(s.id)
        );
      }

      // Filter out any temporarily disabled stores and ensure 5km delivery radius if not set
      const activeStores = data
        .filter((store) => store.active !== false && !DISABLED_STORE_IDS.includes(store.id))
        .map((store) => ({
          ...store,
          service_radius_km: store.service_radius_km || 5,
        }));

      if (activeStores.length === 0) {
        return DEFAULT_STORES.filter(
          (s) => s.active !== false && !DISABLED_STORE_IDS.includes(s.id)
        );
      }

      return activeStores;
    } catch {
      return DEFAULT_STORES.filter(
        (s) => s.active !== false && !DISABLED_STORE_IDS.includes(s.id)
      );
    }
  },
};
