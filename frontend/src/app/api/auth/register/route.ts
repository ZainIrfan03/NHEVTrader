import { errorMessage, jsonWithCookie, payloadRequest } from "@/lib/auth-proxy";

type Registration = { name?: unknown; phone?: unknown; email?: unknown; password?: unknown };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Registration;
  if (
    typeof body.name !== "string" || body.name.trim().length < 2 ||
    typeof body.phone !== "string" || body.phone.trim().length < 7 ||
    typeof body.email !== "string" || !body.email.includes("@") ||
    typeof body.password !== "string" || body.password.length < 8
  ) {
    return Response.json({ error: "Please provide a valid name, phone, email and 8-character password." }, { status: 400 });
  }

  const credentials = {
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email.trim().toLowerCase(),
    password: body.password,
  };

  try {
    const created = await payloadRequest("/customers", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (!created.response.ok) {
      return Response.json(
        { error: errorMessage(created.payload, "This account could not be created.") },
        { status: created.response.status },
      );
    }

    const loggedIn = await payloadRequest("/customers/login", {
      method: "POST",
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });
    if (!loggedIn.response.ok) {
      return Response.json({ error: "Account created. Please sign in." }, { status: 201 });
    }
    return jsonWithCookie({ user: loggedIn.payload.user }, 201, loggedIn.setCookie);
  } catch {
    return Response.json({ error: "Registration service is unavailable." }, { status: 503 });
  }
}

