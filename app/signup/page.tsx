import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SignupForm } from "./SignupForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <Nav />
      <main className="max-w-lg mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="subheading mb-4">Welcome</p>
          <h1 className="font-serif text-4xl">Create your journal</h1>
          <p className="mt-3 text-charcoal/60 text-sm">
            A private, gentle space that's just for you.
          </p>
        </div>
        <div className="card">
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
