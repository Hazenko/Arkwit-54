import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { CommentWithUser } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface CommentsSectionProps {
  postId: number;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ['/api/comments', postId],
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', '/api/comments', { postId, commentText: text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setCommentText('');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل إضافة التعليق',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">التعليقات ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="أضف تعليقك..."
            className="min-h-20"
            data-testid="input-comment"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              data-testid="button-submit-comment"
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إضافة تعليق'
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">لا توجد تعليقات بعد</p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4" data-testid={`comment-${comment.id}`}>
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(comment.user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{comment.user.fullName}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${roleColors[comment.user.role as keyof typeof roleColors]}`}
                    >
                      {getRoleName(comment.user.role)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`text-comment-${comment.id}`}>
                    {comment.commentText}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
