export const DEFAULT_SETTINGS = {
  site_name: 'Astral Smp',
  site_description: 'The ultimate Minecraft duplication server',
  server_ip: 'play.astraldupes.com',
  server_port: '25565',
  server_version: '1.20.4',
  discord_invite_url: '',
  discord_webhook_url: '',
  discord_server_id: '',
  store_currency: 'EUR',
  store_tax_rate: '0',
};

export function settingsArrayToObject(settings = [], { mergeDefaults = true } = {}) {
  const merged = mergeDefaults ? { ...DEFAULT_SETTINGS } : {};

  settings.forEach((setting) => {
    if (setting?.key) {
      merged[setting.key] = setting.value ?? '';
    }
  });

  return merged;
}

export function settingsObjectToArray(settings) {
  return Object.entries(settings).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
    category: getSettingsCategory(key),
  }));
}

export function getSettingsCategory(key) {
  if (key.startsWith('server_')) return 'server';
  if (key.startsWith('discord_')) return 'discord';
  if (key.startsWith('store_')) return 'store';
  return 'general';
}