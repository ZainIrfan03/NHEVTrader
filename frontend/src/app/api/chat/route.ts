const backendAPI = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${backendAPI}/storefront/chat`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "frontend-proxy",
      },
      body,
    });
    const payload = await response.text();
    return new Response(payload, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return Response.json(
      { error: "The assistant is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
