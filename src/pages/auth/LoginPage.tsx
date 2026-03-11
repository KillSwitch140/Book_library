import { useState } from "react";
import { Navigate, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookMarked, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  loginSchema,
  magicLinkSchema,
  type LoginFormValues,
  type MagicLinkFormValues,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const { session, isConfigured, signInWithPassword, signInWithMagicLink, signInWithGoogle } =
    useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTo = searchParams.get("redirect") || "/";

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const passwordForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  if (session) return <Navigate to="/" replace />;

  async function onPasswordSubmit(values: LoginFormValues) {
    setPasswordError(null);
    const { error } = await signInWithPassword(values.email, values.password);
    if (error) {
      setPasswordError(error);
    } else {
      navigate(redirectTo, { replace: true });
    }
  }

  async function onMagicLinkSubmit(values: MagicLinkFormValues) {
    setMagicLinkError(null);
    const { error } = await signInWithMagicLink(values.email);
    if (error) {
      setMagicLinkError(error);
    } else {
      setMagicLinkSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <Link to="/" className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center shadow-glow">
            <BookMarked className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Athenaeum
          </h1>
        </Link>

        {!isConfigured ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                Authentication Unavailable
              </CardTitle>
              <CardDescription className="font-body">
                Supabase is not configured. Set{" "}
                <code className="text-xs">VITE_SUPABASE_URL</code> and{" "}
                <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> in{" "}
                <code className="text-xs">.env.local</code> to enable
                authentication.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link
                to="/"
                className="text-sm font-body text-copper hover:underline"
              >
                Back to Home
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Sign In</CardTitle>
              <CardDescription className="font-body">
                Welcome back. Sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password" className="font-body text-sm">
                    Email &amp; Password
                  </TabsTrigger>
                  <TabsTrigger value="magic-link" className="font-body text-sm">
                    Magic Link
                  </TabsTrigger>
                </TabsList>

                {/* Email & Password tab */}
                <TabsContent value="password" className="space-y-4 pt-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="font-body">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        {...passwordForm.register("email")}
                      />
                      {passwordForm.formState.errors.email && (
                        <p className="text-xs text-destructive font-body">
                          {passwordForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="font-body">
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...passwordForm.register("password")}
                      />
                      {passwordForm.formState.errors.password && (
                        <p className="text-xs text-destructive font-body">
                          {passwordForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                {/* Magic Link tab */}
                <TabsContent value="magic-link" className="space-y-4 pt-4">
                  <p className="text-xs font-body text-muted-foreground">
                    Sign in without a password. Only available for existing accounts.
                  </p>
                  {magicLinkError && (
                    <Alert variant="destructive">
                      <AlertDescription>{magicLinkError}</AlertDescription>
                    </Alert>
                  )}
                  {magicLinkSent ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-body text-foreground">
                        Check your email for a login link.
                      </p>
                      <button
                        type="button"
                        className="text-xs font-body text-copper hover:underline"
                        onClick={() => setMagicLinkSent(false)}
                      >
                        Send another link
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="magic-email" className="font-body">
                          Email
                        </Label>
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="you@example.com"
                          {...magicLinkForm.register("email")}
                        />
                        {magicLinkForm.formState.errors.email && (
                          <p className="text-xs text-destructive font-body">
                            {magicLinkForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={magicLinkForm.formState.isSubmitting}
                      >
                        {magicLinkForm.formState.isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Send Magic Link
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>

              {/* SSO Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground font-body">
                    or continue with
                  </span>
                </div>
              </div>

              {googleError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertDescription>{googleError}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                className="w-full gap-2 font-body"
                onClick={async () => {
                  setGoogleError(null);
                  const { error } = await signInWithGoogle();
                  if (error) setGoogleError(error);
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm font-body text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-copper hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
