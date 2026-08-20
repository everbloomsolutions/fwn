import { Category, ICategory } from './category.model';

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export const createCategory = async (data: CreateCategoryData): Promise<ICategory> => {
  const category = new Category(data);
  return await category.save();
};

export const getCategories = async (active?: boolean): Promise<ICategory[]> => {
  const query: Record<string, unknown> = {};
  if (active !== undefined) {
    query.isActive = active;
  }
  return await Category.find(query).sort({ name: 1 }).exec();
};

export const getCategoryBySlug = async (slug: string): Promise<ICategory | null> => {
  return await Category.findOne({ slug }).exec();
};

export const getCategoryById = async (id: string): Promise<ICategory | null> => {
  return await Category.findById(id).exec();
};

export const updateCategory = async (
  id: string,
  data: Partial<CreateCategoryData>
): Promise<ICategory | null> => {
  return await Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
};

export const deleteCategory = async (id: string): Promise<ICategory | null> => {
  return await Category.findByIdAndDelete(id).exec();
};
