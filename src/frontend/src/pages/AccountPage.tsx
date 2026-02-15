import { useState } from 'react';
import { Copy, Check, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useGetOrCreateReferralCode, useApplyReferralCode, useGetOwnReferralSummary } from '../hooks/useReferral';

function AccountPageContent() {
  const { data: referralCode, isLoading: codeLoading } = useGetOrCreateReferralCode();
  const { data: referralSummary } = useGetOwnReferralSummary();
  const applyReferralCode = useApplyReferralCode();

  const [copied, setCopied] = useState(false);
  const [codeToApply, setCodeToApply] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeToApply.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setIsApplying(true);
    try {
      await applyReferralCode.mutateAsync(codeToApply.trim());
      toast.success('Referral code applied successfully!');
      setCodeToApply('');
    } catch (error: any) {
      console.error('Apply referral code error:', error);
      const errorMessage = error.message || 'Failed to apply referral code';
      if (errorMessage.includes('Cannot refer yourself')) {
        toast.error('You cannot use your own referral code');
      } else if (errorMessage.includes('Invalid referral code')) {
        toast.error('Invalid referral code');
      } else if (errorMessage.includes('already applied')) {
        toast.error('You have already applied a referral code');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your referral code and track your referrals</p>
        </div>

        <Separator />

        {/* Your Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code with friends to earn rewards when they sign up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {codeLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={referralCode || ''}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apply Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle>Apply a Referral Code</CardTitle>
            <CardDescription>
              Enter a referral code from a friend to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApplyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  value={codeToApply}
                  onChange={(e) => setCodeToApply(e.target.value)}
                  disabled={isApplying}
                />
              </div>
              <Button type="submit" disabled={isApplying || !codeToApply.trim()}>
                {isApplying ? 'Applying...' : 'Apply Code'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        {referralSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Referral Stats
              </CardTitle>
              <CardDescription>
                Track your referral performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">Total Referrals</div>
                  <div className="text-2xl font-bold">{referralSummary.referredUsers.length}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">Total Commissions</div>
                  <div className="text-2xl font-bold">{Number(referralSummary.totalCommissions)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountPageContent />
    </ProtectedRoute>
  );
}
