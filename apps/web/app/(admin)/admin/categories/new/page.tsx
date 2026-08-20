import { Container, Heading } from '@/shared/ui';
import CategoryForm from '@/modules/admin/components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <Container maxWidth="xl" className="py-6 sm:py-10">
      <Heading level="h1" className="mb-6">
        New Category
      </Heading>
      <CategoryForm isEdit={false} />
    </Container>
  );
}
