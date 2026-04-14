import { useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';

const veilEase = [0.22, 1, 0.36, 1] as const;

const glassInput =
  'w-full rounded-xl border border-slate-200/90 bg-white/55 px-3.5 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 placeholder:text-slate-400 backdrop-blur-md transition-[border-color,background-color,box-shadow,opacity] duration-200 focus:border-[#00cc6a]/55 focus:bg-white/75 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30 disabled:cursor-not-allowed disabled:opacity-40';

type AuthLoginCardProps = {
  /** Called after email/password or OAuth sign-in succeeds (tokens saved). */
  onAuthenticated?: () => void;
};

export default function AuthLoginCard({ onAuthenticated }: AuthLoginCardProps) {
  const { login, register, saveTokens } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const authBlockRef = useRef<HTMLDivElement>(null);
  const [authBlockHeightPx, setAuthBlockHeightPx] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = authBlockRef.current;
    if (!el) return;

    const measure = () => {
      setAuthBlockHeightPx(el.scrollHeight);
    };

    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLoginMode, error, loading]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
      onAuthenticated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({ email, password });
      onAuthenticated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 18, scale: 0.98, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.16 : 0.36,
        ease: veilEase,
        delay: prefersReducedMotion ? 0 : 0.05,
      }}
      className="relative w-full max-w-[420px] rounded-2xl border border-white/80 bg-white/50 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.85)_inset] ring-1 ring-[#00ff88]/20 backdrop-blur-2xl"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/70 via-white/25 to-emerald-100/25 opacity-90"
        aria-hidden
      />

      <div className="relative mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00ff88]/40 bg-linear-to-br from-[#00ff88]/20 to-emerald-100/50 shadow-[0_8px_32px_rgba(0,204,106,0.15)] backdrop-blur-md">
          <i className="fas fa-microphone-alt text-2xl text-[#00a855]" aria-hidden />
        </div>
        <h1 className="bg-linear-to-r from-slate-800 via-slate-700 to-[#00a855] bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
          Welcome to Mira
        </h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to your intelligent voice workspace</p>
      </div>

      <div className="relative">
        <div
          className="overflow-hidden"
          style={{
            height: authBlockHeightPx === null ? undefined : authBlockHeightPx,
            transitionProperty:
              prefersReducedMotion || authBlockHeightPx === null ? 'none' : 'height',
            transitionDuration: prefersReducedMotion ? '0.01ms' : '0.42s',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div ref={authBlockRef}>
            <AnimatePresence mode="popLayout" initial={false}>
              {isLoginMode ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-slate-600">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      required
                      disabled={loading}
                      className={glassInput}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      name="password"
                      required
                      disabled={loading}
                      className={glassInput}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl border border-[#00cc6a]/30 bg-linear-to-r from-[#00e070] to-[#00b359] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(0,204,106,0.28)] transition-[filter,box-shadow,opacity] hover:brightness-110 hover:shadow-[0_10px_36px_rgba(0,204,106,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-circle-notch fa-spin" aria-hidden />
                        Signing in…
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="register-email" className="mb-1.5 block text-xs font-medium text-slate-600">
                      Email
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      required
                      disabled={loading}
                      className={glassInput}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="register-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                      Password
                    </label>
                    <input
                      id="register-password"
                      type="password"
                      name="password"
                      required
                      disabled={loading}
                      className={glassInput}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="register-confirm"
                      className="mb-1.5 block text-xs font-medium text-slate-600"
                    >
                      Confirm password
                    </label>
                    <input
                      id="register-confirm"
                      type="password"
                      name="confirmPassword"
                      required
                      disabled={loading}
                      className={glassInput}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl border border-[#00cc6a]/30 bg-linear-to-r from-[#00e070] to-[#00b359] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(0,204,106,0.28)] transition-[filter,box-shadow,opacity] hover:brightness-110 hover:shadow-[0_10px_36px_rgba(0,204,106,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-circle-notch fa-spin" aria-hidden />
                        Creating account…
                      </span>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {error ? (
                <motion.div
                  key="auth-error"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200/90 bg-rose-50/80 px-3 py-2.5 text-sm text-rose-900 backdrop-blur-md">
                    <i className="fas fa-exclamation-circle mt-0.5 shrink-0 text-rose-500" aria-hidden />
                    <span>{error}</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
            disabled={loading}
            className="font-semibold text-[#00a855] transition-colors hover:text-[#008f49] disabled:opacity-50"
          >
            {isLoginMode ? 'Create one' : 'Sign in instead'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
