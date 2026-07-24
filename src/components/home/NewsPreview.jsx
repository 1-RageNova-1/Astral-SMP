'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function NewsPreview() {
  const { data: posts = [] } = useQuery({
    queryKey: ['news-preview'],
    queryFn: async () => {
      try {
        const res = await api.public.news({ limit: 3 });

        // ALWAYS return an array (prevents React Query error)
        return res?.news ?? [];
      } catch (err) {
        console.error('News preview fetch error:', err);
        return []; // fallback so UI never breaks
      }
    },
  });

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Stay up to date with server updates
            </p>
          </div>

          <Link href="/news">
            <Button variant="outline" size="sm" className="text-xs">
              All News <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-5 hover:border-primary/30 transition-all"
            >
              {post.category && (
                <Badge variant="secondary" className="text-xs mb-3 bg-primary/10 text-primary">
                  {post.category}
                </Badge>
              )}

              <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                {post.title}
              </h3>

              <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt || post.content?.slice(0, 120)}
              </p>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {post.published_date || post.created_at
                  ? format(new Date(post.published_date || post.created_at), 'MMM d, yyyy')
                  : 'Unknown date'}
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">
            No news yet.
          </p>
        )}
      </div>
    </section>
  );
}