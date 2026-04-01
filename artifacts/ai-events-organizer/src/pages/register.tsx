import { useState } from "react";
import { useRegister, RegisterBodyRole } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegisterBodyRole>("organizer");
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { data: { name, email, password, role } },
      {
        onSuccess: (data) => {
          setAuth(data);
          toast({ title: "Account created!", description: "Welcome to AI Events." });
          setLocation("/dashboard");
        },
        onError: (err) => {
          toast({ title: "Registration failed", description: (err as any).error || "Unknown error", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(262 83% 48%), hsl(var(--primary)))" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">AI Events</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-3 leading-tight">Join thousands of<br />event professionals.</h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Create your account and start planning better events with AI-powered tools built for speed and accuracy.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[["50k+", "Events managed"], ["98%", "Satisfaction"], ["3×", "Faster planning"], ["40%", "Higher attendance"]].map(([v, l]) => (
              <div key={l} className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-black text-white">{v}</p>
                <p className="text-xs text-white/60 mt-0.5">{l}</p>
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

          <h1 className="text-2xl font-black tracking-tight mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 bg-muted/30 border-border/60 focus:bg-background"
                data-testid="input-register-name"
              />
            </div>
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
                data-testid="input-register-email"
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
                minLength={8}
                className="h-10 bg-muted/30 border-border/60 focus:bg-background"
                data-testid="input-register-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">I am a…</Label>
              <Select value={role} onValueChange={(v: RegisterBodyRole) => setRole(v)}>
                <SelectTrigger id="role" className="h-10 bg-muted/30 border-border/60" data-testid="select-register-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organizer">Event Organizer</SelectItem>
                  <SelectItem value="attendee">Attendee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold gap-2 mt-2"
              disabled={registerMutation.isPending}
              data-testid="button-register-submit"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline" data-testid="link-login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
