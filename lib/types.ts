export type Profile = {
  id: string;
  email: string;
  is_therapist: boolean;
  sharing_enabled: boolean;
};

export type Checkin = {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  anxiety: number;
  sleep: number;
  gratitude: string | null;
  notes: string | null;
  created_at?: string;
};
