import { notFound } from 'next/navigation';
import ProductDetailClient from '@/modules/shop/components/ProductDetailClient';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  ingredients?: string[];
  certifications?: string[];
  nutrition?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  category: { _id: string; name: string; slug: string };
  variants: { _id: string; unit: string; price: number; stock: number; isActive: boolean }[];
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${slug}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const body: ProductResponse = await res.json();
  return body.data || null;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    notFound();
  }
  return <ProductDetailClient product={product} />;
}
