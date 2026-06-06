-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "low_stock_threshold" INTEGER;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "compare_at_price" DECIMAL(12,2),
ADD COLUMN     "height_cm" DECIMAL(8,2),
ADD COLUMN     "image_id" TEXT,
ADD COLUMN     "length_cm" DECIMAL(8,2),
ADD COLUMN     "width_cm" DECIMAL(8,2);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "product_type" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_title" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vendor" TEXT;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "product_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
