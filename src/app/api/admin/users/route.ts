import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type UserRole = "messdiener" | "leiter" | "planschreiber" | "admin";

type ActionBody = {
  action: "create" | "update" | "delete" | "set_password";
  userId?: string;
  email?: string;
  password?: string;
  displayName?: string;
  role?: UserRole;
  active?: boolean;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY ist auf dem Server nicht konfiguriert.");
  return createAdminClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Nicht angemeldet." };

  const { data: profile, error } = await supabase.from("profiles").select("role, active").eq("id", user.id).maybeSingle();
  if (error || profile?.role !== "admin" || !profile.active) {
    return { ok: false as const, status: 403, error: "Nur aktive Administratoren dürfen Benutzer verwalten." };
  }
  return { ok: true as const, user };
}

function validRole(value: unknown): value is UserRole {
  return value === "messdiener" || value === "leiter" || value === "planschreiber" || value === "admin";
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: profiles, error: profilesError } = await admin.from("profiles").select("id, display_name, role, active, points").order("display_name", { ascending: true });
    if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });

    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
    const users = data.users.map((user) => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        email: user.email ?? "",
        name: profile?.display_name?.trim() || user.user_metadata?.display_name || user.email?.split("@")[0] || "Unbenannter Benutzer",
        role: profile?.role ?? "messdiener",
        active: profile?.active ?? !user.banned_until,
        points: profile?.points ?? 0,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        emailConfirmed: Boolean(user.email_confirmed_at),
        bannedUntil: user.banned_until,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unbekannter Serverfehler." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: ActionBody;
  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const admin = getAdminClient();

    if (body.action === "create") {
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? "";
      const displayName = body.displayName?.trim() ?? "";
      const role = validRole(body.role) ? body.role : "messdiener";

      if (!email || !email.includes("@")) return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
      if (password.length < 8) return NextResponse.json({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." }, { status: 400 });

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName || email.split("@")[0] },
      });

      if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Benutzer konnte nicht erstellt werden." }, { status: 400 });

      const finalName = displayName || email.split("@")[0];
      const { error: profileError } = await admin.from("profiles").update({ display_name: finalName, role, active: true }).eq("id", data.user.id);

      if (profileError) {
        // Do not leave an Auth account behind if the matching application profile cannot be configured.
        await admin.auth.admin.deleteUser(data.user.id);
        return NextResponse.json({ error: "Benutzer konnte nicht vollständig eingerichtet werden." }, { status: 500 });
      }

      return NextResponse.json({ ok: true, userId: data.user.id });
    }

    if (!body.userId) return NextResponse.json({ error: "Benutzer-ID fehlt." }, { status: 400 });
    if (body.userId === auth.user.id && (body.action === "delete" || body.active === false)) {
      return NextResponse.json({ error: "Du kannst deinen eigenen Administrator-Account hier nicht löschen oder deaktivieren." }, { status: 400 });
    }

    if (body.action === "update") {
      const profileUpdate: Record<string, unknown> = {};
      if (typeof body.displayName === "string") profileUpdate.display_name = body.displayName.trim();
      if (validRole(body.role)) profileUpdate.role = body.role;
      if (typeof body.active === "boolean") profileUpdate.active = body.active;

      if (Object.keys(profileUpdate).length) {
        const { error } = await admin.from("profiles").update(profileUpdate).eq("id", body.userId);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Keep Supabase Auth and the application-level active flag in sync.
      if (typeof body.active === "boolean") {
        const { error } = await admin.auth.admin.updateUserById(body.userId, { ban_duration: body.active ? "none" : "876000h" });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ ok: true });
    }

    if (body.action === "set_password") {
      const password = body.password ?? "";
      if (password.length < 8) return NextResponse.json({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." }, { status: 400 });
      const { error } = await admin.auth.admin.updateUserById(body.userId, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete") {
      const { error } = await admin.auth.admin.deleteUser(body.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unbekannter Serverfehler." }, { status: 500 });
  }
}
