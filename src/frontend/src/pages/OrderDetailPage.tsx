import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { formatPrice } from '../utils/money';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { OrderStatus } from '../backend';

function getStatusVariant(status: OrderStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case OrderStatus.delivered:
      return 'default';
    case OrderStatus.shipped:
      return 'secondary';
    case OrderStatus.cancelled:
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.placed:
      return 'Placed';
    case OrderStatus.confirmed:
      return 'Confirmed';
    case OrderStatus.shipped:
      return 'Shipped';
    case OrderStatus.delivered:
      return 'Delivered';
    case OrderStatus.cancelled:
      return 'Cancelled';
    default:
      return String(status);
  }
}

function OrderDetailPageContent() {
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
        <Button onClick={() => navigate({ to: '/orders' })}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate({ to: '/orders' })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Order Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Package className="h-8 w-8" />
              Order #{order.orderId}
            </h1>
            <p className="text-muted-foreground">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Badge variant={getStatusVariant(order.status)} className="text-base px-4 py-2">
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">Product #{item.productId}</p>
                  <p className="text-sm text-muted-foreground">
                    Size: {item.size} | Color: {item.color}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {String(item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.contactInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.contactInfo.shippingAddress.phone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.contactInfo.shippingAddress.fullName}</p>
            <p className="text-muted-foreground">{order.contactInfo.shippingAddress.addressLine1}</p>
            {order.contactInfo.shippingAddress.addressLine2 && (
              <p className="text-muted-foreground">{order.contactInfo.shippingAddress.addressLine2}</p>
            )}
            <p className="text-muted-foreground">
              {order.contactInfo.shippingAddress.city}, {order.contactInfo.shippingAddress.zip}
            </p>
          </CardContent>
        </Card>

        {/* Promo Code Applied */}
        {order.promoApplied && order.promoCode && (
          <Card>
            <CardHeader>
              <CardTitle>Promo Code Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {order.promoCode} - 50% off
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Order Total */}
        <Card>
          <CardHeader>
            <CardTitle>Order Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalCents)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailPageContent />
    </ProtectedRoute>
  );
}
