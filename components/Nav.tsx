import Link from "next/link";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";

type NavProps = {
  signedIn?: boolean;
  isTherapist?: boolean;
};

export function Nav({ signedIn, isTherapist }: NavProps) {
  return (
    <header className="w-full border-b border-sage/10 bg-blush/80 backdrop-blur sticky top-0 z-20">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-5">
        <Logo href={signedIn ? "/dashboard" : "/"} />
        <div className="flex items-center gap-6">
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-charcoal/70 hover:text-sage transition hidden sm:inline"
              >
                Dashboard
              </Link>
              {isTherapist && (
                <Link
                  href="/therapist"
                  className="text-sm text-charcoal/70 hover:text-sage transition hidden sm:inline"
                >
                  Therapist view
                </Link>
              )}
              <Link
                href="/settings"
                className="text-sm text-charcoal/70 hover:text-sage transition"
              >
                Settings
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-charcoal/70 hover:text-sage transition">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary !py-2 !px-5 text-xs">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
