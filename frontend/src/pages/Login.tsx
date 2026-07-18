import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginRequest } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  // useMutation wraps any "write" operation (as opposed to useQuery,
  // which is for reads/fetching). It gives us loading/error/success
  // states for free, instead of hand-rolling them with useState.
  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
    onSuccess: (data) => {
      // Storing the raw JWT string under a known key — every
      // subsequent authenticated request will read it back out
      // of here to attach as the Authorization header.
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setValidationError('Email and password are required');
      return;
    }

    setValidationError('');
    mutation.mutate({ email, password });
  }

  // mutation.error is whatever loginRequest threw — an Error object
  // whose .message is the backend's error text ("Invalid credentials").
  const apiError = mutation.error instanceof Error ? mutation.error.message : '';

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

      {(validationError || apiError) && (
        <p className="text-red-600 text-sm">{validationError || apiError}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded bg-blue-600 text-white py-2 font-medium disabled:opacity-50"
      >
        {mutation.isPending ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}