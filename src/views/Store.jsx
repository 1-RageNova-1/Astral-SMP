'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Package, Key, Sparkles, Gift, Star, ShoppingCart, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: ShoppingCart },
  { value: 'ranks', label: 'Ranks', icon: Crown },
  { value: 'crates', label: 'Crates', icon: Package },
  { value: 'keys', label: 'Keys', icon: Key },
  { value: 'cosmetics', label: 'Cosmetics', icon: Sparkles },
  { value: 'bundles', label: 'Bundles', icon: Gift },
];

const categoryIcons = { ranks: Crown, crates: Package, keys: Key, cosmetics: Sparkles, bundles: Gift };

export default function Store() {
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { products: list } = await api.store.list();
      return list ?? [];
    },
  });

  const handleBuy = (product) => {
    // Navigate to checkout page with product information
    const params = new URLSearchParams({
      productId: product.id,
      productTitle: product.title,
      productPrice: (product.sale_price ?? product.price).toString(),
      productCategory: product.category || 'other',
    });

    if (product.description) {
      params.append('productDescription', product.description);
    }

    router.push(`/checkout?${params.toString()}`);
  };

  const displayProducts = products;

  const filtered = activeCategory === 'all'
    ? displayProducts
    : displayProducts.filter(p => p.category === activeCategory);

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Server Store"
            subtitle="Support the server and enhance your gameplay"
          />

          {/* Category Tabs */}
          <div className="flex justify-center mb-10">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="bg-secondary/50 h-auto flex-wrap">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger key={cat.value} value={cat.value} className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => {
                const CatIcon = categoryIcons[product.category] || ShoppingCart;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div className="glass rounded-xl p-5 h-full flex flex-col hover:border-primary/30 hover:glow-purple transition-all">
                      {/* Header badges */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          {product.category}
                        </Badge>
                        <div className="flex gap-1">
                          {product.is_featured && <Star className="w-4 h-4 text-yellow-400" />}
                          {product.is_popular && <Tag className="w-4 h-4 text-accent" />}
                          {product.sale_price && (
                            <Badge className="bg-destructive/20 text-destructive text-xs">SALE</Badge>
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                        <CatIcon className="w-7 h-7 text-primary" />
                      </div>

                      {/* Info */}
                      <h3 className="font-semibold text-foreground mb-1">{product.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">{product.description}</p>

                      {/* Features */}
                      {product.features && (
                        <ul className="space-y-1 mb-4">
                          {product.features.slice(0, 3).map((f, fi) => (
                            <li key={fi} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                          {product.features.length > 3 && (
                            <li className="text-xs text-primary">+{product.features.length - 3} more</li>
                          )}
                        </ul>
                      )}

                      {/* Price & Buy */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                        <div className="flex items-baseline gap-2">
                          {product.sale_price ? (
                            <>
                              <span className="text-lg font-bold text-accent">${product.sale_price}</span>
                              <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-primary">${product.price}</span>
                          )}
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs" onClick={() => handleBuy(product)}>
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Buy
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No products available yet.</p>
          )}

          {/* Payment info */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              Payments are coming soon. Checkout is ready and purchases can be reviewed before payment opens.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}