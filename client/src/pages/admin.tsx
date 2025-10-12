import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Users, FileText, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { User, PostWithDetails } from '@shared/schema';

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithDetails[]>({
    queryKey: ['/api/posts', 'all'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest('PATCH', `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث دور المستخدم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل تحديث الدور',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('DELETE', `/api/users/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setDeleteUserId(null);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المستخدم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل حذف المستخدم',
      });
    },
  });

  if (user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const roleColors = {
    admin: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    social_moderator: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    cultural_moderator: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    user: 'bg-muted text-muted-foreground',
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'مدير',
      social_moderator: 'مشرف اجتماعي',
      cultural_moderator: 'مشرف ثقافي',
      user: 'عضو',
    };
    return roles[role] || role;
  };

  const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                data-testid="button-back"
              >
                <ArrowLeft className="ml-2 h-5 w-5" />
                العودة
              </Button>
              <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-users">
                  {users.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-posts">
                  {posts.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي التعليقات</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-comments">
                  {totalComments}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>عرض وإدارة جميع المستخدمين وأدوارهم</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>الدور</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                          <TableCell className="font-medium">{u.fullName}</TableCell>
                          <TableCell dir="ltr" className="text-right">{u.email}</TableCell>
                          <TableCell dir="ltr" className="text-right">{u.phone}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(role) => updateRoleMutation.mutate({ userId: u.id, role })}
                              disabled={u.id === user?.id}
                            >
                              <SelectTrigger className="w-48" data-testid={`select-role-${u.id}`}>
                                <SelectValue>
                                  <Badge
                                    variant="outline"
                                    className={roleColors[u.role as keyof typeof roleColors]}
                                  >
                                    {getRoleName(u.role)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">عضو</SelectItem>
                                <SelectItem value="social_moderator">مشرف اجتماعي</SelectItem>
                                <SelectItem value="cultural_moderator">مشرف ثقافي</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {u.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteUserId(u.id)}
                                data-testid={`button-delete-user-${u.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستخدم وجميع منشوراته وتعليقاته بشكل دائم
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-user">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
