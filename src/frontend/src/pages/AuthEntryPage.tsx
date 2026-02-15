import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthActions } from '../hooks/useAuthActions';
import { useFounderAccess } from '../hooks/useFounderAccess';
import { useIsCallerAdmin } from '../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingBag, Store, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthEntryPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isAuthenticated } = useAuthActions();
  const { verifyFounder, isVerifying, FOUNDER_EMAIL } = useFounderAccess();
  const { data: isAdmin, refetch: refetchAdmin } = useIsCallerAdmin();
  
  const [founderEmail, setFounderEmail] = useState('');
  const [showFounderInput, setShowFounderInput] = useState(false);

  const handleCustomerLogin = async () => {
    try {
      await login();
      navigate({ to: '/' });
    } catch (error) {
      // Error already handled in useAuthActions
    }
  };

  const handleSellerLogin = async () => {
    try {
      await login();
      
      // Check admin status after login
      const { data: adminStatus } = await refetchAdmin();
      
      if (adminStatus) {
        navigate({ to: '/admin' });
      } else {
        toast.error('You do not have seller access. Please contact an administrator.');
        navigate({ to: '/' });
      }
    } catch (error) {
      // Error already handled in useAuthActions
    }
  };

  const handleFounderVerification = async () => {
    if (!founderEmail.trim()) {
      toast.error('Please enter your founder email');
      return;
    }

    try {
      await verifyFounder.mutateAsync(founderEmail.trim());
      toast.success('Founder access verified successfully!');
      
      // Wait for admin status to refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      await refetchAdmin();
      
      navigate({ to: '/admin' });
    } catch (error: any) {
      console.error('Founder verification failed:', error);
      toast.error('Invalid founder email. Please check and try again.');
    }
  };

  // If already authenticated and admin, redirect to admin
  if (isAuthenticated && isAdmin) {
    navigate({ to: '/admin' });
    return null;
  }

  return (
    <div className="container-custom py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to sign in
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Login */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Customer Login
              </CardTitle>
              <CardDescription>
                Sign in to browse products, place orders, and track your purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCustomerLogin}
                disabled={isLoggingIn}
                className="w-full"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in as Customer'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Seller Login */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-secondary" />
                Seller Login
              </CardTitle>
              <CardDescription>
                Access the admin dashboard to manage products and orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSellerLogin}
                disabled={isLoggingIn}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in as Seller'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              or
            </span>
          </div>
        </div>

        {/* Founder Login */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Founder Login
            </CardTitle>
            <CardDescription>
              Verify your founder email to gain full administrative access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showFounderInput ? (
              <Button
                onClick={() => setShowFounderInput(true)}
                variant="outline"
                className="w-full"
              >
                I'm the Founder
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="founderEmail">Founder Email</Label>
                  <Input
                    id="founderEmail"
                    type="email"
                    placeholder="Enter your founder email"
                    value={founderEmail}
                    onChange={(e) => setFounderEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFounderVerification();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected: {FOUNDER_EMAIL}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleFounderVerification}
                    disabled={isVerifying || !founderEmail.trim()}
                    className="flex-1"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowFounderInput(false);
                      setFounderEmail('');
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
