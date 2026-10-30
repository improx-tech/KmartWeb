import { supabase } from '../lib/supabase/client';
import { Category } from '../types';
import { categoryNameToSlug } from './products';

const CATEGORY_ICONS: Record<string, string> = {
  groceries: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80',
  'dairy-and-eggs': 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=300&q=80',
  'snacks-and-beverages': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
  'pooja-samagri': '/banner-pooja-thali.webp',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80',
  'breakfast-and-ready-to-cook': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80',
  'sauces-and-spreads': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80',
  'personal-care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80',
  household: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
  'home-utility': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80',
};

export const categoryService = {
  async fetchDbCategories(client = supabase): Promise<Category[]> {
    try {
      // 1. Try secure server-side API proxy first (hides database credentials from client network)
      if (typeof window !== 'undefined') {
        try {
          const res = await fetch('/api/categories');
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.categories) && json.categories.length > 0) {
              return json.categories;
            }
          }
        } catch {
          // Fallback to client query
        }
      }

      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('[categoryService] Supabase error fetching categories:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const mapped: Category[] = data
        .filter((c: any) => !c.parent_id)
        .filter((c: any) => {
          const name = (c.name || '').toLowerCase();
          const slug = (c.slug || '').toLowerCase();
          return !name.includes('fruit') && !name.includes('vegetable') &&
                 !slug.includes('fruit') && !slug.includes('vegetable');
        })
        .map((dbCat: any) => {
          const slug = categoryNameToSlug(dbCat.name);
          const icon = dbCat.icon_url || dbCat.image_url || CATEGORY_ICONS[slug] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80';
          return {
            id: dbCat.id,
            name: dbCat.name,
            slug,
            icon,
            image: icon,
            itemCount: dbCat.item_count ? `${dbCat.item_count}+ items` : undefined,
            subcategories: dbCat.subcategories || [],
          };
        });

      const hasPooja = mapped.some((c: any) => c.slug === 'pooja-samagri' || (c.name || '').toLowerCase().includes('pooja'));
      if (!hasPooja) {
        mapped.push({
          id: 'pooja-samagri',
          name: 'Pooja Samagri',
          slug: 'pooja-samagri',
          icon: '/banner-pooja-thali.webp',
          image: '/banner-pooja-thali.webp',
          itemCount: '120+ items',
          subcategories: ['Agarbatti', 'Dhoop', 'Camphor', 'Diyas', 'Havan Samagri'],
        });
      }

      return mapped;
    } catch (err: any) {
      console.warn('[categoryService] exception:', err?.message);
      return [];
    }
  },
};
