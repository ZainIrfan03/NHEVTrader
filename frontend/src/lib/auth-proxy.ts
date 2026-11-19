import "server-only";

const backendAPI = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses?: Array<{
    id?: string | null;
    label?: string | null;
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    province: string;
    postalCode?: string | null;
    isDefault?: boolean | null;
  }> | null;
};

export async function payloadRequest(
  path: string,
  options: RequestInit & { cookie?: string | null } = {},
) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (options.cookie) headers.set("Cookie", options.cookie);

  const response = await fetch(`${backendAPI}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  delete payload.token;
  return { response, payload, setCookie: response.headers.get("set-cookie") };
}

export function jsonWithCookie(payload: unknown, status: number, setCookie?: string | null) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (setCookie) headers.set("Set-Cookie", setCookie);
  return new Response(JSON.stringify(payload), { status, headers });
}

export function errorMessage(payload: Record<string, unknown>, fallback: string) {
  if (typeof payload.message === "string") return payload.message;
  if (Array.isArray(payload.errors)) {
    const first = payload.errors[0] as { message?: unknown } | undefined;
    if (typeof first?.message === "string") return first.message;
  }
  return fallback;
}

