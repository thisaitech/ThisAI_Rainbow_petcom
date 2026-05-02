import { Suspense } from "react";
import ProductPageClient from "@/components/product/ProductPageClient";

export default function ProductIndexPage() {
  return (
    <Suspense fallback={null}>
      <ProductPageClient slug="" />
    </Suspense>
  );
}
