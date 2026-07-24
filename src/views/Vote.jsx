'use client';

import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { ExternalLink, Gift, Star, Trophy } from 'lucide-react';

const VOTE_SITES = [
  { name: 'MinecraftServers.org', url: 'https://minecraftservers.org/', description: 'Vote and get 2 vote keys!' },
  { name: 'TopMinecraftServers', url: 'https://topminecraftservers.org/', description: 'Vote and get 2 vote keys!' },
  { name: 'Minecraft-Server-List', url: 'https://minecraft-server-list.com/', description: 'Vote and get 2 vote keys!' },
  { name: 'PlanetMinecraft', url: 'https://planetminecraft.com/', description: 'Vote and get 3 vote keys!' },
];

const REWARDS = [
  { votes: '1 Vote', reward: '2 Vote Keys', icon: Gift },
  { votes: '30 Daily Votes', reward: 'Monthly Voter Kit', icon: Star },
  { votes: 'Top Voter', reward: 'Exclusive Title + Crate', icon: Trophy },
];

export default function Vote() {
  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Vote for Us"
            subtitle="Support the server by voting daily and earn awesome rewards!"
          />

          {/* Rewards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {REWARDS.map((r, i) => {
              const Icon = r.icon;
              return (
                <GlassCard key={r.votes} delay={i * 0.1} glow="cyan" className="text-center">
                  <Icon className="w-8 h-8 text-accent mx-auto mb-3" />
                  <p className="font-semibold text-foreground">{r.votes}</p>
                  <p className="text-sm text-accent mt-1">{r.reward}</p>
                </GlassCard>
              );
            })}
          </div>

          {/* Vote Links */}
          <div className="space-y-3">
            {VOTE_SITES.map((site, i) => (
              <GlassCard key={site.name} delay={i * 0.1} hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{site.name}</h3>
                    <p className="text-sm text-muted-foreground">{site.description}</p>
                  </div>
                  <a href={site.url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground glow-cyan">
                      Vote <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}