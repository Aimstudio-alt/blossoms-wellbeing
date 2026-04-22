"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  initialValue: boolean;
  userId: string;
};

export function SharingToggle({ initialValue, userId }: Props) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;
    setError(null);
    setSaving(true);
    setEnabled(next);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ sharing_enabled: next })
      .eq("id", userId);

    setSaving(false);
    if (error) {
      setEnabled(!next);
      setError(error.message);
    }
  }

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
          enabled ? "bg-sage" : "bg-sage/20"
        } focus:outline-none focus:ring-2 focus:ring-sage/40`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-soft transition ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
      <span className="ml-4 text-sm text-charcoal/80 align-middle">
        {enabled ? "Sharing is on" : "Sharing is off"}
      </span>
      {error && <p className="text-sm text-rose-700/80 mt-3">{error}</p>}
    </div>
  );
}
