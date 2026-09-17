import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function pickSetting(settings, keys) {
  for (const key of keys) {
    const value = settings[key];
    if (value != null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function extractGuildId(raw) {
  if (!raw) return '';
  const text = String(raw).trim();
  const channelMatch = text.match(/discord\.com\/channels\/(\d+)/);
  if (channelMatch) return channelMatch[1];
  const idMatch = text.match(/\d{15,25}/);
  return idMatch ? idMatch[0] : text;
}

async function liveFetch(admin) {
  const { data: settingsRows } = await admin.from('settings').select('key, value');
  const settings = {};
  (settingsRows || []).forEach((s) => {
    settings[s.key] = s.value;
  });

  const ip = pickSetting(settings, ['server_ip', 'minecraft_ip', 'ip']) || 'play.astraldupes.com';
  const port = pickSetting(settings, ['server_port', 'minecraft_port', 'port']) || '50565';
  const address = `${ip}:${port}`;
  const guildId = extractGuildId(
    pickSetting(settings, ['discord_server_id', 'discord_guild_id', 'discord_id'])
  );
  const botToken =
    process.env.DISCORD_BOT_TOKEN ||
    pickSetting(settings, ['discord_bot_token', 'discord_token']);

  let minecraft = {
    is_online: false,
    player_count: 0,
    max_players: 0,
    version: null,
    motd: null,
    ping: null,
  };

  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${address}`, { cache: 'no-store' });
    const data = await res.json();
    if (data?.online) {
      minecraft = {
        is_online: true,
        player_count: data.players?.online ?? 0,
        max_players: data.players?.max ?? 0,
        version: data.version || null,
        motd: data.motd?.clean?.[0] || data.motd?.raw?.[0] || null,
        ping: data.debug?.ping ?? null,
      };
    }
  } catch (e) {
    console.error('Minecraft live fetch error:', e.message);
  }

  let discord_members = 0;
  if (guildId && botToken) {
    try {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
        {
          headers: { Authorization: `Bot ${botToken}` },
          cache: 'no-store',
        }
      );
      const data = await res.json();
      if (res.ok) {
        discord_members = data.approximate_member_count || data.member_count || 0;
      } else {
        console.error('Discord live fetch error:', data);
      }
    } catch (e) {
      console.error('Discord live fetch error:', e.message);
    }
  }

  return {
    id: 1,
    ...minecraft,
    discord_members,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const admin = getAdminClient();

    const { data } = await admin
      .from('server_stats')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    const isFresh =
      data?.updated_at &&
      Date.now() - new Date(data.updated_at).getTime() < 60 * 1000;

    const stats = isFresh ? data : await liveFetch(admin);

    // On essaie d'écrire le cache, mais on n'échoue pas si ça plante
    if (!isFresh) {
      admin.from('server_stats').upsert(stats).then(() => {}).catch(() => {});
    }

    return jsonOk(stats, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error(err);
    return jsonError(err.message || 'Failed to load status', 500);
  }
}