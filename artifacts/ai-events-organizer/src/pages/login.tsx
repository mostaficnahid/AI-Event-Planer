import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useLocation, useSearch, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  const search = useSearch();
  const nextPath = new URLSearchParams(search).get("next") || "/dashboard";

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setAuth(data);
          toast({ title: "Welcome back!" });
          setLocation(nextPath);
        },
        onError: (err) => {
          toast({ title: "Sign in failed", description: (err as any).error || "Invalid email or password", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 48%))" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">AI Events</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-3 leading-tight">Plan smarter.<br />Organize better.</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            AI-powered event management with real-time guest tracking, budget estimation, and analytics — all in one place.
          </p>
          <div className="mt-8 space-y-3">
            {["AI Description & Schedule Generator", "Real-time RSVP Guest Tracking", "Budget Estimation & Analytics"].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/85">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs relative z-10">© {new Date().getFullYear()} AI Events Organizer</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}>
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">AI Events</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 bg-muted/30 border-border/60 focus:bg-background"
                data-testid="input-login-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 bg-muted/30 border-border/60 focus:bg-background"
                data-testid="input-login-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold gap-2 mt-2"
              disabled={loginMutation.isPending}
              data-testid="button-login-submit"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline" data-testid="link-register">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
