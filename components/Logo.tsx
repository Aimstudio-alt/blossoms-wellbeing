import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-charcoal hover:opacity-80 transition"
    >
      <span aria-hidden className="text-xl leading-none">
        🌸
      </span>
      <span className="font-serif text-xl tracking-wide">
        Blossoms Counselling Co.
      </span>
    </Link>
  );
}
