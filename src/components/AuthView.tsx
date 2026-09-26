import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthView() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm it.');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
        <h1 className="text-3xl font-bold text-gray-900">BunkIt</h1>
        <p className="text-gray-500 mt-2 mb-7">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</p>
        <input className="w-full border rounded-xl px-4 py-3 mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full border rounded-xl px-4 py-3 mb-4" type="password" placeholder="Password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required />
        <button disabled={busy} className="w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-50">
          {busy ? 'Loading...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }} className="w-full text-sm mt-5 text-gray-600">
          {mode === 'login' ? 'New here? Create account' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  );
}
