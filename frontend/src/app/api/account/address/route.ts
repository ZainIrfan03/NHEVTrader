import { errorMessage, payloadRequest } from "@/lib/auth-proxy";

type AddressInput = {
  addressId?: unknown;
  addressIndex?: unknown;
  label?: unknown;
  recipientName?: unknown;
  phone?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  province?: unknown;
  postalCode?: unknown;
};

type StoredAddress = {
  id?: string | null;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode?: string | null;
  isDefault?: boolean | null;
};

function isValidAddress(body: AddressInput) {
  return (
    typeof body.recipientName === "string" && body.recipientName.trim().length >= 2 &&
    typeof body.phone === "string" && body.phone.trim().length >= 7 &&
    typeof body.addressLine1 === "string" && body.addressLine1.trim().length >= 3 &&
    typeof body.city === "string" && body.city.trim().length >= 2 &&
    typeof body.province === "string" && body.province.trim().length >= 2
  );
}

function normalizedAddress(body: AddressInput) {
  return {
    label: typeof body.label === "string" && body.label.trim() ? body.label.trim() : "Home",
    recipientName: (body.recipientName as string).trim(),
    phone: (body.phone as string).trim(),
    addressLine1: (body.addressLine1 as string).trim(),
    addressLine2: typeof body.addressLine2 === "string" ? body.addressLine2.trim() : undefined,
    city: (body.city as string).trim(),
    province: (body.province as string).trim(),
    postalCode: typeof body.postalCode === "string" ? body.postalCode.trim() : undefined,
  };
}

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie");
  const body = (await request.json().catch(() => ({}))) as AddressInput;
  if (!isValidAddress(body)) {
    return Response.json({ error: "Required address information is missing." }, { status: 400 });
  }

  try {
    const session = await payloadRequest("/customers/me?depth=0", { cookie });
    const user = session.payload.user as { id?: string; addresses?: StoredAddress[] } | undefined;
    if (!user?.id) return Response.json({ error: "Please sign in first." }, { status: 401 });

    const address = {
      ...normalizedAddress(body),
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

export async function PATCH(request: Request) {
  const cookie = request.headers.get("cookie");
  const body = (await request.json().catch(() => ({}))) as AddressInput;
  if (!isValidAddress(body)) {
    return Response.json({ error: "Required address information is missing." }, { status: 400 });
  }

  try {
    const session = await payloadRequest("/customers/me?depth=0", { cookie });
    const user = session.payload.user as { id?: string; addresses?: StoredAddress[] } | undefined;
    if (!user?.id) return Response.json({ error: "Please sign in first." }, { status: 401 });

    const addressId = typeof body.addressId === "string" ? body.addressId : null;
    const addressIndex = typeof body.addressIndex === "number" ? body.addressIndex : Number(body.addressIndex);
    const currentAddresses = user.addresses || [];
    const targetIndex = addressId
      ? currentAddresses.findIndex((address) => address.id === addressId)
      : Number.isInteger(addressIndex) ? addressIndex : -1;
    if (targetIndex < 0 || targetIndex >= currentAddresses.length) {
      return Response.json({ error: "Saved address was not found." }, { status: 404 });
    }

    const addresses = currentAddresses.map((address, index) =>
      index === targetIndex ? { ...address, ...normalizedAddress(body) } : address,
    );
    const updated = await payloadRequest(`/customers/${user.id}`, {
      method: "PATCH",
      cookie,
      body: JSON.stringify({ addresses }),
    });
    if (!updated.response.ok) {
      return Response.json(
        { error: errorMessage(updated.payload, "Address could not be updated.") },
        { status: updated.response.status },
      );
    }
    return Response.json({ user: updated.payload.doc });
  } catch {
    return Response.json({ error: "Address service is unavailable." }, { status: 503 });
  }
}

