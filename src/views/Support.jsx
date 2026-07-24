'use client';

import PageLayout from '@/components/shared/PageLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/use-settings';

export default function Support() {
  const { data: settings } = useSettings();
  const discordInviteUrl = settings?.discord_invite_url;
  const serverIp = settings?.server_ip;

  const copyServerIp = async () => {
    if (!serverIp) return;
    await navigator.clipboard.writeText(serverIp);
    toast.success('Server IP copied!');
  };

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={discordInviteUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              disabled={!discordInviteUrl}
              className="bg-primary hover:bg-primary/90 glow-purple w-full sm:w-auto"
            >
              Join Discord Support
            </Button>
          </a>
          <Button
            variant="outline"
            onClick={copyServerIp}
            disabled={!serverIp}
            className="w-full sm:w-auto"
          >
            Copy Server IP
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
