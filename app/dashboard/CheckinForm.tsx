"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = { date: string };

export function CheckinForm({ date }: Props) {
  const router = useRouter();
  const [mood, setMood] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [gratitude, setGratitude] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      date,
      mood,
      anxiety,
      sleep,
      gratitude: gratitude.trim() || null,
      notes: notes.trim() || null,
    });

    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        setError("You've already checked in today. See you tomorrow.");
      } else {
        setError(error.message);
      }
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <p className="subheading mb-2">Today's check-in</p>
        <h2 className="font-serif text-3xl">How are you, really?</h2>
      </div>

      <Slider
        label="Mood"
        description="Low to lifted"
        value={mood}
        onChange={setMood}
      />
      <Slider
        label="Anxiety"
        description="Calm to restless"
        value={anxiety}
        onChange={setAnxiety}
      />
      <Slider
        label="Sleep quality"
        description="Restless to restful"
        value={sleep}
        onChange={setSleep}
      />

      <div>
        <label className="label" htmlFor="gratitude">
          Something small you're grateful for
        </label>
        <textarea
          id="gratitude"
          rows={3}
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          className="textarea"
          placeholder="A warm cup of tea, a message from a friend…"
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notes for yourself
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="textarea"
          placeholder="Anything you'd like to remember or bring to your next session…"
        />
      </div>

      {error && (
        <p className="text-sm text-rose-700/80 bg-rose-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save today's check-in"}
        </button>
      </div>
    </form>
  );
}

function Slider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="label !mb-0">{label}</p>
          <p className="text-xs text-charcoal/50 mt-1">{description}</p>
        </div>
        <p className="font-serif text-3xl text-sage">
          {value}
          <span className="text-sm text-charcoal/40"> / 10</span>
        </p>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
