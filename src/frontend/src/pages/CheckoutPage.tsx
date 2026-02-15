import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../cart/CartContext';
import { useCreateOrder } from '../hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { formatPrice } from '../utils/money';
import { toast } from 'sonner';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';
import { useGetCallerUserProfile } from '../hooks/useCurrentUser';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { isPromoCodeValid, calculateDiscount } from '../utils/promoCodes';
import type { OrderItem } from '../backend';

function CheckoutPageContent() {
  const navigate = useNavigate();
  const { cart, getTotalCents, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    zip: ''
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoValidated, setPromoValidated] = useState(false);
  const [promoError, setPromoError] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const subtotalCents = getTotalCents();
  const { discountCents, finalTotalCents, isValid: isPromoValid } = calculateDiscount(
    subtotalCents,
    promoValidated && promoCode ? promoCode : null
  );

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    setPromoValidated(false);
    setPromoError('');
  };

  const handlePromoCodeBlur = () => {
    if (promoCode.trim()) {
      if (isPromoCodeValid(promoCode)) {
        setPromoValidated(true);
        setPromoError('');
      } else {
        setPromoValidated(false);
        setPromoError('Invalid promo code. Please check and try again.');
      }
    } else {
      setPromoValidated(false);
      setPromoError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.productId,
      quantity: BigInt(item.quantity),
      size: item.size,
      color: item.color
    }));

    try {
      const order = await createOrder.mutateAsync({
        items: orderItems,
        contactInfo: {
          email: formData.email.trim(),
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2 || undefined,
            city: formData.city,
            zip: formData.zip
          }
        },
        promoCode: promoValidated && promoCode ? promoCode.trim() : null
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate({ to: '/order-confirmation/$orderId', params: { orderId: String(order.orderId) } });
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate({ to: '/' })}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <>
      <div className="container-custom py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate({ to: '/cart' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send your order confirmation to this email
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      required
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input
                        id="zip"
                        required
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Promo Code */}
                  <div className="space-y-2">
                    <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id="promoCode"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => handlePromoCodeChange(e.target.value)}
                          onBlur={handlePromoCodeBlur}
                          className={
                            promoCode && promoValidated
                              ? 'border-success'
                              : promoError
                              ? 'border-destructive'
                              : ''
                          }
                        />
                        {promoCode && promoValidated && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                        )}
                        {promoError && (
                          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </div>
                    {promoValidated && isPromoValid && (
                      <Alert className="border-success/50 bg-success/10">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <AlertDescription className="text-success">
                          Promo code applied! You'll save 50% on this order.
                        </AlertDescription>
                      </Alert>
                    )}
                    {promoError && (
                      <Alert className="border-destructive/50 bg-destructive/10">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          {promoError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.title}</span>
                        <span>{formatPrice(item.priceCents * item.quantity)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.size} / {item.color} × {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotalCents)}</span>
                  </div>

                  {promoValidated && isPromoValid && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount (50% off)</span>
                      <span>-{formatPrice(discountCents)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(finalTotalCents)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ProfileSetupDialog open={showProfileSetup} />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
