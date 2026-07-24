import { Rcon } from 'rcon-client';

const MINECRAFT_USERNAME = /^[a-zA-Z0-9_]{3,16}$/;

export function isValidMinecraftUsername(username) {
  return MINECRAFT_USERNAME.test(username);
}

export async function executeRconCommand(command) {
  const host = process.env.RCON_HOST;
  const port = parseInt(process.env.RCON_PORT || '25575', 10);
  const password = process.env.RCON_PASSWORD;

  if (!host || !password) {
    throw new Error('RCON is not configured');
  }

  const rcon = await Rcon.connect({ host, port, password });
  try {
    const response = await rcon.send(command);
    return response;
  } finally {
    await rcon.end();
  }
}

export async function setLuckPermsRank(username, rank) {
  if (!isValidMinecraftUsername(username)) {
    throw new Error('Invalid Minecraft username');
  }
  if (!rank || !/^[a-zA-Z0-9_-]+$/.test(rank)) {
    throw new Error('Invalid LuckPerms rank');
  }
  const command = `lp user ${username} parent set ${rank}`;
  return executeRconCommand(command);
}

export async function deliverPurchase(product, minecraftUsername) {
  const executed = [];

  if (product.luckperms_rank) {
    const response = await setLuckPermsRank(minecraftUsername, product.luckperms_rank);
    executed.push(`lp user ${minecraftUsername} parent set ${product.luckperms_rank}: ${response}`);
  }

  const commands = product.minecraft_commands || [];
  for (const raw of commands) {
    const cmd = raw.replace(/\{player\}/gi, minecraftUsername);
    const response = await executeRconCommand(cmd);
    executed.push(`${cmd}: ${response}`);
  }

  if (executed.length === 0 && product.category === 'ranks') {
    throw new Error('Product has no rank or commands configured');
  }

  return executed;
}
