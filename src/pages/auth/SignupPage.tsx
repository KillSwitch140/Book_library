import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookMarked, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signupSchema, type SignupFormValues } from "@/lib/validators";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
  const { session, isConfigured, signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  if (session) return <Navigate to="/" replace />;

  async function onSubmit(values: SignupFormValues) {
    setError(null);
    const { error: err } = await signUp(
      values.email,
      values.password,
      values.fullName,
    );
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
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
        ) : success ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Check your email
                </h2>
                <p className="text-sm font-body text-muted-foreground max-w-xs">
                  We've sent a confirmation link to your email address. Click the
                  link to activate your account.
                </p>
                <Link
                  to="/login"
                  className="text-sm font-body text-copper hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Create Account</CardTitle>
              <CardDescription className="font-body">
                Join Athenaeum to borrow and reserve books.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="font-body">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jane Doe"
                    {...form.register("fullName")}
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-xs text-destructive font-body">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-body">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive font-body">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-body">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive font-body">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="font-body">
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Repeat your password"
                    {...form.register("confirmPassword")}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive font-body">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create Account
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm font-body text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-copper hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
