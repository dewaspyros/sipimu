import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  FileBarChart,
  Settings,
  Activity,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
const hospitalLogo = "/lovable-uploads/52e51664-283f-4073-94f9-3d65a68fa748.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Grafik Kepatuhan Clinical Pathways"
  },
  {
    title: "Clinical Pathway",
    url: "/clinical-pathway",
    icon: ClipboardPlus,
    description: "Data Clinical Pathways"
  },
  {
    title: "Rekap Data",
    url: "/rekap-data",
    icon: FileBarChart,
    description: "Laporan dan Rekap"
  },
  {
    title: "Pengaturan",
    url: "/pengaturan",
    icon: Settings,
    description: "Konfigurasi Sistem"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  return (
    <Sidebar className="medical-transition" collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <img 
            src={hospitalLogo} 
            alt="PKU Muhammadiyah Wonosobo" 
            className="w-10 h-10 rounded-full"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-primary">SiPi-Mu</h2>
              <p className="text-xs text-muted-foreground">Clinical Pathways</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all medical-transition hover:bg-accent text-black hover:text-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-black transition-all medical-transition hover:bg-accent hover:text-foreground w-full">
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span className="text-sm">Keluar</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}