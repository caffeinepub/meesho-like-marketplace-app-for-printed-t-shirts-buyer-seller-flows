import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct } from '../../hooks/useProducts';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useAdminProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { fileToUint8Array, blobToImageUrl } from '../../utils/images';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

function ProductEditorPageContent() {
  const { productId } = useParams({ strict: false }) as { productId?: string };
  const navigate = useNavigate();
  const isEditMode = !!productId;

  const { data: existingProduct, isLoading: loadingProduct } = useGetProduct(
    isEditMode ? Number(productId) : undefined!
  );
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    sizes: '',
    colors: '',
    imageFile: null as File | null,
    imageBlob: null as Uint8Array | null
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        title: existingProduct.title,
        description: existingProduct.description,
        price: String(Number(existingProduct.priceCents) / 100),
        sizes: existingProduct.sizes.join(', '),
        colors: existingProduct.colors.join(', '),
        imageFile: null,
        imageBlob: existingProduct.imageBlob
      });
      setImagePreview(blobToImageUrl(existingProduct.imageBlob));
    }
  }, [existingProduct]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const blob = await fileToUint8Array(file);
      setFormData({ ...formData, imageFile: file, imageBlob: blob });
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageBlob) {
      toast.error('Please select an image');
      return;
    }

    const priceCents = Math.round(parseFloat(formData.price) * 100);
    const sizes = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const colors = formData.colors.split(',').map((c) => c.trim()).filter(Boolean);

    if (sizes.length === 0) {
      toast.error('Please add at least one size');
      return;
    }

    if (colors.length === 0) {
      toast.error('Please add at least one color');
      return;
    }

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync({
          productId: Number(productId),
          title: formData.title,
          description: formData.description,
          priceCents: BigInt(priceCents),
          sizes,
          colors,
          imageBlob: formData.imageBlob
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync({
          title: formData.title,
          description: formData.description,
          priceCents: BigInt(priceCents),
          sizes,
          colors,
          imageBlob: formData.imageBlob
        });
        toast.success('Product created successfully');
      }
      navigate({ to: '/admin' });
    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error(error.message || 'Failed to save product');
    }
  };

  if (isEditMode && loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate({ to: '/admin' })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? 'Edit Product' : 'Create Product'}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image *</Label>
                {imagePreview ? (
                  <div className="relative aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFormData({ ...formData, imageFile: null, imageBlob: null });
                        setImagePreview('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload product image
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Cool Graphic T-Shirt"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product..."
                  rows={4}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="499.00"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes (comma-separated) *</Label>
                <Input
                  id="sizes"
                  required
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL, XXL"
                />
                <p className="text-xs text-muted-foreground">
                  Enter sizes separated by commas
                </p>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label htmlFor="colors">Colors (comma-separated) *</Label>
                <Input
                  id="colors"
                  required
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Black, White, Navy, Red"
                />
                <p className="text-xs text-muted-foreground">
                  Enter colors separated by commas
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {createProduct.isPending || updateProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductEditorPage() {
  return (
    <ProtectedRoute requireAdmin>
      <ProductEditorPageContent />
    </ProtectedRoute>
  );
}
