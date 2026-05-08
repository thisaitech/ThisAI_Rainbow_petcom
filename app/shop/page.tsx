"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, Grid3X3, SlidersHorizontal, X } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductCarousel from "@/components/ui/ProductCarousel";
import { categories } from "@/lib/data";
import { useStorefrontProducts } from "@/lib/useStorefrontProducts";
import { formatPrice } from "@/lib/utils";

export default function ShopPage() {
  const { storefrontProducts } = useStorefrontProducts();
  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [draftPriceRange, setDraftPriceRange] = useState([0, 150000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rawSearchQuery, setRawSearchQuery] = useState("");
  const [urlFilter, setUrlFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRawSearchQuery(params.get("search")?.trim() ?? "");
    setUrlFilter(params.get("filter")?.trim().toLowerCase() ?? "");
    const brand = params.get("brand")?.trim().toLowerCase();
    if (brand) {
      setSelectedBrands([brand]);
    }
  }, []);

  const searchQuery = rawSearchQuery.toLowerCase();

  const availableBrands = useMemo(() => {
    const brands = Array.from(
      new Set(storefrontProducts.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)))
    );

    return brands
      .map((brand) => ({ name: brand, slug: brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [storefrontProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...storefrontProducts];

    if (searchQuery) {
      result = result.filter((product) => {
        const searchableFields = [
          product.name,
          product.category,
          product.subcategory ?? "",
          product.description,
          ...(product.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableFields.includes(searchQuery);
      });
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => {
        const productBrand = p.brand?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return productBrand ? selectedBrands.includes(productBrand) : false;
      });
    }

    // Filter by price
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    if (newArrivalsOnly || urlFilter === "new") {
      result = result.filter((p) => p.isNew);
    }

    if (urlFilter === "featured" || urlFilter === "bestseller") {
      result = result.filter((p) => p.isFeatured);
    }

    if (urlFilter === "deals" || urlFilter === "sale") {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Sort
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
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      default:
        result = result.filter((p) => p.isFeatured).concat(result.filter((p) => !p.isFeatured));
    }

    return result;
  }, [storefrontProducts, searchQuery, selectedCategories, selectedBrands, priceRange, inStockOnly, newArrivalsOnly, urlFilter, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 150000]);
    setDraftPriceRange([0, 150000]);
    setInStockOnly(false);
    setNewArrivalsOnly(false);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((value) => value !== brand)
        : [...prev, brand]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="text-sm cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {availableBrands.length > 0 && (
        <Accordion type="single" collapsible defaultValue="brands">
          <AccordionItem value="brands">
            <AccordionTrigger>Brands</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {availableBrands.map((brand) => (
                  <div key={brand.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.slug}`}
                      checked={selectedBrands.includes(brand.slug)}
                      onCheckedChange={() => toggleBrand(brand.slug)}
                    />
                    <Label htmlFor={`brand-${brand.slug}`} className="text-sm cursor-pointer">
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Price Range */}
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

      {/* Stock */}
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="newArrivals"
          checked={newArrivalsOnly || urlFilter === "new"}
          onCheckedChange={(checked) => setNewArrivalsOnly(checked as boolean)}
        />
        <Label htmlFor="newArrivals" className="text-sm cursor-pointer">
          New Arrivals
        </Label>
      </div>

      {/* Clear Filters */}
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

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">SHOP ALL</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              All Products
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              Discover our complete collection of premium fish, pets, and accessories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Smooth Drag Carousel */}
      <ProductCarousel
        products={storefrontProducts.filter(p => p.isFeatured).slice(0, 8)}
        variant="smooth"
        title="✨ Featured Collection"
        subtitle="Hand-picked premium products for discerning aquarium lovers"
        accentColor="primary"
      />

      {/* Hot Deals - Coverflow Style */}
      <ProductCarousel
        products={storefrontProducts.filter(p => p.originalPrice).slice(0, 8)}
        variant="coverflow"
        title="🔥 Hot Deals"
        subtitle="Limited time offers - Don't miss out!"
        showViewAll
        viewAllLink="/shop?filter=deals"
        accentColor="coral"
      />

      {/* New Arrivals - Smooth Scroll Carousel */}
      <ProductCarousel
        products={storefrontProducts.filter(p => p.isNew).slice(0, 10)}
        variant="smooth"
        title="New Arrivals"
        subtitle="Fresh drops just for you"
        showViewAll
        viewAllLink="/shop?filter=new"
        accentColor="accent"
      />

      {/* Shop Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {selectedCategories.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedCategories.length}
                          </Badge>
                        )}
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
                  {searchQuery && (
                    <Badge variant="outline" className="ml-2 normal-case">
                      Search: {rawSearchQuery}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Grid Toggle */}
                  <div className="hidden md:flex items-center border rounded-lg">
                    <button
                      type="button"
                      onClick={() => setGridCols(2)}
                      className={`p-2 ${gridCols === 2 ? "bg-muted" : ""}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGridCols(4)}
                      className={`p-2 ${gridCols === 4 ? "bg-muted" : ""}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort */}
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

              {/* Active Filters */}
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery || urlFilter) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="outline" className="normal-case">
                      {rawSearchQuery}
                    </Badge>
                  )}
                  {selectedCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleCategory(cat)}
                    >
                      {categories.find((c) => c.id === cat)?.name}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  {selectedBrands.map((brand) => (
                    <Badge
                      key={brand}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleBrand(brand)}
                    >
                      {availableBrands.find((item) => item.slug === brand)?.name ?? brand}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                  {urlFilter && (
                    <Badge variant="outline" className="normal-case">
                      Filter: {urlFilter}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Product Grid */}
              <div className={`grid ${gridColsClass[gridCols]} gap-4 md:gap-6`}>
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
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
