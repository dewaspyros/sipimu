import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Settings, MessageSquare, Key, Save, RefreshCw, Trash2, Users, Plus, UserCheck, UserX, Shield, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWhatsappSettings } from "@/hooks/useWhatsappSettings";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    fetchingGroups,
    saveSettings: saveWhatsappSettings,
    fetchGroups
  } = useWhatsappSettings();
  
  // User Management Hook
  const {
    users,
    pendingUsers,
    loading: usersLoading,
    isAdmin,
    approveUser,
    rejectUser,
    updateUserRole
  } = useUserManagement();
  
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleWhatsappSave = async () => {
    await saveWhatsappSettings(whatsappSettings);
  };

  const addManualGroup = () => {
    const newGroups = [...whatsappSettings.notification_phones, ''];
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: newGroups
    });
  };

  const updateManualGroup = (index: number, value: string) => {
    const newGroups = [...whatsappSettings.notification_phones];
    newGroups[index] = value;
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: newGroups
    });
  };

  const removeGroup = (index: number) => {
    const newGroups = whatsappSettings.notification_phones.filter((_, i) => i !== index);
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: newGroups.length > 0 ? newGroups : []
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

  const handleFetchGroups = async () => {
    await fetchGroups();
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const addSelectedGroupsToNotifications = () => {
    if (selectedGroups.length === 0) return;
    
    const currentGroups = whatsappSettings.notification_phones;
    const newGroups = [...new Set([...currentGroups, ...selectedGroups])];
    setWhatsappSettings({
      ...whatsappSettings,
      notification_phones: newGroups
    });
    setSelectedGroups([]);
    toast({
      title: 'Berhasil',
      description: `${selectedGroups.length} grup ditambahkan ke daftar notifikasi`,
    });
  };

  const getGroupName = (groupId: string): string => {
    if (!whatsappSettings.group_list || !Array.isArray(whatsappSettings.group_list)) {
      return groupId;
    }
    const group = whatsappSettings.group_list.find(g => g.id === groupId);
    return group?.name || group?.subject || groupId;
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
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Ubah Password
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Manajemen User
            </TabsTrigger>
          )}
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
                      Pastikan API Key Fonte valid. Gunakan tombol "Ambil Daftar Grup" untuk mendapatkan grup WhatsApp yang tersedia,
                      kemudian pilih grup yang ingin menerima notifikasi. Notifikasi akan dikirim otomatis saat data clinical pathway baru ditambahkan.
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

                  {/* WhatsApp Groups Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Daftar Grup WhatsApp
                        </Label>
                        {whatsappSettings.last_group_update && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Terakhir diperbarui: {new Date(whatsappSettings.last_group_update).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFetchGroups}
                        disabled={fetchingGroups || !whatsappSettings.api_key}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${fetchingGroups ? 'animate-spin' : ''}`} />
                        Ambil Daftar Grup
                      </Button>
                    </div>

                    {whatsappSettings.group_list && whatsappSettings.group_list.length > 0 ? (
                      <div className="space-y-2">
                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                          {whatsappSettings.group_list.map((group: any) => (
                            <div key={group.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                              <Checkbox
                                id={group.id}
                                checked={selectedGroups.includes(group.id)}
                                onCheckedChange={() => toggleGroupSelection(group.id)}
                              />
                              <label
                                htmlFor={group.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                              >
                                {group.name || group.subject || group.id}
                              </label>
                            </div>
                          ))}
                        </div>
                        {selectedGroups.length > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addSelectedGroupsToNotifications}
                            className="w-full"
                          >
                            Tambahkan {selectedGroups.length} Grup Terpilih
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          Klik "Ambil Daftar Grup" untuk mendapatkan daftar grup WhatsApp yang tersedia
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Selected Groups for Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Grup Terpilih untuk Notifikasi
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addManualGroup}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Manual
                      </Button>
                    </div>

                    {whatsappSettings.notification_phones.length > 0 ? (
                      <div className="space-y-3">
                        {whatsappSettings.notification_phones.map((groupId, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <Input
                              value={groupId}
                              onChange={(e) => updateManualGroup(index, e.target.value)}
                              placeholder="Contoh: 120363321533648377@g.us"
                              className="flex-1 medical-transition font-mono text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeGroup(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          Belum ada grup yang dipilih. Pilih grup dari daftar di atas atau tambahkan Group ID secara manual.
                        </AlertDescription>
                      </Alert>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Format Group ID: 120363xxxxxxxxx@g.us (dapatkan dari daftar grup di atas atau dari Fonnte dashboard)
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

        {/* User Management Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="users">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Manajemen User
                </CardTitle>
                <CardDescription>
                  Kelola persetujuan pendaftaran dan role pengguna
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {/* Pending Approvals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-warning" />
                        <h3 className="font-semibold">Menunggu Persetujuan ({pendingUsers.length})</h3>
                      </div>
                      
                      {pendingUsers.length === 0 ? (
                        <Alert>
                          <AlertDescription>
                            Tidak ada pengguna yang menunggu persetujuan.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>NIK</TableHead>
                              <TableHead>Nama Lengkap</TableHead>
                              <TableHead>Tanggal Daftar</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-mono">{user.nik}</TableCell>
                                <TableCell>{user.full_name || '-'}</TableCell>
                                <TableCell>
                                  {new Date(user.created_at).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => approveUser(user.user_id)}
                                    className="bg-success hover:bg-success/90"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Setujui
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectUser(user.user_id)}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Tolak
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    {/* All Users Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h3 className="font-semibold">Pengguna Aktif ({users.length})</h3>
                      </div>
                      
                      {users.length === 0 ? (
                        <Alert>
                          <AlertDescription>
                            Belum ada pengguna yang disetujui.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>NIK</TableHead>
                              <TableHead>Nama Lengkap</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead className="text-right">Ubah Role</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-mono">{user.nik}</TableCell>
                                <TableCell>{user.full_name || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role === 'admin' ? (
                                      <><ShieldCheck className="h-3 w-3 mr-1" /> Admin</>
                                    ) : (
                                      <>User</>
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Select
                                    value={user.role}
                                    onValueChange={(value: 'admin' | 'user') => updateUserRole(user.user_id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}