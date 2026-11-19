const backendAPI = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const response = await fetch(`${backendAPI}/storefront/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(request.headers.get("cookie") ? { Cookie: request.headers.get("cookie")! } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload: unknown = await response.json();
    return Response.json(payload, { status: response.status });
  } catch {
    return Response.json(
      { error: "Checkout service is currently unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}

