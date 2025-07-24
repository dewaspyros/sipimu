import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Phone, IdCard, Send } from "lucide-react";
const hospitalLogo = "/lovable-uploads/52e51664-283f-4073-94f9-3d65a68fa748.png";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [formData, setFormData] = useState({
    nik: "",
    nomorHp: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form
    if (!formData.nik || !formData.nomorHp) {
      setError("Silakan lengkapi NIK dan nomor HP");
      setLoading(false);
      return;
    }

    // Simulate WhatsApp link sending
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 medical-gradient">
        <div className="w-full max-w-md space-y-6">
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
          </div>

          <Card className="medical-card medical-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Link Reset Password Terkirim!</CardTitle>
              <CardDescription>
                Link reset password telah dikirim ke WhatsApp Anda di nomor {formData.nomorHp}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <Alert className="border-primary bg-primary/10 text-primary">
                <AlertDescription>
                  Silakan cek pesan WhatsApp Anda dan klik link yang diberikan untuk mengatur ulang password.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                <p>Tidak menerima pesan?</p>
                <p>Pastikan nomor HP yang Anda masukkan benar dan aktif.</p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full"
              >
                Kirim Ulang
              </Button>
              
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Kembali ke Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Forgot Password Form */}
        <Card className="medical-card medical-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Lupa Password</CardTitle>
            <CardDescription className="text-center">
              Masukkan NIK dan nomor HP Anda untuk mendapatkan link reset password via WhatsApp
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nik">NIK Rumah Sakit</Label>
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
                <Label htmlFor="nomorHp">Nomor HP</Label>
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
                <p className="text-xs text-muted-foreground">
                  Link reset password akan dikirim ke nomor WhatsApp ini
                </p>
              </div>
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
                    <span>Mengirim Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Kirim Link Reset Password</span>
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
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