import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Settings, MessageSquare, Key, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pengaturan() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // WhatsApp Settings State
  const [whatsappSettings, setWhatsappSettings] = useState({
    apiKey: "wa_test_key_12345",
    pesan: `Halo {nama},

Anda telah terdaftar di sistem SiPi-Mu RS PKU Muhammadiyah Wonosobo.

Untuk verifikasi akun, silakan gunakan kode berikut:
{kode}

Kode berlaku selama 5 menit.

Terima kasih.`,
    pesanResetPassword: `Halo {nama},

Anda telah meminta reset password untuk akun SiPi-Mu.

Silakan klik link berikut untuk mengatur ulang password:
{link}

Link berlaku selama 15 menit.

Jika Anda tidak meminta reset password, silakan abaikan pesan ini.

Terima kasih.`
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleWhatsappSave = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Berhasil",
        description: "Pengaturan WhatsApp telah disimpan",
      });
    }, 1000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru tidak cocok",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password baru minimal 6 karakter",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      toast({
        title: "Berhasil",
        description: "Password telah berhasil diubah",
      });
    }, 1500);
  };

  const resetWhatsappToDefault = () => {
    setWhatsappSettings({
      ...whatsappSettings,
      pesan: `Halo {nama},

Anda telah terdaftar di sistem SiPi-Mu RS PKU Muhammadiyah Wonosobo.

Untuk verifikasi akun, silakan gunakan kode berikut:
{kode}

Kode berlaku selama 5 menit.

Terima kasih.`,
      pesanResetPassword: `Halo {nama},

Anda telah meminta reset password untuk akun SiPi-Mu.

Silakan klik link berikut untuk mengatur ulang password:
{link}

Link berlaku selama 15 menit.

Jika Anda tidak meminta reset password, silakan abaikan pesan ini.

Terima kasih.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola konfigurasi sistem dan pengaturan akun
        </p>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Ubah Password
          </TabsTrigger>
        </TabsList>


        <TabsContent value="password">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Ubah password akun Anda untuk keamanan yang lebih baik
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <Alert className="border-primary bg-primary/5">
                  <AlertDescription>
                    Pastikan password baru Anda kuat dan mudah diingat. 
                    Password minimal 6 karakter dan kombinasikan huruf, angka, dan simbol.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                    placeholder="Masukkan password saat ini"
                    className="medical-transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value
                      })}
                      placeholder="Masukkan password baru"
                      className="medical-transition pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                    placeholder="Ulangi password baru"
                    className="medical-transition"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="medical-transition"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mengubah Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span>Ubah Password</span>
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}