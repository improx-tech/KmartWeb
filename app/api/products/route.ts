import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapDbProductToProduct } from '@/services/products';

export const dynamic = 'force-dynamic';

function mapInventoryRowsToProducts(allInventoryRows: any[]) {
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

  const mapped: any[] = [];
  productMap.forEach(({ p, stockQty }) => {
    if (stockQty < 5) return;
    mapped.push(mapDbProductToProduct(p, stockQty));
  });

  mapped.sort((a, b) => a.name.localeCompare(b.name));
  return mapped;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || undefined;
    const hasExplicitLimit = searchParams.has('limit');

    const supabase = createClient();

    // ── Full Catalog Load: Fetch all concurrent chunks (all 8,798+ in-stock products) ──
    if (!hasExplicitLimit) {
      const chunkSize = 1000;
      const buildChunkQuery = (offset: number) => {
        let q = supabase
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
          .range(offset, offset + chunkSize - 1);

        if (storeId) {
          q = q.eq('store_id', storeId);
        }
        return q;
      };

      // Step 1: Initial batch
      const { data: firstBatch, error: firstErr } = await buildChunkQuery(0);

      if (!firstErr && firstBatch && firstBatch.length > 0) {
        let allRows: any[] = [...firstBatch];

        // Step 2: Concurrently fetch all remaining offsets (up to 10k rows)
        if (firstBatch.length === chunkSize) {
          const remainingOffsets = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
          const results = await Promise.all(remainingOffsets.map(buildChunkQuery));

          for (const res of results) {
            if (res.data && res.data.length > 0) {
              allRows.push(...res.data);
            }
          }
        }

        const products = mapInventoryRowsToProducts(allRows);
        return NextResponse.json(
          { success: true, count: products.length, products },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
            },
          }
        );
      }
    }

    // ── Paginated / Partial Load ──
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
    const limitParam = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = isNaN(offsetParam) ? 0 : Math.max(0, offsetParam);
    const limit = isNaN(limitParam) ? 1000 : Math.min(Math.max(1, limitParam), 2000);

    let query = supabase
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
      query = query.eq('store_id', storeId);
    }

    const { data: inventoryRows, error: invErr } = await query;

    if (!invErr && inventoryRows && inventoryRows.length > 0) {
      const products = mapInventoryRowsToProducts(inventoryRows);
      return NextResponse.json(
        { success: true, count: products.length, products },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
          },
        }
      );
    }

    // Fallback if no inventory rows
    let fallbackQuery = supabase
      .from('products')
      .select(`
        *,
        categories ( id, name ),
        inventory ( store_id, stock_quantity )
      `)
      .eq('active', true)
      .order('name')
      .range(offset, offset + limit - 1);

    const { data: dbProducts, error: fallbackError } = await fallbackQuery;

    if (fallbackError || !dbProducts) {
      return NextResponse.json({ success: true, products: [] });
    }

    const mappedDb = dbProducts
      .map((p: any) => {
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
      .filter((p: any) => (p.stockCount ?? 0) >= 5);

    return NextResponse.json(
      { success: true, products: mappedDb },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    console.error('[/api/products] server error:', err?.message);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
