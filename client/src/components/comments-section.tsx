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
import { motion, AnimatePresence } from 'framer-motion';
import type { CommentWithUser } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, Reply } from 'lucide-react';

interface CommentsSectionProps {
  postId: number;
}

interface CommentItemProps {
  comment: CommentWithUser;
  postId: number;
  depth?: number;
}

function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const addReplyMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest('POST', '/api/comments', {
        postId,
        commentText: text,
        parentCommentId: comment.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setReplyText('');
      setIsReplying(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل إضافة الرد',
      });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      addReplyMutation.mutate(replyText);
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

  const maxDepth = 3;
  const marginLeft = depth > 0 ? (depth > maxDepth ? maxDepth * 32 : depth * 32) : 0;

  return (
    <div style={{ marginLeft: `${marginLeft}px` }}>
      <Card className={`p-4 ${depth > 0 ? 'border-l-2 border-primary/20' : ''}`} data-testid={`comment-${comment.id}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
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
            <p className="text-sm text-foreground whitespace-pre-wrap mb-2" data-testid={`text-comment-${comment.id}`}>
              {comment.commentText}
            </p>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-8 text-xs"
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="h-3 w-3 ml-1" />
                رد
              </Button>
            )}
          </div>
        </div>

        {isReplying && user && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleReplySubmit}
            className="mt-3 mr-11 space-y-2"
          >
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`الرد على ${comment.user.fullName}...`}
              className="min-h-16"
              data-testid={`input-reply-${comment.id}`}
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyText('');
                }}
                data-testid={`button-cancel-reply-${comment.id}`}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!replyText.trim() || addReplyMutation.isPending}
                data-testid={`button-submit-reply-${comment.id}`}
              >
                {addReplyMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال'
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
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

  const countTotalComments = (comments: CommentWithUser[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countTotalComments(comment.replies) : 0);
    }, 0);
  };

  const totalComments = countTotalComments(comments);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">التعليقات ({totalComments})</h3>

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
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <CommentItem comment={comment} postId={postId} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
