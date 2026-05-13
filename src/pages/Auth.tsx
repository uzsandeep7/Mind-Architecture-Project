import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}(\.[A-Za-z]{2,})*$/;

const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email address")
  .regex(EMAIL_PATTERN, "Please enter a valid email address");
const loginPasswordSchema = z.string().min(1, "Please enter your password");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

type AppRole = Database["public"]["Enums"]["app_role"];

const isValidEmailAddress = (value: string) => EMAIL_PATTERN.test(value.trim());

// Correct Google "G" (SVG) — works well on dark themes
const GoogleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.73 1.22 9.23 3.62l6.9-6.9C35.95 2.36 30.35 0 24 0 14.64 0 6.56 5.38 2.7 13.22l8.02 6.23C12.62 13.2 17.88 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.12 24.5c0-1.64-.15-3.21-.43-4.74H24v9.02h12.4c-.53 2.87-2.17 5.31-4.62 6.94l7.1 5.51c4.15-3.83 6.24-9.47 6.24-16.73z"
    />
    <path
      fill="#FBBC05"
      d="M10.72 28.55A14.5 14.5 0 0 1 9.95 24c0-1.58.28-3.11.77-4.55L2.7 13.22A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.7 10.78l8.02-6.23z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.35 0 11.95-2.09 15.93-5.67l-7.1-5.51c-1.98 1.33-4.51 2.12-8.83 2.12-6.12 0-11.38-3.7-13.28-8.95L2.7 34.78C6.56 42.62 14.64 48 24 48z"
    />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  const resolveUserDestination = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["owner", "admin", "moderator", "user"]);

    if (error) throw error;

    const roles = (data ?? []).map((item) => item.role as AppRole);
    const isPrivileged = roles.includes("owner") || roles.includes("admin");

    navigate(isPrivileged ? "/admin" : "/dashboard");
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        void resolveUserDestination(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void resolveUserDestination(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const normalizedEmail = email.trim();
    const emailResult = emailSchema.safeParse(normalizedEmail);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = (isLogin ? loginPasswordSchema : passwordSchema).safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && !fullName.trim()) {
      newErrors.password ??= undefined;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not start Google sign-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const normalizedEmail = email.trim();

    if (!isValidEmailAddress(normalizedEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            await resolveUserDestination(user.id);
          }
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to MIND Architecture. Please check your email if confirmation is required.",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen pt-32 pb-16 flex items-center">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card p-8 rounded-2xl border border-border shadow-xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2">
                {isLogin ? "Welcome Back" : "Join MIND Architecture"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? "Sign in to access your account" : "Create an account to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    pattern={EMAIL_PATTERN.source}
                    title="Please enter a valid email address, for example name@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, lowercase, and a number.
                  </p>
                )}
              </div>

              {/* Primary action */}
              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">OR</span>
                </div>
              </div>

              {/* Google sign-in (dark-theme friendly) */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full h-11 rounded-xl border border-border bg-white text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span className="font-medium">
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
