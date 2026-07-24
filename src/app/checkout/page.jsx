'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Package, Key, Sparkles, Gift, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const categoryIcons = { ranks: Crown, crates: Package, keys: Key, cosmetics: Sparkles, bundles: Gift };

export default function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get product info from URL params
  const productId = searchParams.get('productId');
  const productTitle = searchParams.get('productTitle');
  const productPrice = searchParams.get('productPrice');
  const productCategory = searchParams.get('productCategory');
  const productDescription = searchParams.get('productDescription');

  if (!productId || !productTitle || !productPrice) {
    return (
      <PageLayout>
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <GlassCard>
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Invalid Checkout</h2>
                <p className="text-muted-foreground mb-6">No product information provided.</p>
                <Button onClick={() => router.push('/store')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
                </Button>
              </div>
            </GlassCard>
          </div>
        </section>
      </PageLayout>
    );
  }

  const CatIcon = categoryIcons[productCategory] || ShoppingCart;

  const handleProceedToPayment = () => {
    if (!minecraftUsername.trim()) {
      toast.error('Please enter your Minecraft username');
      return;
    }

    if (minecraftUsername.trim().length < 3 || minecraftUsername.trim().length > 16) {
      toast.error('Minecraft username must be 3-16 characters');
      return;
    }

    setIsProcessing(true);

    // Navigate to payment page with all necessary info
    const params = new URLSearchParams({
      productId,
      productTitle,
      productPrice,
      productCategory: productCategory || 'other',
      minecraftUsername: minecraftUsername.trim(),
    });

    if (productDescription) {
      params.append('productDescription', productDescription);
    }

    router.push(`/payment?${params.toString()}`);
  };

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title="Checkout"
            subtitle="Review your purchase and enter your details"
          />

          <GlassCard className="mt-8">
            {/* Product Summary */}
            <div className="mb-8 pb-8 border-b border-border/30">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Product Summary</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <CatIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-lg">{productTitle}</h4>
                  {productCategory && (
                    <span className="text-xs text-muted-foreground capitalize">{productCategory}</span>
                  )}
                  {productDescription && (
                    <p className="text-sm text-muted-foreground mt-1">{productDescription}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${productPrice}</p>
                </div>
              </div>
            </div>

            {/* Minecraft Username */}
            <div className="mb-8">
              <Label htmlFor="minecraftUsername">Minecraft Username</Label>
              <Input
                id="minecraftUsername"
                value={minecraftUsername}
                onChange={(e) => setMinecraftUsername(e.target.value)}
                placeholder="Your in-game name"
                className="mt-1 bg-secondary/50"
                maxLength={16}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the exact username of your Minecraft account. This is where your rank will be delivered.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/store')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </GlassCard>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Your payment information is secure. We use industry-standard encryption.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}