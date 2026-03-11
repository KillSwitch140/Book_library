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
  const { session, isConfigured, signInWithPassword, signInWithMagicLink } =
    useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTo = searchParams.get("redirect") || "/";

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center shadow-glow">
            <BookMarked className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Athenaeum
          </h1>
        </div>

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
