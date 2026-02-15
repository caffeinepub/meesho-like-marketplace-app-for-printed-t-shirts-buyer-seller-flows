import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts } from '../../hooks/useProducts';
import { useDeleteProduct } from '../../hooks/useAdminProducts';
import { useGrantAdminRole, useRevokeAdminRole } from '../../hooks/useAdminAccess';
import { useSaveMarketplaceName, useSaveMarketplaceLogo, useSaveMarketplaceTagline, useGetMarketplaceSettings } from '../../hooks/useMarketplaceSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2, Plus, Edit, Trash2, UserPlus, UserMinus, Store, Upload, Copy, CheckCircle2, Rocket } from 'lucide-react';
import { formatPrice } from '../../utils/money';
import { toast } from 'sonner';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import type { ProductId } from '../../backend';
import { fileToUint8Array } from '../../utils/images';

function AdminDashboardPageContent() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useGetAllProducts();
  const { data: marketplaceSettings } = useGetMarketplaceSettings();
  const deleteProduct = useDeleteProduct();
  const grantAdmin = useGrantAdminRole();
  const revokeAdmin = useRevokeAdminRole();
  const saveMarketplaceName = useSaveMarketplaceName();
  const saveMarketplaceLogo = useSaveMarketplaceLogo();
  const saveMarketplaceTagline = useSaveMarketplaceTagline();

  const [principalInput, setPrincipalInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [taglineInput, setTaglineInput] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleDelete = async (productId: ProductId) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleGrantAdmin = async () => {
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      await grantAdmin.mutateAsync(principalInput.trim());
      toast.success('Admin role granted successfully');
      setPrincipalInput('');
    } catch (error: any) {
      console.error('Grant admin failed:', error);
      const errorMessage = error.message || 'Failed to grant admin role';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to grant admin roles');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleRevokeAdmin = async () => {
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      await revokeAdmin.mutateAsync(principalInput.trim());
      toast.success('Admin role revoked successfully');
      setPrincipalInput('');
    } catch (error: any) {
      console.error('Revoke admin failed:', error);
      const errorMessage = error.message || 'Failed to revoke admin role';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to revoke admin roles');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleSaveDisplayName = async () => {
    if (!displayNameInput.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    try {
      await saveMarketplaceName.mutateAsync(displayNameInput.trim());
      toast.success('Display name updated successfully');
      setDisplayNameInput('');
    } catch (error: any) {
      console.error('Save display name failed:', error);
      const errorMessage = error.message || 'Failed to update display name';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to update branding');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleSaveTagline = async () => {
    if (!taglineInput.trim()) {
      toast.error('Please enter a tagline');
      return;
    }

    try {
      await saveMarketplaceTagline.mutateAsync(taglineInput.trim());
      toast.success('Tagline updated successfully');
      setTaglineInput('');
    } catch (error: any) {
      console.error('Save tagline failed:', error);
      const errorMessage = error.message || 'Failed to update tagline';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to update branding');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) {
      toast.error('Please select a logo image');
      return;
    }

    try {
      const imageData = await fileToUint8Array(logoFile);
      await saveMarketplaceLogo.mutateAsync(imageData);
      toast.success('Logo updated successfully');
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error: any) {
      console.error('Save logo failed:', error);
      const errorMessage = error.message || 'Failed to update logo';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to update branding');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCopyLiveLink = () => {
    const liveUrl = window.location.origin;
    navigator.clipboard.writeText(liveUrl).then(() => {
      setLinkCopied(true);
      toast.success('Live app link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="access">Admin Access</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Product Management</h2>
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
                        src={product.imageRef.getDirectURL()}
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
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <h2 className="text-2xl font-semibold">Store Branding</h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Current Branding
              </CardTitle>
              <CardDescription>
                Your marketplace is currently branded as "{marketplaceSettings?.displayName || 'AMERICAN PRINTERS'}"
                {marketplaceSettings?.tagline && ` with tagline "${marketplaceSettings.tagline}"`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketplaceSettings?.logo && (
                <div className="flex items-center gap-4">
                  <img
                    src={marketplaceSettings.logo.getDirectURL()}
                    alt="Current logo"
                    className="h-16 w-16 object-contain border rounded"
                  />
                  <p className="text-sm text-muted-foreground">Current logo</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Name</CardTitle>
              <CardDescription>
                Change the name displayed in your marketplace header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">New Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter new display name"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveDisplayName}
                disabled={saveMarketplaceName.isPending || !displayNameInput.trim()}
              >
                {saveMarketplaceName.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Display Name
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tagline</CardTitle>
              <CardDescription>
                Set a tagline or subtitle for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="Enter tagline"
                  value={taglineInput}
                  onChange={(e) => setTaglineInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Current: {marketplaceSettings?.tagline || 'Unique printers, legend stop.'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveTagline}
                disabled={saveMarketplaceTagline.isPending || !taglineInput.trim()}
              >
                {saveMarketplaceTagline.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Tagline
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Upload a custom logo for your marketplace (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Image</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                />
              </div>
              {logoPreview && (
                <div className="flex items-center gap-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-16 object-contain border rounded"
                  />
                  <p className="text-sm text-muted-foreground">Preview</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveLogo}
                disabled={saveMarketplaceLogo.isPending || !logoFile}
              >
                {saveMarketplaceLogo.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Admin Access Tab */}
        <TabsContent value="access" className="space-y-6">
          <h2 className="text-2xl font-semibold">Admin Access Control</h2>

          <Card>
            <CardHeader>
              <CardTitle>Manage Admin Roles</CardTitle>
              <CardDescription>
                Grant or revoke admin access to users by their Principal ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  placeholder="Enter principal ID"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={handleGrantAdmin}
                disabled={grantAdmin.isPending || !principalInput.trim()}
              >
                {grantAdmin.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                Grant Admin
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevokeAdmin}
                disabled={revokeAdmin.isPending || !principalInput.trim()}
              >
                {revokeAdmin.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserMinus className="mr-2 h-4 w-4" />
                Revoke Admin
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Publishing Tab */}
        <TabsContent value="publishing" className="space-y-6">
          <h2 className="text-2xl font-semibold">Publishing & Deployment</h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Automatic Deployment
              </CardTitle>
              <CardDescription>
                Your marketplace updates are deployed automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Every change you make to products, branding, or settings is automatically deployed and goes live immediately. There's no need for manual deployment.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">How it works:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Product changes are live instantly</li>
                    <li>Branding updates appear immediately</li>
                    <li>All changes are automatically saved to the blockchain</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Application Link</CardTitle>
              <CardDescription>
                Share this link with your customers to access your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="liveUrl"
                    value={window.location.origin}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyLiveLink}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    {linkCopied ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the copy button to copy the live app link to your clipboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
