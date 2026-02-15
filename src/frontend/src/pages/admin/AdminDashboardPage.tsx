import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts } from '../../hooks/useProducts';
import { useDeleteProduct } from '../../hooks/useAdminProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/money';
import { blobToImageUrl } from '../../utils/images';
import { toast } from 'sonner';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import type { ProductId } from '../../backend';

function AdminDashboardPageContent() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (productId: ProductId) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={() => navigate({ to: '/admin/product/new' })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No products yet</p>
          <Button onClick={() => navigate({ to: '/admin/product/new' })}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Product
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.productId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={blobToImageUrl(product.imageBlob)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-3 p-4">
                <div className="w-full">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.priceCents)}
                    </span>
                    <div className="flex gap-1">
                      {product.sizes.slice(0, 3).map((size) => (
                        <Badge key={size} variant="secondary" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate({
                        to: '/admin/product/$productId',
                        params: { productId: String(product.productId) }
                      })
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.productId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardPageContent />
    </ProtectedRoute>
  );
}
