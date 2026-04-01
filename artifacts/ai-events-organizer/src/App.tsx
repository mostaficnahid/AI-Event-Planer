import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme";
import { AuthProvider } from "@/contexts/auth";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/events" component={EventsList} />
      <Route path="/events/new" component={EventNew} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/categories" component={CategoriesList} />
      <Route path="/profile" component={Profile} />
      <Route path="/ai-assistant" component={AiAssistant} />
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
