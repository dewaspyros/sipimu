import type { ReactNode } from "react";
import { Activity, ClipboardCheck, ShieldCheck } from "lucide-react";

const hospitalLogo = "/lovable-uploads/52e51664-283f-4073-94f9-3d65a68fa748.png";

const HIGHLIGHTS = [
  {
    icon: ClipboardCheck,
    title: "Checklist harian terstruktur",
    description: "Pantau kepatuhan clinical pathway setiap pasien secara real-time.",
  },
  {
    icon: Activity,
    title: "Dashboard kepatuhan",
    description: "Grafik LOS, CP, terapi, dan penunjang dalam satu layar.",
  },
  {
    icon: ShieldCheck,
    title: "Akses terverifikasi",
    description: "Hanya staf yang disetujui admin yang dapat membuka data pasien.",
  },
];

interface AuthLayoutProps {
  children: ReactNode;
}

/** Kerangka dua sisi untuk halaman autentikasi: panel klinis + kartu form. */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel kiri */}
      <aside className="relative hidden overflow-hidden medical-gradient p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 medical-grid-pattern opacity-60" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <img
            src={hospitalLogo}
            alt="Logo RS PKU Muhammadiyah Wonosobo"
            className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary-foreground/30"
          />
          <div>
            <p className="font-heading text-lg font-bold leading-tight">SiPi-Mu</p>
            <p className="text-xs text-primary-foreground/80">Clinical Pathways System</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
              RS PKU Muhammadiyah Wonosobo
            </p>
            <h2 className="font-heading text-4xl font-bold leading-tight">
              Monitoring kepatuhan clinical pathway yang rapi dan terukur.
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/85">
              Satu sistem untuk input identitas pasien, checklist harian, rekap data, dan analitik
              kepatuhan tim Case Manajer.
            </p>
          </div>

          <ul className="space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-primary-foreground/75">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} RS PKU Muhammadiyah Wonosobo — Tim Case Manajer.
        </p>
      </aside>

      {/* Panel kanan: form */}
      <section className="flex items-center justify-center bg-background p-5 sm:p-10">
        <div className="w-full max-w-md animate-fade-in-up space-y-6">
          <div className="flex flex-col items-center gap-3 text-center lg:hidden">
            <img
              src={hospitalLogo}
              alt="Logo RS PKU Muhammadiyah Wonosobo"
              className="h-16 w-16 rounded-2xl object-cover shadow-card"
            />
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">SiPi-Mu</p>
              <p className="text-xs text-muted-foreground">
                Sistem Pelaporan Clinical Pathways — RS PKU Muhammadiyah Wonosobo
              </p>
            </div>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}
