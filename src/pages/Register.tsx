import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus, Phone, IdCard } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nik: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();

  // Redirect if already logged in (except during registration flow)
  useEffect(() => {
    if (user && !isRegistering) {
      navigate("/dashboard");
    }
  }, [user, isRegistering, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsRegistering(true);

    // Validate form
    if (!formData.nik || !formData.fullName || !formData.password || !formData.confirmPassword) {
      setError("Silakan lengkapi semua field");
      setIsRegistering(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsRegistering(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsRegistering(false);
      return;
    }

    const { error: signUpError } = await signUp(formData.nik, formData.password, formData.fullName);
    
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess("Akun berhasil didaftarkan! Mohon tunggu persetujuan admin sebelum dapat login.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    setIsRegistering(false);
  };

  return (
    <AuthLayout>
        <Card className="medical-card border-border/70">
          <CardHeader className="space-y-1.5">
            <span className="icon-chip h-11 w-11 rounded-2xl" aria-hidden="true">
              <UserPlus className="h-5 w-5" />
            </span>
            <CardTitle className="font-heading text-2xl">Daftar Akun</CardTitle>
            <CardDescription>
              Buat akun baru. Akses aktif setelah disetujui admin.
            </CardDescription>
          </CardHeader>

          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-success bg-success/10 text-success">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nik">NIK Rumah Sakit *</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nik"
                    type="text"
                    placeholder="Masukkan NIK Rumah Sakit"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="medical-transition pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="medical-transition"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="medical-transition pr-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <AsyncButton
                type="submit"
                className="w-full medical-transition"
                isLoading={loading}
                loadingText="Memproses..."
              >
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Daftar Akun
              </AsyncButton>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Sudah memiliki akun?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline medical-transition"
                  >
                    Masuk disini
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 RS PKU Muhammadiyah Wonosobo. Semua hak dilindungi.
        </p>
    </AuthLayout>

  );
}