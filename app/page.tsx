import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6">
        <section className="text-center py-24 md:py-32">
          <p className="subheading mb-6">Wellbeing Tracker</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight text-charcoal max-w-3xl mx-auto">
            A gentle daily check-in, between sessions.
          </h1>
          <p className="mt-6 text-charcoal/70 max-w-xl mx-auto leading-relaxed">
            Notice your mood, your anxiety, your sleep, and the small things
            you're grateful for. Share your journey with Teresa whenever
            you're ready.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="btn-primary">
              Begin your journal
            </Link>
            <Link href="/login" className="btn-secondary">
              I already have an account
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 pb-20">
          <Feature
            title="Daily check-ins"
            body="A few gentle prompts. Mood, anxiety, sleep, gratitude — all in under a minute."
          />
          <Feature
            title="See your patterns"
            body="Your entries become a quiet, private chart you can look back on."
          />
          <Feature
            title="Share with Teresa"
            body="Turn sharing on when you're ready. Turn it off whenever you'd like."
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card text-center">
      <h3 className="font-serif text-2xl mb-3 text-charcoal">{title}</h3>
      <p className="text-charcoal/70 leading-relaxed text-sm">{body}</p>
    </div>
  );
}
