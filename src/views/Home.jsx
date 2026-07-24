'use client';

import PageLayout from '@/components/shared/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServerStatus from '@/components/home/ServerStatus';
import GameModes from '@/components/home/GameModes';
import StatsSection from '@/components/home/StatsSection';
import NewsPreview from '@/components/home/NewsPreview';
import StorePreview from '@/components/home/StorePreview';

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <ServerStatus />
      <GameModes />
      <StatsSection />
      <StorePreview />
      <NewsPreview />
    </PageLayout>
  );
}