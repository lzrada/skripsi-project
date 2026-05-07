import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByIdService, getRelatedProductsService } from "@/service/product.service";
import ProductDetailClient from "@/components/(user)/product-detail/ProductDetailClient";
import { Product } from "@/types/product";

type Props = { params: Promise<{ product: string }> };

function serializeProduct(product: Product): Product {
  return {
    ...product,
    createdAt: product.createdAt ? ((product.createdAt as any)?.toDate ? (product.createdAt as any).toDate().toISOString() : product.createdAt) : null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: productId } = await params;
  const product = await getProductByIdService(productId);
  if (!product) return { title: "Produk tidak ditemukan — Rizky Elektronik" };
  return {
    title: `${product.name} — Rizky Elektronik`,
    description: product.description?.slice(0, 150) || `Beli ${product.name} di Rizky Elektronik Blitar. Harga terbaik, garansi toko.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { product: productId } = await params;

  const raw = await getProductByIdService(productId);
  if (!raw) notFound();

  const product = serializeProduct(raw);

  const rawRelated = await getRelatedProductsService(product.category, productId, 4).catch(() => []);
  const related = rawRelated.map(serializeProduct);

  return <ProductDetailClient product={product} related={related} />;
}
