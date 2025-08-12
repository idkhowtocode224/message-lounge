import { PropsWithChildren, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";

export function AppLayout({ children }: PropsWithChildren) {
  useEffect(() => {
    document.title = "Message Lounge — Realtime chat";
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <aside>
          <AppSidebar />
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-3">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-lg font-semibold">Message Lounge</h1>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </header>
          <main className="flex-1 overflow-auto"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
