export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable de entorno ${key} no configurada`);
  }
  return value;
}

export function getAuthorizationUrl(state: string): string {
  const clientId = getEnv("DISCORD_CLIENT_ID");
  const redirectUri = getEnv("DISCORD_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
    state,
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<string> {
  const clientId = getEnv("DISCORD_CLIENT_ID");
  const clientSecret = getEnv("DISCORD_CLIENT_SECRET");
  const redirectUri = getEnv("DISCORD_REDIRECT_URI");

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al intercambiar código: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function getUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener usuario: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    username: data.username,
    avatar: data.avatar ?? null,
  };
}

export async function getUserGuilds(
  accessToken: string
): Promise<DiscordGuild[]> {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener guilds: ${response.status}`);
  }

  const data = await response.json();
  return data.map((g: { id: string; name: string }) => ({
    id: g.id,
    name: g.name,
  }));
}

export function isMemberOfPeekGuild(guilds: DiscordGuild[]): boolean {
  const guildId = getEnv("DISCORD_GUILD_ID");
  return guilds.some((g) => g.id === guildId);
}
