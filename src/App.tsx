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
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const authContext = useAuth();
  
  return (
    <AuthProvider value={authContext}>
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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/clinical-pathway" element={
              <ProtectedRoute>
                <Layout><ClinicalPathway /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/clinical-pathway-form" element={
              <ProtectedRoute>
                <Layout><ClinicalPathwayForm /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/clinical-pathway-checklist" element={
              <ProtectedRoute>
                <Layout><ClinicalPathwayChecklist /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/rekap-data" element={
              <ProtectedRoute>
                <Layout><RekapData /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/pengaturan" element={
              <ProtectedRoute>
                <Layout><Pengaturan /></Layout>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
