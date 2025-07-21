import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus, Phone, IdCard } from "lucide-react";
import hospitalLogo from "@/assets/hospital-logo.png";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: verification
  const [formData, setFormData] = useState({
    nik: "",
    nomorHp: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (step === 1) {
      // Validate form
      if (!formData.nik || !formData.nomorHp || !formData.password || !formData.confirmPassword) {
        setError("Silakan lengkapi semua field");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Password tidak cocok");
        setLoading(false);
        return;
      }

      // Simulate WhatsApp code sending
      setTimeout(() => {
        setLoading(false);
        setStep(2);
        setSuccess("Kode verifikasi telah dikirim ke WhatsApp Anda");
      }, 2000);
    } else {
      // Verify code
      if (!formData.verificationCode) {
        setError("Silakan masukkan kode verifikasi");
        setLoading(false);
        return;
      }

      // Simulate verification
      setTimeout(() => {
        setLoading(false);
        navigate("/login");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 medical-gradient">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={hospitalLogo} 
              alt="PKU Muhammadiyah Wonosobo" 
              className="w-20 h-20 rounded-full medical-shadow"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">SiPi-Mu</h1>
          <p className="text-white/90 text-sm">
            Sistem Pelaporan Clinical Pathways
          </p>
          <p className="text-white/80 text-xs mt-1">
            RS PKU Muhammadiyah Wonosobo
          </p>
        </div>

        {/* Register Form */}
        <Card className="medical-card medical-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 ? "Daftar Akun" : "Verifikasi WhatsApp"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? "Buat akun baru untuk mengakses sistem" 
                : "Masukkan kode yang dikirim ke WhatsApp Anda"
              }
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
              
              {step === 1 ? (
                <>
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
                    <Label htmlFor="nomorHp">Nomor HP *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nomorHp"
                        type="tel"
                        placeholder="Contoh: 08123456789"
                        value={formData.nomorHp}
                        onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                        className="medical-transition pl-10"
                        required
                      />
                    </div>
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
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Kode Verifikasi *</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Masukkan kode 6 digit"
                    value={formData.verificationCode}
                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                    className="medical-transition text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Kode dikirim ke: {formData.nomorHp}
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full medical-transition"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>{step === 1 ? "Kirim Kode Verifikasi" : "Verifikasi & Daftar"}</span>
                  </div>
                )}
              </Button>
              
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Kembali ke Form
                </Button>
              )}
              
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

        <div className="text-center">
          <p className="text-white/70 text-xs">
            © 2024 RS PKU Muhammadiyah Wonosobo. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}