import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { FileText, Loader2 } from "lucide-react";

function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex items-center justify-center">
      {/* Main Authentication Container */}
      <main className="w-full max-w-[448px] px-margin-mobile md:px-0 mx-auto">
        {/* Auth Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg md:p-xl">
          {/* Header Section */}
          <div className="text-center mb-xl">
            <div className="flex justify-center items-center gap-2 mb-sm text-primary">
              <FileText size={32} />
              <h1 className="font-headline-md text-headline-md font-bold tracking-tight">ResumeFit</h1>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-lg">Welcome back</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">Please enter your details to sign in.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-md p-3 rounded-md bg-error-container border border-error/20 text-body-sm text-on-error-container">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Email Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="block w-full appearance-none rounded-md border border-outline-variant px-md py-sm placeholder-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-body-sm text-body-sm bg-surface-container-lowest transition-shadow"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                <a className="font-label-sm text-label-sm text-primary hover:text-primary/80 transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full appearance-none rounded-md border border-outline-variant px-md py-sm placeholder-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-body-sm text-body-sm bg-surface-container-lowest transition-shadow"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer"
              />
              <label className="ml-2 block font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center items-center gap-2 rounded-md bg-primary-container px-md py-sm font-label-md text-label-md text-on-primary hover:bg-primary-container/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-lg">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface-container-lowest px-2 font-body-sm text-body-sm text-on-surface-variant">Or continue with</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <div className="mt-lg">
              <GoogleLoginButton onError={(msg) => setError(msg)} />
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          Don't have an account?{" "}
          <Link to="/signup" className="font-label-md text-label-md text-primary hover:text-primary/80 transition-colors">
            Sign up for free
          </Link>
        </p>
      </main>
    </div>
  );
}

export default Login;
