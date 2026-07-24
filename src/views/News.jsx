'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors = {
  update: 'bg-blue-500/20 text-blue-400',
  event: 'bg-green-500/20 text-green-400',
  announcement: 'bg-primary/20 text-primary',
  changelog: 'bg-yellow-500/20 text-yellow-400',
  guide: 'bg-accent/20 text-accent',
};

export default function News() {
  const { data: posts = [] } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { news } = await api.public.news();
      return news ?? [];
    },
  });

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading title="News & Updates" subtitle="Latest from Astral Dupes" />

          <div className="space-y-4">
            {posts.map((post, i) => (
              <GlassCard key={post.id} delay={i * 0.05}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    {post.category && (
                      <Badge className={`text-xs mb-2 ${categoryColors[post.category] || ''}`}>
                        {post.category}
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                  </div>
                  {post.is_featured && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 shrink-0">Featured</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt || post.content?.slice(0, 200)}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.published_date || post.created_at), 'MMM d, yyyy')}
                  </span>
                  {post.author_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {post.author_name}
                    </span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No news posts yet.</p>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
