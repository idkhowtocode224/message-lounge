import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in — Message Lounge" : "Create account — Message Lounge";
  }, [mode]);

  // Load remembered creds
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ml_auth_remember");
      if (raw) {
        const { u, p } = JSON.parse(raw) as { u?: string; p?: string };
        if (u) setUsername(u);
        if (p) setPassword(p);
        setRemember(true);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const uname = username.trim().toLowerCase();
    if (!uname) {
      toast({ title: "Username required" });
      setLoading(false);
      return;
    }

    // We synthesize an email from the username to satisfy Supabase's email requirement
    const emailAddr = `${uname}@ml.local`;

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: emailAddr, password });
        if (error) throw error;
        toast({ title: "Welcome back" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: emailAddr,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created" });
      }

      // Remember creds if requested
      if (remember) {
        localStorage.setItem("ml_auth_remember", JSON.stringify({ u: uname, p: password }));
      } else {
        localStorage.removeItem("ml_auth_remember");
      }

      navigate("/app");
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "signin" ? "Sign in to Message Lounge" : "Create your account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {mode === "signin" ? (
              <button className="underline" onClick={() => setMode("signup")}>Need an account? Sign up</button>
            ) : (
              <button className="underline" onClick={() => setMode("signin")}>Already have an account? Sign in</button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
