import { createRemoteJWKSet, jwtVerify } from "jose";

export interface ResolvePrototypeIdentityArgs {
  request: Request;
  cloudflareEnv: Pick<Env, "CF_ACCESS_AUD" | "CF_ACCESS_TEAM_DOMAIN">;
  environmentName: string;
  devAccessEmail?: string | null;
}

export async function resolvePrototypeIdentity({
  request,
  cloudflareEnv,
  environmentName,
  devAccessEmail,
}: ResolvePrototypeIdentityArgs): Promise<string | null> {
  if (environmentName === "development" || environmentName === "test") {
    const devIdentity = normalizeEmail(devAccessEmail);
    if (devIdentity) {
      return devIdentity;
    }
  }

  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt) {
    return null;
  }

  const teamDomain = normalizeTeamDomain(cloudflareEnv.CF_ACCESS_TEAM_DOMAIN);
  const audience = cloudflareEnv.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) {
    throw new Error("Cloudflare Access is not configured for protected routes.");
  }

  const issuer = `https://${teamDomain}`;
  const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
  const { payload } = await jwtVerify(jwt, jwks, {
    issuer,
    audience,
  });

  return normalizeEmail(typeof payload.email === "string" ? payload.email : null);
}

function normalizeTeamDomain(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return trimmed === "" ? null : trimmed;
}

function normalizeEmail(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "" ? null : normalized;
}
