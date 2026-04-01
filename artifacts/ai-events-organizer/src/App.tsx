import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme";
import { AuthProvider, useAuth } from "@/contexts/auth";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import EventsList from "@/pages/events-list";
import EventNew from "@/pages/event-new";
import EventDetail from "@/pages/event-detail";
import CategoriesList from "@/pages/categories";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import AiAssistant from "@/pages/ai-assistant";

const queryClient = new QueryClient();

/* Redirects to /login when not authenticated, preserving the intended path */
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return <Redirect to={`/login?next=${encodeURIComponent(location)}`} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected routes — require login */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/events">
        <ProtectedRoute component={EventsList} />
      </Route>
      <Route path="/events/new">
        <ProtectedRoute component={EventNew} />
      </Route>
      <Route path="/events/:id">
        <ProtectedRoute component={EventDetail} />
      </Route>
      <Route path="/categories">
        <ProtectedRoute component={CategoriesList} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/ai-assistant">
        <ProtectedRoute component={AiAssistant} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
