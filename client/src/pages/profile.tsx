import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { ArrowRight, User as UserIcon, Lock, ImageIcon } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    fullName: profileData?.fullName || "",
    email: profileData?.email || "",
    phone: profileData?.phone || "",
    avatar: profileData?.avatar || "",
    bio: profileData?.bio || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث معلومات الملف الشخصي",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = async () => {
    if (profileData) {
      const updates: any = {};
      if (formData.fullName !== profileData.fullName) updates.fullName = formData.fullName;
      if (formData.email !== profileData.email) updates.email = formData.email;
      if (formData.phone !== profileData.phone) updates.phone = formData.phone;
      if (formData.avatar !== profileData.avatar) updates.avatar = formData.avatar;
      if (formData.bio !== profileData.bio) updates.bio = formData.bio;

      if (Object.keys(updates).length > 0) {
        await updateProfileMutation.mutateAsync(updates);
      } else {
        setIsEditing(false);
      }
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    await updateProfileMutation.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الملف الشخصي</h1>
          <Link href="/" data-testid="link-dashboard">
            <Button variant="outline" className="gap-2" data-testid="button-back-dashboard">
              <span>العودة للرئيسية</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileData.avatar || undefined} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {profileData.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{profileData.fullName}</CardTitle>
            <CardDescription>{profileData.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info" className="gap-2" data-testid="tab-info">
                  <UserIcon className="w-4 h-4" />
                  المعلومات الشخصية
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
                  <Lock className="w-4 h-4" />
                  الأمان
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!isEditing}
                      data-testid="input-fullname"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      data-testid="input-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      data-testid="input-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      رابط الصورة الشخصية
                    </Label>
                    <Input
                      id="avatar"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://example.com/avatar.jpg"
                      data-testid="input-avatar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">النبذة التعريفية</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="أخبرنا عن نفسك..."
                      data-testid="input-bio"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    {!isEditing ? (
                      <Button 
                        onClick={() => {
                          setFormData({
                            fullName: profileData.fullName,
                            email: profileData.email,
                            phone: profileData.phone,
                            avatar: profileData.avatar || "",
                            bio: profileData.bio || "",
                          });
                          setIsEditing(true);
                        }}
                        data-testid="button-edit-profile"
                      >
                        تعديل المعلومات
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFormData({
                              fullName: profileData.fullName,
                              email: profileData.email,
                              phone: profileData.phone,
                              avatar: profileData.avatar || "",
                              bio: profileData.bio || "",
                            });
                            setIsEditing(false);
                          }}
                          data-testid="button-cancel-edit"
                        >
                          إلغاء
                        </Button>
                        <Button
                          onClick={handleProfileUpdate}
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      data-testid="input-current-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      data-testid="input-new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      data-testid="input-confirm-password"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || updateProfileMutation.isPending}
                    className="w-full"
                    data-testid="button-update-password"
                  >
                    {updateProfileMutation.isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
