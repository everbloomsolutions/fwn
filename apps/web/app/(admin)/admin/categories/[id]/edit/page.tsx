'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CategoryForm from '@/modules/admin/components/CategoryForm';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Container, Heading, Text } from '@/shared/ui';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface CategoryResponse {
  success: boolean;
  data: Category;
}

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    apiRequest<CategoryResponse>({ method: 'GET', url: API_ENDPOINTS.categories.ADMIN_DETAIL(id) })
      .then((res) => setCategory(res.data))
      .catch(() => setCategory(null));
  }, [id]);

  if (!category) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text>Loading category...</Text>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-6 sm:py-10">
      <Heading level="h1" className="mb-6">
        Edit {category.name}
      </Heading>
      <CategoryForm category={category} isEdit />
    </Container>
  );
}
