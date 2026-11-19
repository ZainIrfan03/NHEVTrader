import { payloadRequest } from "@/lib/auth-proxy";

export async function GET(request: Request) {
  try {
    const result = await payloadRequest("/customers/me?depth=1", {
      cookie: request.headers.get("cookie"),
    });
    if (!result.response.ok || !result.payload.user) {
      return Response.json({ user: null }, { status: 200 });
    }
    return Response.json({ user: result.payload.user });
  } catch {
    return Response.json({ user: null }, { status: 200 });
  }
}

