import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  FileBarChart,
  Settings,
  LogOut,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const hospitalLogo = "/lovable-uploads/52e51664-283f-4073-94f9-3d65a68fa748.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Grafik kepatuhan",
  },
  {
    title: "Clinical Pathway",
    url: "/clinical-pathway",
    icon: ClipboardPlus,
    description: "Data pasien",
  },
  {
    title: "Rekap Data",
    url: "/rekap-data",
    icon: FileBarChart,
    description: "Laporan & rekap",
  },
  {
    title: "Pengaturan",
    url: "/pengaturan",
    icon: Settings,
    description: "Konfigurasi sistem",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuthContext();
  const collapsed = state === "collapsed";
  const displayName = user?.email?.split("@")[0] ?? "Pengguna";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3 px-2 py-3", collapsed && "justify-center px-0")}>
          <div className="relative shrink-0">
            <img
              src={hospitalLogo}
              alt="Logo RS PKU Muhammadiyah Wonosobo"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-sidebar-border"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HeartPulse className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-heading text-base font-bold leading-tight text-sidebar-foreground">
                SiPi-Mu
              </span>
              <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                Clinical Pathways
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="!h-auto min-h-[2.75rem] overflow-visible p-0"
                  >
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "group flex min-h-[2.75rem] w-full items-center gap-3 rounded-lg px-2.5 py-2 medical-transition",
                          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive &&
                            "bg-primary text-primary-foreground shadow-soft hover:bg-primary hover:text-primary-foreground"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg medical-transition",
                              isActive
                                ? "bg-primary-foreground/15 text-primary-foreground"
                                : "bg-accent text-accent-foreground group-hover:bg-sidebar-background"
                            )}
                          >
                            <item.icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          {!collapsed && (
                            <span className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
                              <span className="truncate text-sm font-semibold leading-tight">
                                {item.title}
                              </span>
                              <span
                                className={cn(
                                  "truncate text-[11px] leading-tight",
                                  isActive ? "text-primary-foreground/75" : "text-muted-foreground"
                                )}
                              >
                                {item.description}
                              </span>
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>

                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mx-1 mt-4 rounded-xl border border-sidebar-border bg-accent/60 p-3">
            <div className="flex items-center gap-2 text-accent-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold">Data pasien terlindungi</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              Akses dibatasi untuk staf terverifikasi RS PKU Muhammadiyah Wonosobo.
            </p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {!collapsed && (
            <SidebarMenuItem>
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold uppercase text-primary">
                  {displayName.slice(0, 2)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-sidebar-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">Staf terverifikasi</span>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              tooltip="Keluar"
              className="text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {!collapsed && <span className="text-sm font-medium">Keluar</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
