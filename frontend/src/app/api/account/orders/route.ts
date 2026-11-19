import { errorMessage, payloadRequest } from "@/lib/auth-proxy";

export async function GET(request: Request) {
  try {
    const result = await payloadRequest("/orders?depth=3&limit=50&sort=-createdAt", {
      cookie: request.headers.get("cookie"),
    });
    if (!result.response.ok) return Response.json({ docs: [] }, { status: result.response.status });
    return Response.json({ docs: result.payload.docs || [] });
  } catch {
    return Response.json({ docs: [] }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: unknown };
    if (typeof body.orderId !== "string" || !body.orderId.trim()) {
      return Response.json({ error: "A valid order is required." }, { status: 400 });
    }

    const result = await payloadRequest("/storefront/orders/cancel", {
      method: "POST",
      cookie: request.headers.get("cookie"),
      body: JSON.stringify({ orderId: body.orderId }),
    });
    if (!result.response.ok) {
      return Response.json(
        { error: typeof result.payload.error === "string" ? result.payload.error : errorMessage(result.payload, "Order could not be cancelled.") },
        { status: result.response.status },
      );
    }
    return Response.json(result.payload);
  } catch {
    return Response.json({ error: "Order service is unavailable." }, { status: 503 });
  }
}

