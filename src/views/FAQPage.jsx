'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'gameplay', label: 'Gameplay' },
  { value: 'store', label: 'Store' },
  { value: 'ranks', label: 'Ranks' },
  { value: 'technical_support', label: 'Support' },
  { value: 'discord', label: 'Discord' },
];

export default function FAQPage() {
  const [category, setCategory] = useState('all');

  const { data: items = [] } = useQuery({
    queryKey: ['faq'],
    queryFn: async () => {
      const { faq } = await api.public.faq();
      return faq ?? [];
    },
  });

  const filtered = category === 'all' ? items : items.filter((f) => f.category === category);

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="FAQ" subtitle="Frequently asked questions" />

          <div className="flex justify-center mb-8">
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="bg-secondary/50 h-auto flex-wrap">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {filtered.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="glass rounded-xl px-4 border-border/30">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No FAQ entries yet.</p>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
