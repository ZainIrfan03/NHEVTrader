import { payloadRequest } from "@/lib/auth-proxy";

export async function GET(request: Request) {
  try {
    const result = await payloadRequest("/orders?depth=1&limit=50&sort=-createdAt", {
      cookie: request.headers.get("cookie"),
    });
    if (!result.response.ok) return Response.json({ docs: [] }, { status: result.response.status });
    return Response.json({ docs: result.payload.docs || [] });
  } catch {
    return Response.json({ docs: [] }, { status: 503 });
  }
}

