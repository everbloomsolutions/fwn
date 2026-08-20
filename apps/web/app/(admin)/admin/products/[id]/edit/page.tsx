'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/modules/admin/components/ProductForm';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Container, Heading, Text } from '@/shared/ui';

interface Category {
  _id: string;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  tags: string[];
  ingredients: string[];
  certifications: string[];
  isActive: boolean;
  nutrition: Record<string, string>;
  variants: {
    _id?: string;
    sku: string;
    quantity: number;
    measurement: 'g' | 'kg' | 'ml' | 'ltr' | 'pcs' | 'unit';
    price: number;
    stock: number;
    mrp?: number;
    isActive: boolean;
    position: number;
  }[];
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      apiRequest<ProductResponse>({ method: 'GET', url: API_ENDPOINTS.products.ADMIN_DETAIL(id) }),
      apiRequest<CategoryResponse>({ method: 'GET', url: API_ENDPOINTS.categories.LIST }),
    ])
      .then(([productRes, categoryRes]) => {
        setProduct(productRes.data);
        setCategories(categoryRes.data || []);
      })
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text>Loading product...</Text>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-6 sm:py-10">
      <Heading level="h1" className="mb-6">
        Edit {product.name}
      </Heading>
      <ProductForm product={product} categories={categories} isEdit />
    </Container>
  );
}
