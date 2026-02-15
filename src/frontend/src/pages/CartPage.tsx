import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../cart/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/money';
import { blobToImageUrl } from '../utils/images';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalCents } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
          <div className="rounded-full bg-muted p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">
              Add some awesome T-shirts to get started!
            </p>
          </div>
          <Button onClick={() => navigate({ to: '/' })} size="lg">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={`${item.productId}-${item.size}-${item.color}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={blobToImageUrl(item.imageBlob)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.priceCents * item.quantity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.priceCents)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.title} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.priceCents * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(getTotalCents())}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate({ to: '/checkout' })}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
