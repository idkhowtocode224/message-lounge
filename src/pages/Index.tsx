import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Message Lounge</h1>
        <p className="text-xl text-muted-foreground">Create servers, join channels, chat in realtime.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/auth")}>Sign in</Button>
          <Button variant="secondary" onClick={() => navigate("/app")}>Open app</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
