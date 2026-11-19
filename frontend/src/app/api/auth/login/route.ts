import { errorMessage, jsonWithCookie, payloadRequest } from "@/lib/auth-proxy";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
  if (typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await payloadRequest("/customers/login", {
      method: "POST",
      body: JSON.stringify({ email: body.email.trim().toLowerCase(), password: body.password }),
    });
    if (!result.response.ok) {
      return Response.json(
        { error: errorMessage(result.payload, "Email or password is incorrect.") },
        { status: result.response.status },
      );
    }
    return jsonWithCookie({ user: result.payload.user }, 200, result.setCookie);
  } catch {
    return Response.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
}

