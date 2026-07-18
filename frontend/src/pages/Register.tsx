import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      registerRequest(email, password),
    // On success, send the user to login rather than logging them in
    // directly — consistent with keeping register/login fully separate.
    onSuccess: () => navigate('/login'),
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

  const apiError = mutation.error instanceof Error ? mutation.error.message : '';

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-16 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Register</h1>

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
        {mutation.isPending ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}