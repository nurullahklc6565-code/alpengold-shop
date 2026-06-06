import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils/slug";

export type CreateCollectionData = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  active?: boolean;
};

export const collectionService = {
  async list() {
    return prisma.collection.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: { _count: { select: { productCollections: true } } },
    });
  },

  async listActive() {
    return prisma.collection.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  },

  async get(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        productCollections: {
          include: { product: { select: { id: true, name: true, slug: true, status: true } } },
          orderBy: { position: "asc" },
        },
        _count: { select: { productCollections: true } },
      },
    });
  },

  async create(data: CreateCollectionData) {
    return prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        active: data.active ?? true,
      },
    });
  },

  async update(id: string, data: Partial<CreateCollectionData>) {
    return prisma.collection.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug || generateSlug(data.name ?? "") }),
        ...("description" in data && { description: data.description ?? null }),
        ...("imageUrl" in data && { imageUrl: data.imageUrl ?? null }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  },

  async delete(id: string) {
    return prisma.collection.delete({ where: { id } });
  },
};
