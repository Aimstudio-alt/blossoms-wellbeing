import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HistoryChart } from "@/components/HistoryChart";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Checkin, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

function isoNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function TherapistPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!me?.is_therapist) {
    return (
      <>
        <Nav signedIn isTherapist={false} />
        <main className="max-w-xl mx-auto px-6 py-24 text-center">
          <p className="subheading mb-4">Therapist area</p>
          <h1 className="font-serif text-4xl mb-4">This space is private</h1>
          <p className="text-charcoal/70">
            Only Teresa can view client data here. If you believe this is in
            error, please reach out.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("sharing_enabled", true)
    .eq("is_therapist", false);

  const sharedClients = (clients ?? []) as Profile[];

  const since = isoNDaysAgo(30);
  const clientIds = sharedClients.map((c) => c.id);

  let allCheckins: Checkin[] = [];
  if (clientIds.length > 0) {
    const { data: checkins } = await supabase
      .from("checkins")
      .select("*")
      .in("user_id", clientIds)
      .gte("date", since)
      .order("date", { ascending: true });
    allCheckins = (checkins ?? []) as Checkin[];
  }

  const byClient: Record<string, Checkin[]> = {};
  for (const c of allCheckins) {
    (byClient[c.user_id] ||= []).push(c);
  }

  return (
    <>
      <Nav signedIn isTherapist />
      <main className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="subheading mb-3">Therapist view</p>
          <h1 className="font-serif text-4xl md:text-5xl">
            Your clients' journeys
          </h1>
          <p className="mt-3 text-charcoal/60 max-w-2xl">
            Clients who have turned on sharing will appear here, with their
            last 30 days of mood, anxiety and sleep.
          </p>
        </div>

        {sharedClients.length === 0 ? (
          <div className="card text-center">
            <p className="text-charcoal/70">
              No clients are currently sharing. They can enable sharing from
              their settings page.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sharedClients.map((client) => {
              const entries = byClient[client.id] ?? [];
              return (
                <section key={client.id} className="card">
                  <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
                    <div>
                      <p className="subheading mb-1">Client</p>
                      <h2 className="font-serif text-2xl">{client.email}</h2>
                    </div>
                    <p className="text-xs text-charcoal/50">
                      {entries.length} check-in{entries.length === 1 ? "" : "s"}{" "}
                      · last 30 days
                    </p>
                  </div>
                  {entries.length === 0 ? (
                    <p className="text-sm text-charcoal/50">
                      No entries in the last 30 days.
                    </p>
                  ) : (
                    <HistoryChart data={entries} height={260} />
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
