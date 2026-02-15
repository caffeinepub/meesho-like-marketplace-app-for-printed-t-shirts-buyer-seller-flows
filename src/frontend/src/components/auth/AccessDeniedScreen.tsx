import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="container-custom py-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
        <div className="rounded-full bg-destructive/10 p-6">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Storefront
          </Button>
          <Button onClick={() => navigate({ to: '/auth' })} variant="outline">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
