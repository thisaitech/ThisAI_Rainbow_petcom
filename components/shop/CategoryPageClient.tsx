"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, Grid3X3, SlidersHorizontal, X } from "lucide-react";
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

interface CategoryPageClientProps {
  categorySlug: string;
}

const categoryMeta: Record<string, { name: string; description: string; image: string }> = {
  "aquarium-fish": {
    name: "Aquarium Fish",
    description: "Premium aquarium fish selected from the products you manage in admin.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
  },
  accessories: {
    name: "Accessories",
    description: "Premium aquarium accessories & supplies added from your admin catalog.",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200",
  },
  "birds-fish": {
    name: "Birds & Fish",
    description: "Browse your live birds, fish, and related products from the admin catalog.",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200",
  },
};

const titleCase = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function CategoryPageClient({ categorySlug }: CategoryPageClientProps) {
  const { storefrontProducts, birdsAndFishProducts } = useStorefrontProducts();
  const sourceProducts = categorySlug === "birds-fish" ? birdsAndFishProducts : storefrontProducts;
  const category = categoryMeta[categorySlug];

  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [draftPriceRange, setDraftPriceRange] = useState([0, 150000]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryProducts = useMemo(
    () => sourceProducts.filter((product) => product.category === categorySlug),
    [categorySlug, sourceProducts]
  );

  const availableSubcategories = useMemo(() => {
    const uniqueSubcategories = Array.from(
      new Set(
        categoryProducts
          .map((product) => product.subcategory)
          .filter((subcategory): subcategory is string => Boolean(subcategory))
      )
    );

    return uniqueSubcategories.map((subcategory) => ({
      slug: subcategory,
      name: titleCase(subcategory),
    }));
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    if (selectedSubcategories.length > 0) {
      result = result.filter((product) => product.subcategory && selectedSubcategories.includes(product.subcategory));
    }

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
      case "newest":
        result = result.filter((product) => product.isNew).concat(result.filter((product) => !product.isNew));
        break;
      default:
        result = result.filter((product) => product.isFeatured).concat(result.filter((product) => !product.isFeatured));
    }

    return result;
  }, [categoryProducts, selectedSubcategories, priceRange, inStockOnly, sortBy]);

  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((value) => value !== subcategory)
        : [...prev, subcategory]
    );
  };

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange([0, 150000]);
    setDraftPriceRange([0, 150000]);
    setInStockOnly(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {availableSubcategories.length > 0 && (
        <Accordion type="single" collapsible defaultValue="subcategories">
          <AccordionItem value="subcategories">
            <AccordionTrigger>Subcategories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {availableSubcategories.map((subcategory) => (
                  <div key={subcategory.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={subcategory.slug}
                      checked={selectedSubcategories.includes(subcategory.slug)}
                      onCheckedChange={() => toggleSubcategory(subcategory.slug)}
                    />
                    <Label htmlFor={subcategory.slug} className="text-sm cursor-pointer">
                      {subcategory.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

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
        <Checkbox
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  if (!category) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Button asChild className="mt-4">
            <Link href="/shop">Back to Shop</Link>
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
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <Badge variant="secondary" className="mb-4">{category.name.toUpperCase()}</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {category.name}
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              {category.description}
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
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedSubcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedSubcategories.map((subcategory) => (
                    <Badge
                      key={subcategory}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleSubcategory(subcategory)}
                    >
                      {availableSubcategories.find((item) => item.slug === subcategory)?.name ?? titleCase(subcategory)}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    Clear all
                  </Button>
                </div>
              )}

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
