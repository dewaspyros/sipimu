import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
export default function SidebarProbe() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6">probe</main>
    </SidebarProvider>
  );
}
