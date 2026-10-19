'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface CategoryOffer {
  id: string;
  categorySlug: string;
  categoryName: string;
  storeLabel: string;
  discountBadge: string;
  maxDiscount: number;
  itemCount: number;
  topProduct?: Product;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  image: string;
  brandList?: string[];
}

const CATEGORY_META: Record<
  string,
  { name: string; defaultImg: string; fallbackDesc: string }
> = {
  'personal-care': {
    name: 'Personal Care & Hygiene',
    defaultImg:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    fallbackDesc:
      'Save on oral care, soaps, shampoos, and daily grooming essentials.',
  },
  groceries: {
    name: 'Groceries & Staples',
    defaultImg:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    fallbackDesc:
      'Atta, rice, dal, premium dates, cooking oils, and pantry staples.',
  },
  'snacks-and-beverages': {
    name: 'Snacks & Packaged Food',
    defaultImg:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    fallbackDesc:
      'Biscuits, noodles, pasta, tea, coffee, and delicious family snacks.',
  },
  household: {
    name: 'Household & Cleaning',
    defaultImg:
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
    fallbackDesc:
      'Detergents, dishwash, surface cleaners, tissues, and home essentials.',
  },
  'dairy-and-eggs': {
    name: 'Dairy & Breakfast',
    defaultImg:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    fallbackDesc:
      'Fresh milk, butter, cheese, ghee, and morning breakfast favorites.',
  },
};

const CategoryOfferCardImage: React.FC<{
  src: string;
  alt: string;
  discountBadge: string;
}> = ({ src, alt, discountBadge }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
  }, [src]);

  return (
    <div className="relative shrink-0 w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
      {/* Discount Badge */}
      <span className="absolute top-0 right-0 z-20 bg-[#E11A22] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
        {discountBadge}
      </span>

      {/* Image Container */}
      <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 relative border border-gray-100">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className={`object-cover transform group-hover:scale-105 transition-all duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setImgSrc(
              'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=400&q=80'
            );
            setIsLoaded(true);
          }}
        />
      </div>
    </div>
  );
};

