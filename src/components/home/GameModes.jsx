import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Sword, Heart, Paintbrush, Copy } from 'lucide-react';

const MODES = [
  {
    title: 'SMP',
    description: 'Classic survival multiplayer with economy, clans, and custom enchantments.',
    icon: Sword,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    title: 'Lifesteal',
    description: 'Steal hearts from other players. Last one standing wins the season.',
    icon: Heart,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
  {
    title: 'Creative',
    description: 'Unlimited resources. Build whatever you can imagine with WorldEdit.',
    icon: Paintbrush,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    title: 'Dupe Survival',
    description: 'Our signature mode. Dupe items legally and dominate the economy.',
    icon: Copy,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export default function GameModes() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Game Modes"
          subtitle="Choose your playstyle. Each mode offers a unique experience."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODES.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <GlassCard key={mode.title} glow="purple" delay={i * 0.1}>
                <div className={`w-12 h-12 rounded-xl ${mode.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${mode.color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{mode.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}