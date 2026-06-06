import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils/slug";

export type CreateCategoryData = {
  name: string;
  slug?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  featured?: boolean;
  active?: boolean;
  position?: number;
};

export const categoryService = {
  async list() {
    return prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    });
  },

  async listFlat() {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true },
    });
  },

  async get(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: { orderBy: { position: "asc" } },
        _count: { select: { products: true } },
      },
    });
  },

  async create(data: CreateCategoryData) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        parentId: data.parentId ?? null,
        imageUrl: data.imageUrl ?? null,
        description: data.description ?? null,
        featured: data.featured ?? false,
        active: data.active ?? true,
        position: data.position ?? 0,
      },
    });
  },

  async update(id: string, data: Partial<CreateCategoryData>) {
    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name, slug: data.slug || generateSlug(data.name) }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...("parentId" in data && { parentId: data.parentId ?? null }),
        ...("imageUrl" in data && { imageUrl: data.imageUrl ?? null }),
        ...("description" in data && { description: data.description ?? null }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.position !== undefined && { position: data.position }),
      },
    });
  },

  async delete(id: string) {
    const cat = await prisma.category.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { children: true, products: true } } },
    });
    if (cat._count.children > 0)
      throw new Error("Alt kategori içeren kategori silinemez.");
    if (cat._count.products > 0)
      throw new Error("Ürün içeren kategori silinemez. Önce ürünleri taşıyın.");
    return prisma.category.delete({ where: { id } });
  },
};
