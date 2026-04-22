import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayISO, formatFriendlyDate } from "@/lib/date";
import { CheckinForm } from "./CheckinForm";
import { HistoryChart } from "@/components/HistoryChart";
import type { Checkin, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = todayISO();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { data: todayEntry } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle<Checkin>();

  const { data: history } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .limit(90);

  const entries = (history ?? []) as Checkin[];

  return (
    <>
      <Nav signedIn isTherapist={profile?.is_therapist ?? false} />
      <main className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="subheading mb-3">Today</p>
          <h1 className="font-serif text-4xl md:text-5xl">
            {formatFriendlyDate(today)}
          </h1>
          <p className="mt-3 text-charcoal/60">
            Take a breath. A few gentle prompts, whenever you're ready.
          </p>
        </div>

        <section className="card mb-10">
          {todayEntry ? (
            <AlreadyLogged entry={todayEntry} />
          ) : (
            <CheckinForm date={today} />
          )}
        </section>

        <section className="card">
          <div className="mb-6">
            <p className="subheading mb-2">Your history</p>
            <h2 className="font-serif text-3xl">Looking back</h2>
            <p className="text-sm text-charcoal/60 mt-1">
              {entries.length === 0
                ? "Once you check in for a few days, your gentle chart will appear here."
                : "A quiet view of the last weeks. Nothing to judge — just notice."}
            </p>
          </div>
          {entries.length > 0 && <HistoryChart data={entries} />}
        </section>
      </main>
      <Footer />
    </>
  );
}

function AlreadyLogged({ entry }: { entry: Checkin }) {
  return (
    <div>
      <p className="subheading mb-3">Today's entry</p>
      <h2 className="font-serif text-3xl mb-6">Thank you for checking in.</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Metric label="Mood" value={entry.mood} />
        <Metric label="Anxiety" value={entry.anxiety} />
        <Metric label="Sleep" value={entry.sleep} />
      </div>
      {entry.gratitude && (
        <div className="mb-5">
          <p className="subheading mb-2">Gratitude</p>
          <p className="text-charcoal/80 leading-relaxed whitespace-pre-wrap">
            {entry.gratitude}
          </p>
        </div>
      )}
      {entry.notes && (
        <div>
          <p className="subheading mb-2">Notes</p>
          <p className="text-charcoal/80 leading-relaxed whitespace-pre-wrap">
            {entry.notes}
          </p>
        </div>
      )}
      <p className="text-xs text-charcoal/50 mt-6">
        You've already checked in today — see you tomorrow.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-sage/5 p-5 text-center">
      <p className="subheading mb-1">{label}</p>
      <p className="font-serif text-4xl text-sage">{value}</p>
      <p className="text-xs text-charcoal/50">/ 10</p>
    </div>
  );
}
