'use client';

import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { History, Target, Users, Sparkles, Rocket } from 'lucide-react';

const SECTIONS = [
  {
    icon: History,
    title: 'Our History',
    content: 'Astral Dupes was founded in 2023 by a group of passionate Minecraft players who wanted to create something different. What started as a small SMP server quickly grew into a thriving community of thousands.',
    color: 'text-primary',
  },
  {
    icon: Target,
    title: 'Community Goals',
    content: 'We aim to provide the most enjoyable and fair Minecraft experience. Our community-first approach means every update is shaped by player feedback. We strive for transparency, fairness, and fun.',
    color: 'text-accent',
  },
  {
    icon: Sparkles,
    title: 'Features',
    content: 'Custom plugins, unique game mechanics, anti-cheat protection, weekly events, a balanced economy, custom enchantments, clan system, and so much more. We\'re constantly adding new content.',
    color: 'text-yellow-400',
  },
  {
    icon: Rocket,
    title: 'Future Plans',
    content: 'We\'re working on new game modes, a mobile companion app, expanded PvP arenas, a tournament system, and deeper Discord integration. Season 4 is already in development with exciting new features.',
    color: 'text-green-400',
  },
];

export default function About() {
  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="About Astral Dupes"
            subtitle="Learn about our server, our community, and our vision"
          />

          <div className="space-y-6">
            {SECTIONS.map((section, i) => {
              const Icon = section.icon;
              return (
                <GlassCard key={section.title} delay={i * 0.1} hover={false}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-secondary shrink-0`}>
                      <Icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Staff Team Quick Link */}
          <GlassCard delay={0.5} className="mt-10 text-center" glow="purple">
            <Users className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Meet Our Team</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our dedicated staff team works around the clock to keep Astral Dupes running smoothly.
            </p>
            <a href="/staff" className="text-sm text-primary hover:underline">View Staff Page →</a>
          </GlassCard>
        </div>
      </section>
    </PageLayout>
  );
}