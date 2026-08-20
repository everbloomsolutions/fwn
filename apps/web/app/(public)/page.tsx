import HomeClient from './HomeClient';
import { CategoryHighlights } from '@/modules/shop/components/CategoryHighlights';
import { BestSellers } from '@/modules/shop/components/BestSellers';

export default function HomePage() {
  return (
    <HomeClient>
      <CategoryHighlights />
      <BestSellers limit={10} />
    </HomeClient>
  );
}
