import { z } from 'zod';
import { requireAdmin } from '@/lib/server/adminAuth';
import { executeRconCommand } from '@/lib/server/rcon';
import { logAudit, getClientIp } from '@/lib/server/audit';
import { jsonOk, jsonError } from '@/lib/server/api-response';

const schema = z.object({
  command: z.string().min(1).max(256),
});

/** Admin-only RCON proxy — never exposed to public clients */
export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = schema.parse(await request.json());
  } catch {
    return jsonError('Invalid command', 400);
  }

  // Block dangerous patterns
  const blocked = [/stop/i, /ban\s/i, /op\s/i, /deop\s/i, /whitelist\s+off/i];
  if (blocked.some((re) => re.test(body.command))) {
    return jsonError('Command not allowed', 403);
  }

  try {
    const response = await executeRconCommand(body.command);
    await logAudit({
      action: 'rcon_command',
      category: 'api',
      details: body.command,
      userId: auth.user.id,
      userName: auth.profile.display_name,
      ipAddress: getClientIp(request),
    });
    return jsonOk({ response });
  } catch (err) {
    return jsonError(err.message || 'RCON failed', 500);
  }
}
