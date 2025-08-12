import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  userId: string;
  author: string;
  content: string;
  ts: number;
}

export default function ServerChannel() {
  const { serverId = "lobby", channelId = "general" } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>("Me");
  const [online, setOnline] = useState<Record<string, any>>({});
  const chanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    const raw = data.user?.email ?? data.user?.id ?? "Anon";
    const name = raw && typeof raw === "string" && raw.endsWith("@users.example.com") ? raw.split("@")[0] : raw;
    setUsername(name as string);
  });
}, []);

  const roomKey = useMemo(() => `room:${serverId}:${channelId}`,[serverId, channelId]);

  useEffect(() => {
    document.title = `#${channelId} — ${serverId} | Message Lounge`;

    const setup = async () => {
      if (chanRef.current) {
        try { await chanRef.current.unsubscribe(); } catch {}
        chanRef.current = null;
      }

      const channel = supabase.channel(roomKey, { config: { presence: { key: "presence" } } });

      channel.on("broadcast", { event: "message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setMessages((prev) => [...prev, msg]);
        const mine = msg.author === username;
        if (!mine) {
          toast({ title: `New message in #${channelId}`, description: `${msg.author}: ${msg.content}` });
        }
      });

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnline(state);
      });

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ username });
        }
      });

      chanRef.current = channel;
    };

    setup();

    return () => {
      if (chanRef.current) {
        chanRef.current.unsubscribe();
      }
    };
  }, [roomKey, username, channelId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !chanRef.current) return;
    const user = (await supabase.auth.getUser()).data.user;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: user?.id ?? "anon",
      author: username,
      content,
      ts: Date.now(),
    };
    await chanRef.current.send({ type: "broadcast", event: "message", payload: msg });
    setInput("");
  };

  const onlineUsers = useMemo(() => {
    try {
      const flat = Object.values(online).flat() as any[];
      const names = flat.map((i) => i.username);
      return Array.from(new Set(names));
    } catch { return []; }
  }, [online]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <div className="font-medium">#{channelId}</div>
        <div className="text-sm text-muted-foreground">Online: {onlineUsers.length}</div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className="p-3">
            <div className="text-sm font-medium">{m.author}</div>
            <div className="text-sm text-muted-foreground">{new Date(m.ts).toLocaleTimeString()}</div>
            <div className="mt-1">{m.content}</div>
          </Card>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">No messages yet. Say hello!</div>
        )}
      </div>

      <div className="border-t p-3 flex gap-2">
        <Input
          placeholder={`Message #${channelId}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" ? handleSend() : undefined}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
