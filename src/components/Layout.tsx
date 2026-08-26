import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, LogOut, HeartPulse, Clock } from "lucide-react";
import { IconButton } from "@/components/common";
import { useAuthContext, formatSessionRemaining } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  useNotifications,
  ACTION_LABELS,
  formatRelativeTime,
} from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface LayoutProps {
  children: React.ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard Kepatuhan",
  "/clinical-pathway": "Clinical Pathway",
  "/clinical-pathway-form": "Form Identitas Pasien",
  "/clinical-pathway-checklist": "Checklist Clinical Pathway",
  "/rekap-data": "Rekap Data",
  "/pengaturan": "Pengaturan",
};

const LAST_SEEN_KEY = "notifications:lastSeenAt";

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuthContext();
  const { displayName, initials } = useProfile();
  const { notifications, loading: notifLoading } = useNotifications();
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? "Sistem Pelaporan Clinical Pathways";

  const [lastSeenAt, setLastSeenAt] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(LAST_SEEN_KEY)
  );

  const latestAt = notifications[0]?.created_at ?? null;
  const hasUnread =
    !!latestAt && (!lastSeenAt || new Date(latestAt).getTime() > new Date(lastSeenAt).getTime());

  const markSeen = () => {
    if (!latestAt) return;
    localStorage.setItem(LAST_SEEN_KEY, latestAt);
    setLastSeenAt(latestAt);
  };





  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-accent medical-transition" />
                <div className="hidden h-8 w-px bg-border sm:block" />
                <div className="hidden min-w-0 sm:flex sm:items-center sm:gap-3">
                  <span className="icon-chip h-9 w-9">
                    <HeartPulse className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h1 className="truncate font-heading text-base font-semibold leading-tight text-foreground">
                      {pageTitle}
                    </h1>
                    <p className="truncate text-xs text-muted-foreground">
                      RS PKU Muhammadiyah Wonosobo
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <DropdownMenu onOpenChange={(open) => open && markSeen()}>
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      variant="ghost"
                      label="Notifikasi"
                      className="relative rounded-full medical-transition"
                    >
                      <Bell className="h-5 w-5" aria-hidden="true" />
                      {hasUnread && (
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </IconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="font-heading">
                      Aktivitas Terakhir
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div role="status" aria-live="polite">
                      {notifLoading ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                          Memuat notifikasi...
                        </p>
                      ) : notifications.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                          Belum ada aktivitas
                        </p>
                      ) : (
                        <ul className="max-h-80 overflow-y-auto">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              className="flex flex-col gap-0.5 rounded-md px-2 py-2 text-sm hover:bg-accent medical-transition"
                            >
                              <span className="font-medium text-foreground">
                                {n.actor_name}{" "}
                                <span className="font-normal text-muted-foreground">
                                  {ACTION_LABELS[n.action_type] ?? n.action_type}
                                </span>
                              </span>
                              {n.nama_pasien && (
                                <span className="truncate text-xs text-muted-foreground">
                                  {n.nama_pasien}
                                  {n.no_rm ? ` · RM ${n.no_rm}` : ""}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground/80">
                                {formatRelativeTime(n.created_at)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      variant="ghost"
                      label="Menu akun pengguna"
                      className="rounded-full medical-transition"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-bold uppercase text-primary">
                        {initials}
                      </span>
                    </IconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="truncate text-sm font-semibold">{displayName}</span>
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        Staf terverifikasi
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex-1 animate-fade-in-up p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
