import { useState, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetAllProducts } from '../hooks/useProducts';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { formatPrice } from '../utils/money';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function StorefrontPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const { data: products = [], isLoading } = useGetAllProducts();

  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Get all available sizes
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = Number(product.priceCents) / 100;
      const matchesSearch = searchQuery
        ? product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesSize =
        selectedSizes.length === 0 || product.sizes.some((s) => selectedSizes.includes(s));

      return matchesSearch && matchesPrice && matchesSize;
    });
  }, [products, searchQuery, priceRange, selectedSizes]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Price Range</Label>
        <div className="space-y-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={5000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {allSizes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Size</Label>
          <div className="space-y-2">
            {allSizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() => toggleSize(size)}
                />
                <label
                  htmlFor={`size-${size}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {size}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setPriceRange([0, 5000]);
            setSelectedSizes([]);
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1600x600.png"
          alt="Shop T-shirts"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Premium Printed T-Shirts
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Express yourself with unique designs
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <img
                  src="/assets/generated/empty-state.dim_1200x800.png"
                  alt="No products found"
                  className="w-64 h-64 object-contain mb-6 opacity-50"
                />
                <h3 className="text-2xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, 5000]);
                    setSelectedSizes([]);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.productId}
                    className="group cursor-pointer hover:shadow-medium transition-shadow"
                    onClick={() => navigate({ to: '/product/$productId', params: { productId: String(product.productId) } })}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                        <img
                          src={product.imageRef.getDirectURL()}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2 p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between w-full mt-2">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.priceCents)}
                        </span>
                        <div className="flex gap-1">
                          {product.sizes.slice(0, 3).map((size) => (
                            <Badge key={size} variant="secondary" className="text-xs">
                              {size}
                            </Badge>
                          ))}
                          {product.sizes.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{product.sizes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
