import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const admin = getAdminClient();

    const { data: settingsRows } = await admin
      .from('settings')
      .select('key, value');

    const settings = {};
    (settingsRows || []).forEach((s) => {
      settings[s.key] = s.value;
    });

    const ip = settings.server_ip || 'play.astraldupes.com';
    const port = settings.server_port || '25565';
    const discordGuildId = settings.discord_server_id;

    let minecraft = {
      is_online: false,
      player_count: 0,
      max_players: 0,
      version: null,
      motd: null,
      ping: null,
    };

    try {
      const res = await fetch(`https://api.mcsrvstat.us/3/${ip}:${port}`, {
        next: { revalidate: 0 },
      });
      const data = await res.json();

      if (data.online) {
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
      console.error('Minecraft status error:', e.message);
    }

    let discord_members = 0;
    if (process.env.DISCORD_BOT_TOKEN && discordGuildId) {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${discordGuildId}?with_counts=true`,
          {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          }
        );
        const data = await res.json();
        discord_members = data.approximate_member_count || data.member_count || 0;
      } catch (e) {
        console.error('Discord members error:', e.message);
      }
    }

    const { error } = await admin
      .from('server_stats')
      .upsert({
        id: 1,
        is_online: minecraft.is_online,
        player_count: minecraft.player_count,
        max_players: minecraft.max_players,
        version: minecraft.version,
        motd: minecraft.motd,
        ping: minecraft.ping,
        discord_members,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return jsonOk({
      success: true,
      minecraft,
      discord_members,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return jsonError(err.message || 'Update failed', 500);
  }
}