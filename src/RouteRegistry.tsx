import { Outlet } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ServerChannel from "@/pages/ServerChannel";

// This file exists only to ensure TS picks up the module paths above during the first build.
// Actual route usage is defined inside App.tsx via imports.
export default function RouteRegistry() {
  return <Outlet />;
}
