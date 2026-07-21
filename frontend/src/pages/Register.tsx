import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerRequest } from "../api/client";
import { Mail, Lock, UserPlus, AlertCircle, User } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name?: string;
    }) => registerRequest(email, password, name),
    onSuccess: () => navigate("/login"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setValidationError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    setValidationError("");
    mutation.mutate({ email, password, name });
  }

  const apiError =
    mutation.error instanceof Error ? mutation.error.message : "";

  return (
    <div className="w-full max-w-md mx-auto mt-12 sm:mt-24 perspective-1000">
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-2xl rounded-3xl p-8 sm:p-10 transform transition-all duration-500 hover:shadow-brand-500/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400">
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Join the AutoLuxe dealership network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <User size={18} />
            </div>
            <input
              id="name"
              type="text"
              aria-label="User Name"
              placeholder="User Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              aria-label="Email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type="password"
              aria-label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              id="confirmPassword"
              type="password"
              aria-label="Confirm Password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>

          {(validationError || apiError) && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg text-sm border border-red-100 dark:border-red-500/20">
              <AlertCircle size={16} />
              <p>{validationError || apiError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-brand-500/50 transform hover:-translate-y-0.5"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Register
              </span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
