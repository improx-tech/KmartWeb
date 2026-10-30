import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapDbProductToProduct } from '@/services/products';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || undefined;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( id, name ),
        inventory ( id, store_id, stock_quantity )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[/api/products/[id]] DB error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
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

    const product = mapDbProductToProduct(data, stockQty);

    return NextResponse.json(
      { success: true, product },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    console.error('[/api/products/[id]] server error:', err?.message);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
