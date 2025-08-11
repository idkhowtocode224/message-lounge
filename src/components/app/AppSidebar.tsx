import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Hash, Server } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ServerInfo {
  id: string;
  name: string;
  channels: string[];
}

const STORAGE_KEY = "ml-servers";

function readServers(): ServerInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeServers(servers: ServerInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [newServer, setNewServer] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const initial = readServers();
    if (initial.length === 0) {
      const seed: ServerInfo = { id: "lobby", name: "Lobby", channels: ["general", "random"] };
      writeServers([seed]);
      setServers([seed]);
    } else {
      setServers(initial);
    }
  }, []);

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const isExpanded = useMemo(() => servers.some((s) => currentPath.startsWith(`/s/${s.id}`)), [currentPath, servers]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const handleCreate = () => {
    const name = newServer.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const server: ServerInfo = { id, name, channels: ["general", "random"] };
    const next = [...servers, server];
    setServers(next);
    writeServers(next);
    setNewServer("");
    navigate(`/s/${id}/c/general`);
  };

  const handleJoin = () => {
    const id = joinCode.trim().toLowerCase();
    if (!id) return;
    if (!servers.find((s) => s.id === id)) {
      const server: ServerInfo = { id, name: id, channels: ["general", "random"] };
      const next = [...servers, server];
      setServers(next);
      writeServers(next);
    }
    setJoinCode("");
    navigate(`/s/${id}/c/general`);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Servers</SidebarGroupLabel>
          <div className="px-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Create server"
                value={newServer}
                onChange={(e) => setNewServer(e.currentTarget.value)}
              />
              <Button size="icon" variant="secondary" onClick={handleCreate} aria-label="Create server">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Join by code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.currentTarget.value)}
              />
              <Button size="sm" variant="secondary" onClick={handleJoin}>Join</Button>
            </div>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {servers.map((s) => (
                <SidebarMenuItem key={s.id}>
                  <SidebarMenuButton asChild>
                    <NavLink to={`/s/${s.id}/c/general`} end className={getNavCls}>
                      <Server className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{s.name}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                  {currentPath.startsWith(`/s/${s.id}`) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {s.channels.map((ch) => (
                        <NavLink key={ch} to={`/s/${s.id}/c/${ch}`} className={({ isActive }) =>
                          isActive ? "flex items-center text-primary" : "flex items-center text-muted-foreground hover:text-foreground"
                        }>
                          <Hash className="h-3.5 w-3.5 mr-2" /> {ch}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
