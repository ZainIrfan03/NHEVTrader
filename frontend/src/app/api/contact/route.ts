const backendAPI = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (
    typeof body.name !== "string" || body.name.trim().length < 2 ||
    typeof body.phone !== "string" || body.phone.trim().length < 7 ||
    typeof body.email !== "string" || !body.email.includes("@") ||
    typeof body.message !== "string" || body.message.trim().length < 10
  ) {
    return Response.json({ error: "Please complete all fields with a detailed message." }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendAPI}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email.trim().toLowerCase(),
        message: body.message.trim(),
        status: "new",
      }),
      cache: "no-store",
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) return Response.json({ error: "Your message could not be submitted." }, { status: response.status });
    return Response.json({ success: true, inquiry: payload }, { status: 201 });
  } catch {
    return Response.json({ error: "Message service is currently unavailable." }, { status: 503 });
  }
}

