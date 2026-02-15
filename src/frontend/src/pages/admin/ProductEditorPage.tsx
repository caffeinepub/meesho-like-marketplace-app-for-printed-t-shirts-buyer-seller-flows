import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetProduct } from '../../hooks/useProducts';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useAdminProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { fileToUint8Array } from '../../utils/images';
import { ExternalBlob } from '../../backend';

function ProductEditorPageContent() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const productId = params.productId ? Number(params.productId) : undefined;
  const isEditMode = productId !== undefined;

  const { data: existingProduct, isLoading: loadingProduct } = useGetProduct(productId!);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.title);
      setDescription(existingProduct.description);
      setPrice((Number(existingProduct.priceCents) / 100).toFixed(2));
      setSizes(existingProduct.sizes);
      setColors(existingProduct.colors);
      setImagePreview(existingProduct.imageRef.getDirectURL());
    }
  }, [existingProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price || sizes.length === 0 || colors.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!imageFile && !isEditMode) {
      toast.error('Please select a product image');
      return;
    }

    try {
      const priceCents = BigInt(Math.round(parseFloat(price) * 100));
      let imageData: Uint8Array;

      if (imageFile) {
        imageData = await fileToUint8Array(imageFile);
      } else if (existingProduct) {
        imageData = await existingProduct.imageRef.getBytes();
      } else {
        toast.error('No image available');
        return;
      }

      if (isEditMode && productId) {
        await updateProduct.mutateAsync({
          productId,
          title: title.trim(),
          description: description.trim(),
          priceCents,
          sizes,
          colors,
          imageBlob: imageData
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          priceCents,
          sizes,
          colors,
          imageBlob: imageData
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Product' : 'Create New Product'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image *</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes *</Label>
              <div className="flex gap-2">
                <Input
                  id="sizes"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  placeholder="e.g., S, M, L, XL"
                />
                <Button type="button" onClick={addSize} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => (
                  <Badge key={size} variant="secondary" className="gap-1">
                    {size}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSize(size)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colors">Colors *</Label>
              <div className="flex gap-2">
                <Input
                  id="colors"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  placeholder="e.g., Red, Blue, Green"
                />
                <Button type="button" onClick={addColor} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color) => (
                  <Badge key={color} variant="secondary" className="gap-1">
                    {color}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeColor(color)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="flex-1"
              >
                {(createProduct.isPending || updateProduct.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{isEditMode ? 'Update Product' : 'Create Product'}</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/admin' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
