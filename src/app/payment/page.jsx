'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/api/apiClient';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Crown, Package, Key, Sparkles, Gift, ShoppingCart, ArrowLeft, Clock, CreditCard, AlertCircle } from 'lucide-react';

const categoryIcons = { ranks: Crown, crates: Package, keys: Key, cosmetics: Sparkles, bundles: Gift };

export default function Payment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [purchaseState, setPurchaseState] = useState({ status: 'idle', message: '' });
  const hasRecordedPurchase = useRef(false);

  // Get product info from URL params
  const productId = searchParams.get('productId');
  const productTitle = searchParams.get('productTitle');
  const productPrice = searchParams.get('productPrice');
  const productCategory = searchParams.get('productCategory');
  const productDescription = searchParams.get('productDescription');
  const minecraftUsername = searchParams.get('minecraftUsername');

  useEffect(() => {
    if (!productId || !productTitle || !productPrice || !minecraftUsername || hasRecordedPurchase.current) {
      return;
    }

    hasRecordedPurchase.current = true;
    setPurchaseState({ status: 'saving', message: 'Saving your purchase details...' });

    api.store.buy({
      product_id: productId,
      minecraft_username: minecraftUsername,
      payment_method: 'paypal',
    })
      .then(({ message }) => {
        setPurchaseState({
          status: 'saved',
          message: message || 'Your purchase information has been saved.',
        });
      })
      .catch((error) => {
        setPurchaseState({
          status: 'error',
          message: error.message || 'We could not save this purchase yet. Please try again later.',
        });
      });
  }, [minecraftUsername, productId, productPrice, productTitle]);

  if (!productId || !productTitle || !productPrice || !minecraftUsername) {
    return (
      <PageLayout>
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <GlassCard>
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Invalid Payment</h2>
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

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title="Payment"
            subtitle="Complete your purchase"
          />

          <GlassCard className="mt-8">
            {/* Payments Coming Soon Banner */}
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payments Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We're currently setting up our payment processing system. PayPal integration will be available shortly.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      {purchaseState.status === 'idle'
                        ? 'Enter checkout details first, then return here when payments are ready.'
                        : purchaseState.message}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-8 pb-8 border-b border-border/30">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Order Summary</h3>
              <div className="space-y-4">
                {/* Product */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <CatIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold">{productTitle}</h4>
                    {productCategory && (
                      <span className="text-xs text-muted-foreground capitalize">{productCategory}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${productPrice}</p>
                  </div>
                </div>

                {/* Minecraft Username */}
                {minecraftUsername && (
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Minecraft Username</span>
                    <span className="text-sm font-semibold text-foreground">{minecraftUsername}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${productPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods Preview */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Accepted Payment Methods</h3>
              <div className="flex items-center gap-3 opacity-50">
                <div className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/30 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">PayPal</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/30 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Stripe</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/store')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Return to Home
              </Button>
            </div>
          </GlassCard>

          {/* Support Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}