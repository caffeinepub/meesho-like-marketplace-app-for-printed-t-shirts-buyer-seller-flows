import { useNavigate } from '@tanstack/react-router';
import { useGetMyOrders } from '../hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ShoppingBag } from 'lucide-react';
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

function OrdersPageContent() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetMyOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
          <div className="rounded-full bg-muted p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">No orders yet</h1>
            <p className="text-muted-foreground">
              Start shopping to see your orders here!
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
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.orderId}
            className="cursor-pointer hover:shadow-medium transition-shadow"
            onClick={() => navigate({ to: '/order/$orderId', params: { orderId: String(order.orderId) } })}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order #{order.orderId}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <p>Deliver to: {order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(order.totalCents)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  );
}
