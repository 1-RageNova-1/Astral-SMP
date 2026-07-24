'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Crown, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorePreview() {
  const { data: products = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { products: list } = await api.store.list({ featured: true, limit: 4 });
      return list ?? [];
    },
  });

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured Items</h2>
            <p className="text-sm text-muted-foreground mt-1">Support the server and get exclusive perks</p>
          </div>
          <Link href="/store">
            <Button variant="outline" size="sm" className="text-xs">
              View Store <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-5 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{product.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  ${product.sale_price ?? product.price}
                </span>
                <Link href="/store">
                  <Button size="sm" variant="ghost" className="text-xs h-7">
                    <ShoppingCart className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">Store items coming soon.</p>
        )}
      </div>
    </section>
  );
}