export const StoreOffersSection: React.FC = () => {
  const {
    products,
    activeStore,
    selectedCategory,
    setSelectedCategory,
    setActiveProductModal,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const storeName = useMemo(() => {
    if (activeStore?.name) {
      return activeStore.name.replace(/\(.*?\)/g, '').trim();
    }
    return 'K MART BARAMATI';
  }, [activeStore]);

  // Group products by category and calculate category-wise discounts
  const categoryOffers: CategoryOffer[] = useMemo(() => {
    if (!products || products.length === 0) {
      // Fallback matching real catalog data while loading
      return [
        {
          id: 'cat-personal-care',
          categorySlug: 'personal-care',
          categoryName: 'Personal Care & Hygiene',
          storeLabel: `${storeName.toUpperCase()} • PERSONAL CARE`,
          discountBadge: 'UP TO 74% OFF',
          maxDiscount: 74,
          itemCount: 146,
          title: 'Personal Care & Hygiene',
          subtitle: 'Save up to 74% on dental, skin & hair care',
          description:
            'Colgate, Patanjali, and top branded daily grooming essentials at steep store discounts.',
          ctaText: 'Shop Personal Care',
          image:
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'cat-groceries',
          categorySlug: 'groceries',
          categoryName: 'Groceries & Staples',
          storeLabel: `${storeName.toUpperCase()} • GROCERIES & STAPLES`,
          discountBadge: 'UP TO 60% OFF',
          maxDiscount: 60,
          itemCount: 637,
          title: 'Groceries & Staples',
          subtitle: 'Save up to 60% on dry fruits, atta & pulses',
          description:
            'Black dates, Aashirvaad, Balaji, and daily pantry essentials at wholesale prices.',
          ctaText: 'Shop Groceries',
          image:
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'cat-snacks',
          categorySlug: 'snacks-and-beverages',
          categoryName: 'Snacks & Packaged Food',
          storeLabel: `${storeName.toUpperCase()} • SNACKS & FOODS`,
          discountBadge: 'UP TO 57% OFF',
          maxDiscount: 57,
          itemCount: 100,
          title: 'Snacks & Packaged Food',
          subtitle: 'Save up to 57% on pasta, tea & biscuits',
          description:
            'Panzani pasta, Parle, Tata Tea, and quick bites at special direct store prices.',
          ctaText: 'Shop Snacks',
          image:
            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'cat-household',
          categorySlug: 'household',
          categoryName: 'Household & Cleaning',
          storeLabel: `${storeName.toUpperCase()} • HOUSEHOLD DEALS`,
          discountBadge: 'UP TO 50% OFF',
          maxDiscount: 50,
          itemCount: 85,
          title: 'Household & Cleaning',
          subtitle: 'Save up to 50% on detergents & cleaning',
          description:
            'Surf Excel, Rin, Vim, Doux tissues, and household cleaning supplies.',
          ctaText: 'Shop Household',
          image:
            'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
        },
      ];
    }

    // Group active products by category
    const catMap = new Map<string, Product[]>();

    products.forEach((prod) => {
      const slug = prod.category || 'groceries';
      if (!catMap.has(slug)) {
        catMap.set(slug, []);
      }
      catMap.get(slug)!.push(prod);
    });

    const result: CategoryOffer[] = [];

    catMap.forEach((catProducts, slug) => {
      // Find products in this category with discounts
      const discounted = catProducts
        .filter((p) => p.discountPercent > 0 && p.originalPrice > p.price)
        .sort((a, b) => b.discountPercent - a.discountPercent);

      const topProduct = discounted[0] || catProducts[0];
      const maxDiscount = discounted.length > 0 ? discounted[0].discountPercent : 0;

      // Extract up to 3 popular brands in this category
      const brands = Array.from(
        new Set(
          catProducts
            .map((p) => p.brand)
            .filter((b) => b && b.toLowerCase() !== 'k mart' && b.length > 2)
        )
      ).slice(0, 3);

      const meta = CATEGORY_META[slug] || {
        name: slug.replace(/-/g, ' ').toUpperCase(),
        defaultImg: topProduct?.image || '',
        fallbackDesc: `Special discounts and savings on ${slug.replace(/-/g, ' ')} from ${storeName}.`,
      };

      const discountBadge =
        maxDiscount > 0 ? `UP TO ${maxDiscount}% OFF` : 'SPECIAL PRICES';

      const savings = topProduct
        ? Math.max(0, topProduct.originalPrice - topProduct.price)
        : 0;

      const subtitle =
        maxDiscount > 0
          ? `Save up to ${maxDiscount}% • ${catProducts.length}+ products`
          : `${catProducts.length}+ products available`;

      const description =
        brands.length > 0
          ? `Save on ${brands.join(', ')} and daily essentials from your nearest ${storeName}.`
          : meta.fallbackDesc;

      result.push({
        id: `cat-${slug}`,
        categorySlug: slug,
        categoryName: meta.name,
        storeLabel: `${storeName.toUpperCase()} • ${meta.name.toUpperCase()}`,
        discountBadge,
        maxDiscount,
        itemCount: catProducts.length,
        topProduct,
        title: meta.name,
        subtitle,
        description,
        ctaText: `Shop ${meta.name.split(' ')[0]}`,
        image: topProduct?.image || meta.defaultImg,
        brandList: brands,
      });
    });

    // Sort categories by highest discount first
    return result.sort((a, b) => b.maxDiscount - a.maxDiscount);
  }, [products, storeName]);

  // Overall maximum discount across all categories
  const maxStoreDiscount = useMemo(() => {
    if (categoryOffers.length > 0) {
      return Math.max(...categoryOffers.map((o) => o.maxDiscount));
    }
    return 74;
  }, [categoryOffers]);

  // Filter cards if a category filter tab is selected
  const displayedOffers = useMemo(() => {
    if (activeCategoryFilter === 'all') {
      return categoryOffers.slice(0, 4); // Display top 4 category offers
    }
    return categoryOffers.filter((o) => o.categorySlug === activeCategoryFilter);
  }, [categoryOffers, activeCategoryFilter]);

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const el = document.getElementById('products-section');
    if (el) {
      const navOffset = -110;
      const y = el.getBoundingClientRect().top + window.pageYOffset + navOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3 sm:mb-4">
        <div>
          <p className="text-xs font-bold text-[#E11A22] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{storeName.toUpperCase()} • CATEGORY OFFERS</span>
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A2540] tracking-tight">
            Offers from your nearby stores
          </h2>
        </div>

        {maxStoreDiscount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E11A22] bg-red-50 border border-red-200/80 px-3 py-1 rounded-full w-fit">
            <span>🔥 Up to {maxStoreDiscount}% OFF across categories</span>
          </div>
        )}
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveCategoryFilter('all')}
          className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
            activeCategoryFilter === 'all'
              ? 'bg-[#0A2540] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          All Categories ({categoryOffers.length})
        </button>

        {categoryOffers.map((cat) => (
          <button
            key={`filter-tab-${cat.categorySlug}`}
            type="button"
            onClick={() => setActiveCategoryFilter(cat.categorySlug)}
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === cat.categorySlug
                ? 'bg-[#E11A22] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{cat.categoryName.split('&')[0].trim()}</span>
            {cat.maxDiscount > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeCategoryFilter === cat.categorySlug
                    ? 'bg-white/20 text-white'
                    : 'bg-red-50 text-[#E11A22]'
                }`}
              >
                {cat.maxDiscount}% OFF
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Category Offer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedOffers.map((offer) => (
          <div
            key={offer.id}
            className="h-full bg-white rounded-2xl border border-gray-200/90 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div>
              {/* Top Row: Store / Category Badge + Image */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[#E11A22] uppercase tracking-wider block truncate">
                    {offer.storeLabel}
                  </span>
                  <h3
                    className="text-base font-bold text-gray-900 leading-snug line-clamp-1 mt-0.5"
                    title={offer.title}
                  >
                    {offer.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {offer.subtitle}
                  </p>
                </div>

                {/* Right Image */}
                <CategoryOfferCardImage
                  src={offer.image}
                  alt={offer.title}
                  discountBadge={offer.discountBadge}
                />
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                {offer.description}
              </p>

              {/* Featured Top Deal in this Category (Clickable) */}
              {offer.topProduct && offer.topProduct.discountPercent > 0 && (
                <div
                  onClick={() => {
                    if (offer.topProduct) {
                      setActiveProductModal(offer.topProduct);
                    }
                  }}
                  className="bg-gray-50/80 hover:bg-red-50/50 border border-gray-100 hover:border-red-100 rounded-xl p-2.5 mb-3 cursor-pointer transition-colors"
                  title="Click to view this deal"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                    <span className="font-bold text-[#E11A22] uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Top Deal</span>
                    </span>
                    <span className="font-black text-[#E11A22] text-[10px] bg-red-100/70 px-1.5 py-0.5 rounded">
                      {offer.topProduct.discountPercent}% OFF
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-900 truncate">
                    {offer.topProduct.name}
                  </p>

                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xs font-black text-[#0A2540]">
                      ₹{offer.topProduct.price}
                    </span>
                    {offer.topProduct.originalPrice > offer.topProduct.price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        ₹{offer.topProduct.originalPrice}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-emerald-600 ml-auto">
                      Save ₹{offer.topProduct.originalPrice - offer.topProduct.price}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleCategoryClick(offer.categorySlug)}
                className="w-full bg-[#E11A22] hover:bg-[#c8141b] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>{offer.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
