import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserCheck } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nik: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [lockRemaining, setLockRemaining] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user, loading } = useAuth();

  // Only allow same-origin relative paths as redirect targets.
  const rawNext = searchParams.get("next");
  const nextPath = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(nextPath);
    }
  }, [user, navigate, nextPath]);

  // Sinkronkan status kunci login (3x gagal → tunggu 5 menit) dengan hitung mundur.
  useEffect(() => {
    const tick = () => {
      const status = getLockStatus(formData.nik);
      setLockRemaining(status.locked ? status.remainingMs : 0);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [formData.nik]);

  const isLocked = lockRemaining > 0;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nik || !formData.password) {
      setError("Silakan lengkapi NIK dan password");
      return;
    }

    const { error: signInError } = await signIn(formData.nik, formData.password);

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate(nextPath);
    }
  };

  return (
    <AuthLayout>
      <Card className="medical-card border-border/70">
        <CardHeader className="space-y-1.5">
          <span className="icon-chip h-11 w-11 rounded-2xl" aria-hidden="true">
            <UserCheck className="h-5 w-5" />
          </span>
          <CardTitle className="font-heading text-2xl">Masuk ke SiPi-Mu</CardTitle>
          <CardDescription>Gunakan NIK dan password akun staf Anda.</CardDescription>
        </CardHeader>


          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nik">NIK </Label>
                <Input
                  id="nik"
                  type="text"
                  placeholder="Masukkan NIK"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="medical-transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="medical-transition pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link to="/lupa-password" className="text-sm text-primary hover:underline medical-transition">
                  Lupa password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <AsyncButton
                type="submit"
                className="w-full medical-transition"
                isLoading={loading}
                loadingText="Memproses..."
              >
                <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Masuk
              </AsyncButton>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Belum memiliki akun?{" "}
                  <Link to="/daftar" className="text-primary hover:underline medical-transition">
                    Daftar disini
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        © 2026 RS PKU Muhammadiyah Wonosobo. Tim Case Manajer.
      </p>
    </AuthLayout>

  );
}
