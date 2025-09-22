import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Settings, MessageSquare, Key, Save, RefreshCw, Plus, Trash2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWhatsappSettings } from "@/hooks/useWhatsappSettings";

export default function Pengaturan() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // WhatsApp Settings Hook
  const {
    settings: whatsappSettings,
    setSettings: setWhatsappSettings,
    loading: whatsappLoading,
    saving: whatsappSaving,
    saveSettings: saveWhatsappSettings
  } = useWhatsappSettings();

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleWhatsappSave = async () => {
    await saveWhatsappSettings(whatsappSettings);
  };

  const addPhoneNumber = () => {
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: [...whatsappSettings.notification_phones, '']
    });
  };

  const removePhoneNumber = (index: number) => {
    const newPhones = whatsappSettings.notification_phones.filter((_, i) => i !== index);
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: newPhones.length > 0 ? newPhones : ['']
    });
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhones = [...whatsappSettings.notification_phones];
    newPhones[index] = value;
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: newPhones
    });
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
      message_template: `Halo, Data Clinical Pathway baru telah ditambahkan:

Nama Pasien: {nama_pasien}
No. RM: {no_rm}
Jenis CP: {jenis_clinical_pathway}
Tanggal Masuk: {tanggal_masuk}
Jam Masuk: {jam_masuk}
DPJP: {dpjp}

Silakan cek sistem untuk detail lebih lanjut.`
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Ubah Password
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Pengaturan WhatsApp
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

        <TabsContent value="whatsapp">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Pengaturan WhatsApp Notifikasi
              </CardTitle>
              <CardDescription>
                Kelola pengaturan API WhatsApp Fonte dan nomor tujuan notifikasi untuk clinical pathway baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <Alert className="border-primary bg-primary/5">
                    <AlertDescription>
                      Pastikan API Key Fonte valid dan nomor WhatsApp dalam format internasional (contoh: 6281234567890).
                      Notifikasi akan dikirim otomatis saat data clinical pathway baru ditambahkan.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key Fonte *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={whatsappSettings.api_key}
                      onChange={(e) => setWhatsappSettings({
                        ...whatsappSettings,
                        api_key: e.target.value
                      })}
                      placeholder="Masukkan API Key Fonte"
                      className="medical-transition"
                    />
                    <p className="text-sm text-muted-foreground">
                      Dapatkan API Key dari dashboard Fonte WhatsApp API
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Nomor Tujuan Notifikasi</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPhoneNumber}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Nomor
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {whatsappSettings.notification_phones.map((phone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={phone}
                            onChange={(e) => updatePhoneNumber(index, e.target.value)}
                            placeholder="Contoh: 6281234567890"
                            className="flex-1 medical-transition"
                          />
                          {whatsappSettings.notification_phones.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removePhoneNumber(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Format: 62XXXXXXXXXX (tanpa tanda + atau spasi)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="messageTemplate">Template Pesan Notifikasi</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetWhatsappToDefault}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset ke Default
                      </Button>
                    </div>
                    <Textarea
                      id="messageTemplate"
                      value={whatsappSettings.message_template}
                      onChange={(e) => setWhatsappSettings({
                        ...whatsappSettings,
                        message_template: e.target.value
                      })}
                      placeholder="Template pesan notifikasi"
                      rows={8}
                      className="medical-transition"
                    />
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Variabel yang tersedia:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <code>{"{nama_pasien}"}</code>
                        <code>{"{no_rm}"}</code>
                        <code>{"{jenis_clinical_pathway}"}</code>
                        <code>{"{tanggal_masuk}"}</code>
                        <code>{"{jam_masuk}"}</code>
                        <code>{"{dpjp}"}</code>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleWhatsappSave}
                disabled={whatsappSaving || whatsappLoading}
                className="medical-transition"
              >
                {whatsappSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Simpan Pengaturan</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}