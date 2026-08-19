export type Measurement = 'g' | 'kg' | 'ml' | 'ltr' | 'pcs' | 'unit';

export interface VariantTemplate {
  sku: string;
  quantity: number;
  measurement: Measurement;
  unit: string;
  price: number;
  stock: number;
  position: number;
  isActive: boolean;
}

export function getDefaultVariantTemplate(): { quantity: number; measurement: Measurement; position: number }[] {
  return [
    { quantity: 200, measurement: 'g', position: 0 },
    { quantity: 500, measurement: 'g', position: 1 },
    { quantity: 1, measurement: 'kg', position: 2 },
  ];
}

export function getOilVariantTemplate(): { quantity: number; measurement: Measurement; position: number }[] {
  return [
    { quantity: 200, measurement: 'ml', position: 0 },
    { quantity: 500, measurement: 'ml', position: 1 },
    { quantity: 1, measurement: 'ltr', position: 2 },
  ];
}

export function getPcsVariantTemplate(): { quantity: number; measurement: Measurement; position: number }[] {
  return [
    { quantity: 1, measurement: 'pcs', position: 0 },
    { quantity: 2, measurement: 'pcs', position: 1 },
    { quantity: 3, measurement: 'pcs', position: 2 },
  ];
}

export function getUnitDisplay(quantity: number, measurement: Measurement): string {
  return `${quantity}${measurement}`;
}

export function getMeasurementForCategory(categorySlug: string, productName: string): 'g' | 'ml' | 'pcs' {
  const lower = categorySlug.toLowerCase();
  const name = productName.toLowerCase();

  if (lower.includes('oil') || lower.includes('ghee')) {
    return 'ml';
  }

  if (lower.includes('eco') || name.includes('brush') || name.includes('bottle') || name.includes('bamboo')) {
    return 'pcs';
  }

  return 'g';
}

export function generateVariantTemplates(
  categorySlug: string,
  productName: string,
  productSku: string,
  basePrice: number,
  stock: number
): VariantTemplate[] {
  const measurement = getMeasurementForCategory(categorySlug, productName);
  const base = measurement === 'pcs' ? getPcsVariantTemplate() : measurement === 'ml' ? getOilVariantTemplate() : getDefaultVariantTemplate();
  const piecesPerProduct = measurement === 'pcs' ? 1 : 1;
  const baseStock = stock > 0 ? Math.max(1, Math.floor(stock / (base.length * piecesPerProduct))) : 0;

  return base.map((t) => {
    let price: number;
    if (t.measurement === 'kg' || t.measurement === 'ltr') {
      price = basePrice * (t.quantity / 0.5); // 1kg/1ltr = 2x 500g/500ml
    } else if (t.measurement === 'g' || t.measurement === 'ml') {
      price = Math.max(1, Math.ceil(basePrice * (t.quantity / 500)));
    } else {
      price = basePrice * t.quantity;
    }

    return {
      sku: `${productSku}-${t.quantity}${t.measurement}`,
      quantity: t.quantity,
      measurement: t.measurement,
      price,
      stock: baseStock,
      position: t.position,
      isActive: true,
      unit: getUnitDisplay(t.quantity, t.measurement),
    };
  });
}
