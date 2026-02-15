import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, Package } from 'lucide-react';
import { formatPrice } from '../utils/money';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function OrderConfirmationPageContent() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(Number(orderId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => navigate({ to: '/' })}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-success/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-success" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>
        </div>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.orderId}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items */}
            <div className="space-y-3">
              <h3 className="font-semibold">Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Product #{item.productId} ({item.size} / {item.color}) × {String(item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Shipping Address */}
            <div className="space-y-2">
              <h3 className="font-semibold">Shipping Address</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.zip}
                </p>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalCents)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate({ to: '/orders' })} variant="outline">
            View All Orders
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <ProtectedRoute>
      <OrderConfirmationPageContent />
    </ProtectedRoute>
  );
}
