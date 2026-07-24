'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { DEFAULT_SETTINGS, settingsArrayToObject, settingsObjectToArray } from '@/lib/settings';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Server, MessageSquare, ShoppingCart, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const qc = useQueryClient();

  useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { settings: data } = await api.admin.settings.list();
      const merged = settingsArrayToObject(data);
      setSettings(merged);
      return data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const saveMut = useMutation({
    mutationFn: async (settingsToSave) => {
      const payload = settingsObjectToArray(settingsToSave);
      return api.admin.settings.save(payload);
    },
    onSuccess: ({ settings: savedSettings }) => {
      setSettings(settingsArrayToObject(savedSettings));
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      qc.invalidateQueries({ queryKey: ['public-settings'] });
      qc.refetchQueries({ queryKey: ['public-settings'] });
      toast.success('Settings saved!');
    },
  });

  const handleSave = () => saveMut.mutate(settings);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saveMut.isPending} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" /> Save All
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-secondary/50 mb-6">
          <TabsTrigger value="general"><Settings className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
          <TabsTrigger value="server"><Server className="w-3.5 h-3.5 mr-1.5" /> Server</TabsTrigger>
          <TabsTrigger value="discord"><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Discord</TabsTrigger>
          <TabsTrigger value="store"><ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Store</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div><Label>Site Name</Label><Input value={settings.site_name} onChange={e => setSettings({ ...settings, site_name: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label>Site Description</Label><Input value={settings.site_description} onChange={e => setSettings({ ...settings, site_description: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="server">
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div><Label>Server IP</Label><Input value={settings.server_ip} onChange={e => setSettings({ ...settings, server_ip: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label>Server Port</Label><Input value={settings.server_port} onChange={e => setSettings({ ...settings, server_port: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label>Server Version</Label><Input value={settings.server_version} onChange={e => setSettings({ ...settings, server_version: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="discord">
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div><Label>Webhook URL</Label><Input value={settings.discord_webhook_url} onChange={e => setSettings({ ...settings, discord_webhook_url: e.target.value })} className="bg-secondary/50 mt-1" placeholder="https://discord.com/api/webhooks/..." /></div>
              <div><Label>Invite URL</Label><Input value={settings.discord_invite_url} onChange={e => setSettings({ ...settings, discord_invite_url: e.target.value })} className="bg-secondary/50 mt-1" placeholder="https://discord.gg/..." /></div>
              <div><Label>Server ID</Label><Input value={settings.discord_server_id} onChange={e => setSettings({ ...settings, discord_server_id: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="store">
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div><Label>Currency</Label><Input value={settings.store_currency} onChange={e => setSettings({ ...settings, store_currency: e.target.value })} className="bg-secondary/50 mt-1" /></div>
              <div><Label>Tax Rate (%)</Label><Input value={settings.store_tax_rate} onChange={e => setSettings({ ...settings, store_tax_rate: e.target.value })} className="bg-secondary/50 mt-1" /></div>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
