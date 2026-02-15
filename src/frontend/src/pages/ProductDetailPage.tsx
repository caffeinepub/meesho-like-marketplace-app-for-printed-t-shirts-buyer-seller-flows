import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct } from '../hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/money';
import { blobToImageUrl } from '../utils/images';
import { useCart } from '../cart/CartContext';
import { toast } from 'sonner';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';
import { useGetCallerUserProfile } from '../hooks/useCurrentUser';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProduct(Number(productId));
  const { addToCart } = useCart();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addToCart({
      productId: product.productId,
      title: product.title,
      priceCents: Number(product.priceCents),
      size: selectedSize,
      color: selectedColor,
      quantity,
      imageBlob: product.imageBlob
    });

    toast.success('Added to cart!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate({ to: '/' })}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <>
      <div className="container-custom py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={blobToImageUrl(product.imageBlob)}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-bold text-primary">{formatPrice(product.priceCents)}</p>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Size Selection */}
                <div className="space-y-3">
                  <Label className="text-base">Select Size</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[60px]"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <Label className="text-base">Select Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? 'default' : 'outline'}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <Label className="text-base">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            {/* Product Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Available Sizes:</span>
                <div className="flex gap-1">
                  {product.sizes.map((size) => (
                    <Badge key={size} variant="secondary">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Available Colors:</span>
                <div className="flex gap-1">
                  {product.colors.map((color) => (
                    <Badge key={color} variant="secondary">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileSetupDialog open={showProfileSetup} />
    </>
  );
}
