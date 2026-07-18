import { useState, FormEvent } from 'react';

export default function Login() {
  // Controlled inputs — React owns the input value, not the DOM.
  // Standard pattern for forms where you need the value on submit
  // (rather than reading it from the DOM at submit time).
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault(); // stop the browser's default full-page-reload form submission

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setError('');
    // API call wired up next — intentionally left as a stub for now,
    // since this test only covers client-side validation.
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-16 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" className="rounded bg-blue-600 text-white py-2 font-medium">
        Log in
      </button>
    </form>
  );
}