import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

// Rute berat (chart, tabel besar, form) dimuat on-demand agar bundle awal kecil.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClinicalPathway = lazy(() => import("./pages/ClinicalPathway"));
const ClinicalPathwayForm = lazy(() => import("./pages/ClinicalPathwayForm"));
const ClinicalPathwayChecklist = lazy(() => import("./pages/ClinicalPathwayChecklist"));
const RekapData = lazy(() => import("./pages/RekapData"));
const Pengaturan = lazy(() => import("./pages/Pengaturan"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

const AppContent = () => {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/__probe" element={<SidebarProbe />} />
              <Route path="/login" element={<Login />} />
              <Route path="/daftar" element={<Register />} />
              <Route path="/lupa-password" element={<ForgotPassword />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clinical-pathway"
                element={
                  <ProtectedRoute>
                    <Layout><ClinicalPathway /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clinical-pathway-form"
                element={
                  <ProtectedRoute>
                    <Layout><ClinicalPathwayForm /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clinical-pathway-checklist"
                element={
                  <ProtectedRoute>
                    <Layout><ClinicalPathwayChecklist /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rekap-data"
                element={
                  <ProtectedRoute>
                    <Layout><RekapData /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pengaturan"
                element={
                  <ProtectedRoute>
                    <Layout><Pengaturan /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
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
