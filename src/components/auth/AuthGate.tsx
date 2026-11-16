import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    setBusy(true);
    setMessage(null);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage('Account created. Check your email to confirm it, then log in.');
    }
    setBusy(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F3EB] p-4">
        <div className="w-full max-w-lg bg-white border border-[#E4DEC9] rounded-2xl p-6 shadow-sm space-y-3">
          <h1 className="text-xl font-bold text-[#2A3B32]">FLOCK OS setup required</h1>
          <p className="text-sm text-[#58645C]">
            The frontend is running, but Supabase is not configured. Copy
            {' '}<code className="font-mono">.env.example</code> to{' '}
            <code className="font-mono">.env</code>, add your Supabase project URL
            and anon key, then restart <code className="font-mono">npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F6F3EB] text-[#58645C]">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F3EB] p-4">
        <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#E4DEC9] rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[#2A3B32]">FLOCK OS</h1>
            <p className="text-sm text-[#6B7970]">{mode === 'login' ? 'Log in to your farm' : 'Create your account'}</p>
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-[#DDD6C5] rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            className="w-full border border-[#DDD6C5] rounded-lg px-3 py-2 text-sm"
          />
          {message && <p className="text-sm text-[#8A3B2B]">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded-lg bg-[#3A564A] text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}
            className="w-full text-xs text-[#3A564A] hover:underline"
          >
            {mode === 'login' ? 'No account? Sign up' : 'Already have an account? Log in'}
          </button>
          <p className="text-center text-xs text-[#8A948D]">Developed by Codision Labs</p>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};
