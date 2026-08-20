'use client';

import { useEffect, useState } from 'react';
import ProductForm from '@/modules/admin/components/ProductForm';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Container, Heading } from '@/shared/ui';

interface Category {
  _id: string;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiRequest<CategoryResponse>({ method: 'GET', url: API_ENDPOINTS.categories.LIST })
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <Container maxWidth="xl" className="py-6 sm:py-10">
      <Heading level="h1" className="mb-6">
        New Product
      </Heading>
      <ProductForm categories={categories} isEdit={false} />
    </Container>
  );
}
