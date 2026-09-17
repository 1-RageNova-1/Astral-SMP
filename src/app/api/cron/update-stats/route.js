import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const authHeader = request.headers.get('authorization') || '';
  const customHeader = request.headers.get('x-cron-secret') || '';

  return (
    querySecret === secret ||
    customHeader === secret ||
    authHeader === `Bearer ${secret}` ||
    authHeader === secret
  );
}

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

async function fetchMinecraft(ip, port) {
  const address = port ? `${ip}:${port}` : ip;
  const res = await fetch(`https://api.mcsrvstat.us/3/${address}`, {
    cache: 'no-store',
    headers: { 'User-Agent': 'AstralSMP-Status/1.0' },
  });
  const data = await res.json();

  if (!data?.online) {
    return {
      is_online: false,
      player_count: 0,
      max_players: data?.players?.max ?? 0,
      version: data?.version || null,
      motd: null,
      ping: null,
    };
  }

  return {
    is_online: true,
    player_count: data.players?.online ?? 0,
    max_players: data.players?.max ?? 0,
    version: data.version || null,
    motd: data.motd?.clean?.[0] || data.motd?.raw?.[0] || null,
    ping: data.debug?.ping ?? null,
  };
}

async function fetchDiscordMembers(guildId, botToken) {
  if (!guildId) return 0;

  if (botToken) {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
      {
        headers: { Authorization: `Bot ${botToken}` },
        cache: 'no-store',
      }
    );
    const data = await res.json();
    if (res.ok) {
      return data.approximate_member_count || data.member_count || 0;
    }
    console.error('Discord bot API error:', data);
  }

  // Fallback : widget Discord (à activer dans Réglages serveur > Widget)
  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (res.ok && typeof data.presence_count === 'number') {
      // widget ne donne pas toujours le total, seulement les online
      return data.presence_count;
    }
  } catch (e) {
    console.error('Discord widget error:', e.message);
  }

  return 0;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const admin = getAdminClient();
    const { data: settingsRows } = await admin.from('settings').select('key, value');

    const settings = {};
    (settingsRows || []).forEach((s) => {
      settings[s.key] = s.value;
    });

    const ip = pickSetting(settings, ['server_ip', 'minecraft_ip', 'ip']) || 'mc.astralsmp.fr';
    const port = pickSetting(settings, ['server_port', 'minecraft_port', 'port']) || '25565';
    const guildId = extractGuildId(
      pickSetting(settings, ['discord_server_id', 'discord_guild_id', 'discord_id'])
    );
    const botToken =
      process.env.DISCORD_BOT_TOKEN ||
      pickSetting(settings, ['discord_bot_token', 'discord_token']);

    const minecraft = await fetchMinecraft(ip, port);
    const discord_members = await fetchDiscordMembers(guildId, botToken);

    const payload = {
      id: 1,
      ...minecraft,
      discord_members,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin.from('server_stats').upsert(payload);
    if (error) throw error;

    return jsonOk({ success: true, ...payload });
  } catch (err) {
    console.error(err);
    return jsonError(err.message || 'Update failed', 500);
  }
}