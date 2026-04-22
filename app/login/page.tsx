import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LoginForm } from "./LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
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
          <p className="subheading mb-4">Welcome back</p>
          <h1 className="font-serif text-4xl">Sign in</h1>
        </div>
        <div className="card">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
