import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/post-card';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { EditPostDialog } from '@/components/edit-post-dialog';
import { PostDetailDialog } from '@/components/post-detail-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PostWithDetails, Post } from '@shared/schema';
import { useLocation } from 'wouter';
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState('social');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  const { data: posts = [], isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ['/api/posts', selectedSection],
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: number; reactionType: string }) => {
      return apiRequest('POST', '/api/likes', { postId, reactionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest('DELETE', `/api/posts/${postId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setDeletePostId(null);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المنشور بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل حذف المنشور',
      });
    },
  });

  const canCreatePost = user && ['admin', 'social_moderator', 'cultural_moderator'].includes(user.role);

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      social: 'القسم الاجتماعي',
      cultural: 'القسم الثقافي',
      general: 'قسم المنوعات',
    };
    return names[section] || section;
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">Arkwit 54</h1>
              {user && (
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>مرحباً،</span>
                  <span className="font-medium text-foreground">{user.fullName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user?.role === 'admin' && (
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  data-testid="button-admin"
                >
                  <Settings className="ml-2 h-5 w-5" />
                  لوحة التحكم
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="ml-2 h-5 w-5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-3xl font-bold text-foreground">منشورات الحي</h2>
            {canCreatePost && <CreatePostDialog defaultSection={selectedSection} />}
          </div>

          <Tabs value={selectedSection} onValueChange={setSelectedSection}>
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="social" data-testid="tab-social">
                القسم الاجتماعي
              </TabsTrigger>
              <TabsTrigger value="cultural" data-testid="tab-cultural">
                القسم الثقافي
              </TabsTrigger>
              <TabsTrigger value="general" data-testid="tab-general">
                قسم المنوعات
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedSection} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    لا توجد منشورات في {getSectionName(selectedSection)} بعد
                  </p>
                  {canCreatePost && (
                    <p className="text-sm text-muted-foreground mt-2">
                      كن أول من ينشر في هذا القسم
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onReaction={(postId, reactionType) => reactionMutation.mutate({ postId, reactionType })}
                      onDelete={(postId) => setDeletePostId(postId)}
                      onEdit={(postId) => {
                        const post = posts.find(p => p.id === postId);
                        if (post) setEditingPost(post);
                      }}
                      onCommentClick={(postId) => setSelectedPostId(postId)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PostDetailDialog
        postId={selectedPostId}
        open={selectedPostId !== null}
        onOpenChange={(open) => !open && setSelectedPostId(null)}
        onLike={(postId) => likeMutation.mutate(postId)}
        onDelete={(postId) => setDeletePostId(postId)}
        onEdit={(postId) => {
          const post = posts.find(p => p.id === postId);
          if (post) {
            setEditingPost(post);
            setSelectedPostId(null);
          }
        }}
      />

      <EditPostDialog
        post={editingPost}
        open={editingPost !== null}
        onOpenChange={(open) => !open && setEditingPost(null)}
      />

      <AlertDialog open={deletePostId !== null} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنشور بشكل دائم ولا يمكن التراجع عن هذا الإجراء
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && deletePostMutation.mutate(deletePostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deletePostMutation.isPending ? (
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
