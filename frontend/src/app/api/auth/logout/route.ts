import { jsonWithCookie, payloadRequest } from "@/lib/auth-proxy";

export async function POST(request: Request) {
  try {
    const result = await payloadRequest("/customers/logout", {
      method: "POST",
      cookie: request.headers.get("cookie"),
    });
    return jsonWithCookie({ success: result.response.ok }, result.response.ok ? 200 : 400, result.setCookie);
  } catch {
    return Response.json({ error: "Could not sign out." }, { status: 503 });
  }
}

