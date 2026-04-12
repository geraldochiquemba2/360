import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import AdminDashboard from "@/pages/admin/dashboard";
import CandidateDashboard from "@/pages/candidate/dashboard";
import MentorshipPage from "@/pages/candidate/mentorship";
import ForumHome from "@/pages/candidate/forum-home";
import TopicView from "@/pages/candidate/topic-view";
import OpportunitiesPage from "@/pages/candidate/opportunities-list";
import TracksListPage from "@/pages/candidate/tracks-list";
import AiPulsePage from "@/pages/candidate/ai-pulse";
import MentorDashboard from "@/pages/mentor/dashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/dashboard" component={CandidateDashboard} />
      <Route path="/opportunities" component={OpportunitiesPage} />
      <Route path="/career-tracks" component={TracksListPage} />
      <Route path="/ai-pulse" component={AiPulsePage} />
      <Route path="/mentorship" component={MentorshipPage} />
      <Route path="/forum" component={ForumHome} />
      <Route path="/forum/topic/:id" component={TopicView} />
      <Route path="/mentor" component={MentorDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
