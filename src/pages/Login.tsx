import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserCheck } from "lucide-react";
const hospitalLogo = "/lovable-uploads/52e51664-283f-4073-94f9-3d65a68fa748.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nik: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate login validation
    if (formData.nik && formData.password) {
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        // For demo purposes, accept any credentials
        navigate("/dashboard");
      }, 1500);
    } else {
      setError("Silakan lengkapi NIK dan password");
      setLoading(false);
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

        {/* Login Form */}
        <Card className="medical-card medical-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Masuk</CardTitle>
            <CardDescription className="text-center">
              Masukkan NIK dan password Anda
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
                <Link
                  to="/lupa-password"
                  className="text-sm text-primary hover:underline medical-transition"
                >
                  Lupa password?
                </Link>
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
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Masuk</span>
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Belum memiliki akun?{" "}
                  <Link
                    to="/daftar"
                    className="text-primary hover:underline medical-transition"
                  >
                    Daftar disini
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-white/70 text-xs">
            © 2025 RS PKU Muhammadiyah Wonosobo. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}