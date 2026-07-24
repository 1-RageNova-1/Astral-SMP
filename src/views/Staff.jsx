'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Star, User } from 'lucide-react';

const roleIcons = { owner: Crown, admin: Shield, moderator: Star, helper: User };
const roleColors = {
  owner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  moderator: 'bg-primary/20 text-primary border-primary/30',
  helper: 'bg-accent/20 text-accent border-accent/30',
};

export default function Staff() {
  const { data: members = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { staff } = await api.public.staff();
      return staff ?? [];
    },
  });

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading title="Our Team" subtitle="Meet the people behind Astral Dupes" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((member, i) => {
              const Icon = roleIcons[member.role] || User;
              return (
                <GlassCard key={member.id} delay={i * 0.1}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        <Badge className={`text-xs ${roleColors[member.role]}`}>{member.role}</Badge>
                      </div>
                      {member.minecraft_username && (
                        <p className="text-xs text-muted-foreground mb-2">@{member.minecraft_username}</p>
                      )}
                      {member.description && (
                        <p className="text-sm text-muted-foreground">{member.description}</p>
                      )}
                      {member.discord_tag && (
                        <p className="text-xs text-primary mt-2">{member.discord_tag}</p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
          {members.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Staff list coming soon.</p>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
