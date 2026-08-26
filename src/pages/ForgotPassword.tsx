import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Phone, IdCard, Send } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [formData, setFormData] = useState({
    nik: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form
    if (!formData.nik) {
      setError("Silakan masukkan NIK");
      setLoading(false);
      return;
    }

    // Simulate password reset
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  if (step === 2) {
    return (
      <AuthLayout>
          <Card className="medical-card border-border/70">

            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Password Reset Berhasil!</CardTitle>
              <CardDescription>
                Password Anda telah direset. Silakan hubungi administrator untuk mendapatkan password baru.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <Alert className="border-primary bg-primary/10 text-primary">
                <AlertDescription>
                  Silakan hubungi administrator sistem untuk mendapatkan password baru Anda.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                <p>Hubungi IT Support RS PKU Muhammadiyah Wonosobo</p>
                <p>untuk mendapatkan password baru.</p>
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
    <AuthLayout>
        <Card className="medical-card border-border/70">
          <CardHeader className="space-y-1.5">
            <span className="icon-chip h-11 w-11 rounded-2xl" aria-hidden="true">
              <IdCard className="h-5 w-5" />
            </span>
            <CardTitle className="font-heading text-2xl">Lupa Password</CardTitle>
            <CardDescription>
              Masukkan NIK Anda untuk mereset password.
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
              
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <AsyncButton
                type="submit"
                className="w-full medical-transition"
                isLoading={loading}
                loadingText="Mengirim Link..."
              >
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                Reset Password
              </AsyncButton>
              
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

        <p className="text-center text-xs text-muted-foreground">
          © 2026 RS PKU Muhammadiyah Wonosobo. Semua hak dilindungi.
        </p>
    </AuthLayout>

  );
}