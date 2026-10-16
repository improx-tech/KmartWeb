import { supabase } from '../lib/supabase/client';
import { Product } from '../types';

const PRODUCT_IMAGE_FALLBACKS: { keywords: string[]; url: string }[] = [
  { keywords: ['surf', 'surf excel', 'detergent', 'matic', 'bar', 'soap', 'clean'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['salt', 'tata salt', 'tata', 'moong', 'dal', 'pulses', 'grain'], url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['handwash', 'lifebuoy', 'shampoo'], url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['maggi', 'noodle', 'noodles', 'pasta', 'parle', 'biscuit', 'biscuits', 'cookie'], url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['saffola', 'oil', 'cooking'], url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['rin', 'cleaner', 'scrub'], url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['tea', 'tata tea', 'chai'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['camphor', 'pooja', 'tablets'], url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['vim', 'dishwash'], url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['fevicol', 'adhesive', 'glue'], url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['foil', 'aluminium', 'freshwrapp'], url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['scotch', 'brite', 'scrub'], url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['good knight', 'mosquito', 'refill'], url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['diaper', 'mamypoko', 'pants'], url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['rice', 'basmati', 'india gate'], url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['atta', 'aashirvaad', 'flour', 'wheat'], url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['corn flakes', 'kellogg'], url: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['milk', 'dairy', 'amul'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['colgate', 'toothpaste', 'oral', 'brush'], url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
];

const GENERIC_FALLBACK = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80';

// Blacklisted IDs of images containing fruits or vegetables
const FORBIDDEN_FRUIT_VEG_IMAGE_IDS = [
  'photo-1542838132-92c53300491e', // Vegetable display racks
  'photo-1588964895597-cfccd6e2dbf9', // Paper bag with apples, bananas & cabbage
  'photo-1610832958506-aa56368176cf', // Vegetables & fruits produce table
  'photo-1619566636858-adf3ef46400b', // Fruit bowl
  'photo-1597362925123-77861d3fbac7', // Vegetable market
  'photo-1571771894821-ce9b6c11b08e', // Bananas
  'photo-1560806887-1e4cd0b6cbd6', // Apples
  'photo-1592924357228-91a4daadcfea', // Tomatoes
  'photo-1518977676601-b53f82aba655', // Potatoes
  'photo-1618512496248-a07fe83aa8cb', // Onions
];

export function resolveImage(productName: string, imageUrl: string | null | undefined): string {
  // 1. If database provides a valid image URL, prioritize and return it directly
  if (imageUrl && typeof imageUrl === 'string') {
    let trimmed = imageUrl.trim();
    if (trimmed.startsWith('//')) {
      trimmed = `https:${trimmed}`;
    }
    if (
      trimmed.length > 0 &&
      trimmed.toLowerCase() !== 'null' &&
      trimmed.toLowerCase() !== 'undefined' &&
      !FORBIDDEN_FRUIT_VEG_IMAGE_IDS.some((badId) => trimmed.includes(badId))
    ) {
      return trimmed;
    }
  }

  // 2. Only if DB has no image, fallback to keyword matching based on product name
  const lower = (productName || '').toLowerCase();
  for (const entry of PRODUCT_IMAGE_FALLBACKS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.url;
    }
  }

  // 3. Final generic fallback
  return GENERIC_FALLBACK;
}

export function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const memoryCache: { [storeId: string]: { timestamp: number; data: Product[] } } = {};

export function getCachedProducts(storeId?: string): Product[] | null {
  const key = storeId || 'default';
  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_TTL_MS) {
    return memoryCache[key].data;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(`kmart_cached_prods_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.data)) {
          memoryCache[key] = parsed;
          return parsed.data;
        }
      }
    } catch {}
  }
  return null;
}

export function setCachedProducts(storeId: string | undefined, data: Product[]) {
  const key = storeId || 'default';
  const entry = { timestamp: Date.now(), data };
  memoryCache[key] = entry;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`kmart_cached_prods_${key}`, JSON.stringify(entry));
    } catch {}
  }
}

export function clearProductCache(storeId?: string) {
  if (storeId) {
    delete memoryCache[storeId];
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(`kmart_cached_prods_${storeId}`);
      } catch {}
    }
  } else {
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
    if (typeof window !== 'undefined') {
      try {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith('kmart_cached_prods_')) {
            sessionStorage.removeItem(k);
          }
        });
      } catch {}
    }
  }
}

export function extractWeightFromName(name: string): string | null {
  if (!name) return null;
  const match = name.match(/(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|gram|grams|l|ltr|litre|litres|ml|pcs|pc|pack|units|tabs|tablets|wash))\b/i);
  return match ? match[1].toUpperCase() : null;
}

export function extractBrandFromName(name: string): string {
  if (!name) return 'K MART';
  const clean = name.replace(/^[\s.•·]+/, '').trim();
  const firstWord = clean.split(' ')[0];
  if (firstWord && firstWord.length > 2 && !/^\d+$/.test(firstWord)) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }
  return 'K MART';
}

export function mapDbProductToProduct(p: any, stockQty = 50): Product {
  const cleanName = (p.name as string || '').replace(/^[\s.•·]+/, '').trim();
  const mrp = Number(p.mrp || 0);
  const sellingPrice = Number(p.selling_price || 0);
  const discountPercent =
    mrp > sellingPrice
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const dbCategoryName: string = p.categories?.name || '';
  const categorySlug = dbCategoryName
    ? categoryNameToSlug(dbCategoryName)
    : 'groceries';

  const resolvedImg = resolveImage(cleanName, p.image_url);
  const extractedWeight = extractWeightFromName(cleanName);
  const weight = p.weight_unit || extractedWeight || '1 unit';
  
  const rawBrand = (p.brand || '').trim();
  const brand = (rawBrand && rawBrand.toLowerCase() !== 'my store' && rawBrand.toLowerCase() !== 'generic')
    ? rawBrand
    : extractBrandFromName(cleanName);

  return {
    id: p.id,
    sku: p.sku || undefined,
    barcode: p.barcode || undefined,
    categoryId: p.category_id || p.categories?.id || undefined,
    name: cleanName,
    category: categorySlug,
    storeTag: `K MART | ${dbCategoryName ? dbCategoryName.toUpperCase() : 'GROCERIES'}`,
    weight,
    price: sellingPrice,
    originalPrice: mrp,
    discountPercent,
    rating: 4.6,
    reviewCount: 78,
    image: resolvedImg,
    inStock: stockQty > 0,
    stockCount: stockQty,
    maxPurchaseUnits: 24,
    badge: discountPercent > 0 ? `${discountPercent}% OFF` : undefined,
    brand,
    deliveryTime: 'Delivery on time',
    highlights: [
      '100% Genuine Branded Pack',
      'Quality Guaranteed & Freshness Checked',
      'Best Market Price',
      'Hygienically Packed & Delivered',
    ],
    description:
      p.description ||
      `${cleanName} — authentic, quality-checked daily grocery essential directly sourced and available for guaranteed on-time doorstep delivery from K MART.`,
  };
}

function mapInventoryRowsToProducts(allInventoryRows: any[]): Product[] {
  const productMap = new Map<string, { p: any; stockQty: number }>();

  for (const row of allInventoryRows) {
    const p = row.products;
    if (!p || !p.id) continue;

    const existing = productMap.get(p.id);
    const currentQty = Number(row.stock_quantity || 0);

    if (!existing) {
      productMap.set(p.id, { p, stockQty: currentQty });
    } else {
      existing.stockQty = Math.max(existing.stockQty, currentQty);
    }
  }

  const mapped: Product[] = [];

  productMap.forEach(({ p, stockQty }) => {
    if (stockQty < 5) return;
    mapped.push(mapDbProductToProduct(p, stockQty));
  });

  mapped.sort((a, b) => a.name.localeCompare(b.name));
  return mapped;
}

export const productService = {
  getCachedProducts,
  setCachedProducts,
  clearProductCache,

  async fetchDbProducts(
    storeId?: string,
    client = supabase,
    onInitialBatch?: (batch: Product[]) => void
  ): Promise<Product[]> {
    try {
      const cacheKey = storeId || 'default';
      const cached = getCachedProducts(cacheKey);
      if (cached && cached.length > 0) {
        if (onInitialBatch) {
          onInitialBatch(cached);
        }
        return cached;
      }

      const buildInventoryQuery = (offset: number, limit: number) => {
        let q = client
          .from('inventory')
          .select(`
            product_id,
            stock_quantity,
            products!inner (
              id,
              name,
              description,
              sku,
              barcode,
              mrp,
              selling_price,
              weight_unit,
              image_url,
              brand,
              active,
              category_id,
              categories ( id, name )
            )
          `)
          .gte('stock_quantity', 5)
          .eq('products.active', true)
          .range(offset, offset + limit - 1);

        if (storeId) {
          q = q.eq('store_id', storeId);
        }
        return q;
      };

      // ── Step 1: Blazing fast initial batch (1000 items in ~250ms) ──
      const { data: firstBatch, error: firstErr } = await buildInventoryQuery(0, 1000);

      let allRows: any[] = [];
      if (!firstErr && firstBatch && firstBatch.length > 0) {
        allRows.push(...firstBatch);
        const initialMapped = mapInventoryRowsToProducts(allRows);

        // Immediately notify UI so products render instantly
        if (onInitialBatch && initialMapped.length > 0) {
          onInitialBatch(initialMapped);
        }

        // ── Step 2: Fetch remaining chunks concurrently via Promise.all ──
        if (firstBatch.length === 1000) {
          const remainingOffsets = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
          const remainingResults = await Promise.all(
            remainingOffsets.map((offset) => buildInventoryQuery(offset, 1000))
          );

          for (const res of remainingResults) {
            if (res.data && res.data.length > 0) {
              allRows.push(...res.data);
            }
          }
        }

        const fullMapped = mapInventoryRowsToProducts(allRows);
        setCachedProducts(cacheKey, fullMapped);
        return fullMapped;
      }

      // Fallback query if no inventory rows found
      let fallbackQuery = client
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          inventory ( store_id, stock_quantity )
        `)
        .eq('active', true)
        .order('name');

      const { data: dbProducts, error: fallbackError } = await fallbackQuery;

      if (fallbackError || !dbProducts || dbProducts.length === 0) {
        return [];
      }

      const mappedDb: Product[] = dbProducts
        .map((p: any) => {
          const discountPercent =
            p.mrp > p.selling_price
              ? Math.round(((p.mrp - p.selling_price) / p.mrp) * 100)
              : 0;

          const dbCategoryName: string = p.categories?.name || '';
          const categorySlug = dbCategoryName
            ? categoryNameToSlug(dbCategoryName)
            : 'groceries';

          let stockQty = 50;
          if (Array.isArray(p.inventory) && p.inventory.length > 0) {
            if (storeId) {
              const storeInv = p.inventory.find((inv: any) => inv.store_id === storeId);
              stockQty = storeInv?.stock_quantity ?? 0;
            } else {
              stockQty = p.inventory.reduce(
                (sum: number, inv: any) => sum + (inv.stock_quantity || 0),
                0
              );
            }
          } else if (p.inventory?.stock_quantity != null) {
            stockQty = p.inventory.stock_quantity;
          }

          return mapDbProductToProduct(p, stockQty);
        })
        .filter((p) => (p.stockCount ?? 0) >= 5);

      return mappedDb;
    } catch (err: any) {
      console.warn('[productService] exception:', err?.message);
      return [];
    }
  },

  async fetchProductById(id: string, storeId?: string): Promise<Product | null> {
    try {
      if (!id) return null;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          inventory ( id, store_id, stock_quantity )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.warn('[fetchProductById] Not found or error:', error?.message);
        return null;
      }

      let stockQty = 50;
      if (Array.isArray(data.inventory) && data.inventory.length > 0) {
        if (storeId) {
          const storeInv = data.inventory.find((inv: any) => inv.store_id === storeId);
          stockQty = storeInv?.stock_quantity ?? 0;
        } else {
          stockQty = data.inventory.reduce(
            (sum: number, inv: any) => sum + (inv.stock_quantity || 0),
            0
          );
        }
      } else if (data.inventory?.stock_quantity != null) {
        stockQty = Number(data.inventory.stock_quantity);
      }

      return mapDbProductToProduct(data, stockQty);
    } catch (err: any) {
      console.warn('[fetchProductById] Exception:', err?.message);
      return null;
    }
  },

  async fetchRelatedProducts(
    categoryId?: string,
    currentProductId?: string,
    limit = 4
  ): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          inventory ( id, store_id, stock_quantity )
        `)
        .eq('active', true);

      if (currentProductId) {
        query = query.neq('id', currentProductId);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.limit(limit);
      if (error || !data || data.length === 0) {
        // Fallback without category filter if category had 0 other products
        if (categoryId) {
          const { data: fallbackData } = await supabase
            .from('products')
            .select(`
              *,
              categories ( id, name ),
              inventory ( id, store_id, stock_quantity )
            `)
            .eq('active', true)
            .neq('id', currentProductId || '')
            .limit(limit);
          if (fallbackData) {
            return fallbackData.map((row: any) => mapDbProductToProduct(row, 50));
          }
        }
        return [];
      }

      return data.map((row: any) => mapDbProductToProduct(row, 50));
    } catch (err: any) {
      console.warn('[fetchRelatedProducts] Exception:', err?.message);
      return [];
    }
  },
};
