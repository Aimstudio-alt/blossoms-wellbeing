import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SharingToggle } from "./SharingToggle";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return (
    <>
      <Nav signedIn isTherapist={profile?.is_therapist ?? false} />
      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="subheading mb-3">Your space</p>
          <h1 className="font-serif text-4xl">Settings</h1>
        </div>

        <section className="card mb-8">
          <p className="subheading mb-2">Account</p>
          <h2 className="font-serif text-2xl mb-4">Signed in as</h2>
          <p className="text-charcoal/80">{user.email}</p>
          {profile?.is_therapist && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-sage/10 text-sage px-3 py-1 text-xs tracking-wide">
              Therapist account
            </p>
          )}
        </section>

        <section className="card">
          <p className="subheading mb-2">Sharing</p>
          <h2 className="font-serif text-2xl mb-3">Share with Teresa</h2>
          <p className="text-charcoal/70 text-sm leading-relaxed mb-6">
            When sharing is on, Teresa can see your daily entries on her
            therapist dashboard. Turning it off hides your entries again right
            away — you're always in control.
          </p>
          <SharingToggle
            initialValue={profile?.sharing_enabled ?? false}
            userId={user.id}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
