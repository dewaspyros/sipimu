import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClinicalPathway from "./pages/ClinicalPathway";
import ClinicalPathwayForm from "./pages/ClinicalPathwayForm";
import ClinicalPathwayChecklist from "./pages/ClinicalPathwayChecklist";
import RekapData from "./pages/RekapData";
import Pengaturan from "./pages/Pengaturan";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { Layout } from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
          <Route path="/lupa-password" element={<ForgotPassword />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/clinical-pathway" element={<Layout><ClinicalPathway /></Layout>} />
          <Route path="/clinical-pathway-form" element={<Layout><ClinicalPathwayForm /></Layout>} />
          <Route path="/clinical-pathway-checklist" element={<Layout><ClinicalPathwayChecklist /></Layout>} />
          <Route path="/rekap-data" element={<Layout><RekapData /></Layout>} />
          <Route path="/pengaturan" element={<Layout><Pengaturan /></Layout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
