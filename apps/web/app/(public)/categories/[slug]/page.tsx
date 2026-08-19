'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { ProductCard } from '@/modules/shop/components/ProductCard';
import { Container, Heading, Text, BackToTop } from '@/shared/ui';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category;
}

interface ProductVariant {
  _id: string;
  unit: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  variants: ProductVariant[];
}

interface ProductResponse {
  success: boolean;
  data: Product[];
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const slug = params?.slug as string;
        const [catRes, prodRes] = await Promise.all([
          apiRequest<CategoryResponse>({
            method: 'GET',
            url: API_ENDPOINTS.categories.DETAIL(slug),
          }),
          apiRequest<ProductResponse>({
            method: 'GET',
            url: `${API_ENDPOINTS.products.LIST}?category=${slug}`,
          }),
        ]);
        setCategory(catRes.data);
        setProducts(prodRes.data);
      } catch {
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params, router]);

  return (
    <Container maxWidth="xl" className="py-6 sm:py-12 lg:py-16">
      <nav className="mb-4 flex items-center gap-1 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href={PUBLIC_ROUTES.HOME} className="hover:text-primary">Home</Link>
        <span className="text-border">/</span>
        <Link href="/categories" className="hover:text-primary">Categories</Link>
        {category && (
          <>
            <span className="text-border">/</span>
            <span className="text-text">{category.name}</span>
          </>
        )}
      </nav>

      <Link
        href="/categories"
        className="mb-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        All categories
      </Link>

      <div className="text-center mb-6 sm:mb-8">
        <Heading level="h1" balance className="mb-2">
          {category ? category.name : 'Category'}
        </Heading>
        {category?.description && (
          <Text className="mx-auto max-w-2xl text-text-muted">{category.description}</Text>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <Text className="text-text-muted">No products in this category yet.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <BackToTop />
    </Container>
  );
}
