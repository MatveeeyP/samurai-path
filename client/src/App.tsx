import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SamuraiLayout from "./components/SamuraiLayout";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import TaskDetail from "./pages/TaskDetail";
import Diagnostics from "./pages/Diagnostics";
import Plan from "./pages/Plan";
import Flashcards from "./pages/Flashcards";
import Variants from "./pages/Variants";
import Homework from "./pages/Homework";
import Theory from "./pages/Theory";
import Motivation from "./pages/Motivation";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import News from "./pages/News";
import Videos from "./pages/Videos";
import SamuraiTimer from "./pages/SamuraiTimer";
import RememberMay21 from "./pages/RememberMay21";

function Router() {
  return (
    <SamuraiLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/practice" component={Practice} />
        <Route path="/task/:id" component={TaskDetail} />
        <Route path="/diagnostics" component={Diagnostics} />
        <Route path="/plan" component={Plan} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/variants" component={Variants} />
        <Route path="/homework" component={Homework} />
        <Route path="/theory" component={Theory} />
        <Route path="/motivation" component={Motivation} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route path="/news" component={News} />
        <Route path="/videos" component={Videos} />
        <Route path="/timer" component={SamuraiTimer} />
        <Route path="/remember-may-21" component={RememberMay21} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SamuraiLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
