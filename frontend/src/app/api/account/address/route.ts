import { errorMessage, payloadRequest } from "@/lib/auth-proxy";

type AddressInput = {
  label?: unknown;
  recipientName?: unknown;
  phone?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  province?: unknown;
  postalCode?: unknown;
};

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie");
  const body = (await request.json().catch(() => ({}))) as AddressInput;
  if (
    typeof body.recipientName !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.addressLine1 !== "string" ||
    typeof body.city !== "string" ||
    typeof body.province !== "string"
  ) {
    return Response.json({ error: "Required address information is missing." }, { status: 400 });
  }

  try {
    const session = await payloadRequest("/customers/me?depth=0", { cookie });
    const user = session.payload.user as { id?: string; addresses?: unknown[] } | undefined;
    if (!user?.id) return Response.json({ error: "Please sign in first." }, { status: 401 });

    const address = {
      label: typeof body.label === "string" ? body.label.trim() : "Home",
      recipientName: body.recipientName.trim(),
      phone: body.phone.trim(),
      addressLine1: body.addressLine1.trim(),
      addressLine2: typeof body.addressLine2 === "string" ? body.addressLine2.trim() : undefined,
      city: body.city.trim(),
      province: body.province.trim(),
      postalCode: typeof body.postalCode === "string" ? body.postalCode.trim() : undefined,
      isDefault: !user.addresses?.length,
    };
    const updated = await payloadRequest(`/customers/${user.id}`, {
      method: "PATCH",
      cookie,
      body: JSON.stringify({ addresses: [...(user.addresses || []), address] }),
    });
    if (!updated.response.ok) {
      return Response.json(
        { error: errorMessage(updated.payload, "Address could not be saved.") },
        { status: updated.response.status },
      );
    }
    return Response.json({ user: updated.payload.doc });
  } catch {
    return Response.json({ error: "Address service is unavailable." }, { status: 503 });
  }
}

