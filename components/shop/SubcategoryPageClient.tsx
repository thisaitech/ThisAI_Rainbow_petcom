"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, Grid3X3, SlidersHorizontal } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatPrice } from "@/lib/utils";
import { useStorefrontProducts } from "@/lib/useStorefrontProducts";

interface SubcategoryPageClientProps {
  categorySlug: string;
  subcategorySlug: string;
}

const titleCase = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function SubcategoryPageClient({ categorySlug, subcategorySlug }: SubcategoryPageClientProps) {
  const { storefrontProducts, birdsAndFishProducts } = useStorefrontProducts();
  const sourceProducts = categorySlug === "birds-fish" ? birdsAndFishProducts : storefrontProducts;

  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [draftPriceRange, setDraftPriceRange] = useState([0, 150000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const subcategoryProducts = useMemo(
    () =>
      sourceProducts.filter(
        (product) => product.category === categorySlug && product.subcategory === subcategorySlug
      ),
    [categorySlug, sourceProducts, subcategorySlug]
  );

  const filteredProducts = useMemo(() => {
    let result = [...subcategoryProducts];

    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);

    if (inStockOnly) {
      result = result.filter((product) => product.inStock);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = result.filter((product) => product.isFeatured).concat(result.filter((product) => !product.isFeatured));
    }

    return result;
  }, [inStockOnly, priceRange, sortBy, subcategoryProducts]);

  const clearFilters = () => {
    setPriceRange([0, 150000]);
    setDraftPriceRange([0, 150000]);
    setInStockOnly(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={draftPriceRange}
                onValueChange={setDraftPriceRange}
                onValueCommit={setPriceRange}
                min={0}
                max={150000}
                step={1000}
              />
              <div className="flex items-center justify-between text-sm">
                <span>{formatPrice(draftPriceRange[0])}</span>
                <span>{formatPrice(draftPriceRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center space-x-2">
        <Checkbox id="inStock" checked={inStockOnly} onCheckedChange={(checked) => setInStockOnly(checked as boolean)} />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  if (subcategoryProducts.length === 0) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Subcategory not found</h1>
          <Button asChild className="mt-4">
            <Link href={`/shop/${categorySlug}`}>Back to Category</Link>
          </Button>
          <Button asChild variant="outline" className="mt-4 ml-3">
            <Link href="/shop">All Products</Link>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <section
        className="relative py-12 md:py-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${subcategoryProducts[0].images[0]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <Badge variant="secondary" className="mb-4">{titleCase(categorySlug)}</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {titleCase(subcategorySlug)}
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Explore the products you added in admin for {titleCase(subcategorySlug)}.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                <FilterContent />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 overflow-y-auto h-full pb-20">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} products
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center border rounded-lg">
                    <button type="button" onClick={() => setGridCols(2)} className={`p-2 ${gridCols === 2 ? "bg-muted" : ""}`}>
                      <Grid className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setGridCols(4)} className={`p-2 ${gridCols === 4 ? "bg-muted" : ""}`}>
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={`grid ${gridColsClass[gridCols]} gap-4 md:gap-6`}>
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
