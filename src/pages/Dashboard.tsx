import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ServerInfo {
  id: string;
  name: string;
  channels: string[];
}

const STORAGE_KEY = "ml-servers";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard — Message Lounge";
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const raw = data.user?.email ?? data.user?.id ?? null;
      const name = raw && typeof raw === "string" && raw.endsWith("@users.example.com") ? raw.split("@")[0] : raw;
      setEmail(name);
    });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setServers(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Welcome{email ? `, ${email}` : ""}</h1>
        <p className="text-muted-foreground">Pick a server to jump into chat.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Channels: {s.channels.length}</div>
              <Button onClick={() => navigate(`/s/${s.id}/c/${s.channels[0]}`)}>Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
