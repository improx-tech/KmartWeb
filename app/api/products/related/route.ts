import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapDbProductToProduct } from '@/services/products';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const limitParam = parseInt(searchParams.get('limit') || '4', 10);
    const limit = isNaN(limitParam) ? 4 : Math.min(Math.max(1, limitParam), 20);

    const supabase = createClient();
    let query = supabase
      .from('products')
      .select(`
        *,
        categories ( id, name ),
        inventory ( id, store_id, stock_quantity )
      `)
      .eq('active', true);

    if (productId) {
      query = query.neq('id', productId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.limit(limit);

    if (error || !data || data.length === 0) {
      if (categoryId) {
        const { data: fallbackData } = await supabase
          .from('products')
          .select(`
            *,
            categories ( id, name ),
            inventory ( id, store_id, stock_quantity )
          `)
          .eq('active', true)
          .neq('id', productId || '')
          .limit(limit);

        const mapped = (fallbackData || []).map((row: any) => mapDbProductToProduct(row, 50));
        return NextResponse.json({ success: true, products: mapped });
      }
      return NextResponse.json({ success: true, products: [] });
    }

    const mapped = data.map((row: any) => mapDbProductToProduct(row, 50));
    return NextResponse.json(
      { success: true, products: mapped },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    console.error('[/api/products/related] server error:', err?.message);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
