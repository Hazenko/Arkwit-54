import { useState } from 'react';
import { Heart, MessageCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import type { PostWithDetails } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PostCardProps {
  post: PostWithDetails;
  onLike: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  onCommentClick: (postId: number) => void;
}

export function PostCard({ post, onLike, onDelete, onEdit, onCommentClick }: PostCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const sectionColors = {
    social: 'border-r-blue-500',
    cultural: 'border-r-green-500',
    general: 'border-r-gray-500',
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const canModify = user && (
    user.id === post.userId ||
    user.role === 'admin' ||
    (user.role === 'social_moderator' && post.section === 'social') ||
    (user.role === 'cultural_moderator' && post.section === 'cultural')
  );

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className={`hover-elevate border-r-4 ${sectionColors[post.section as keyof typeof sectionColors]}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(post.user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{post.user.fullName}</h3>
              <Badge
                variant="outline"
                className={`text-xs ${roleColors[post.user.role as keyof typeof roleColors]}`}
                data-testid={`badge-role-${post.user.role}`}
              >
                {getRoleName(post.user.role)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-post-time">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ar })}
            </p>
          </div>
        </div>
        {canModify && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(post.id)}
                data-testid={`button-edit-post-${post.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(post.id)}
                data-testid={`button-delete-post-${post.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground" data-testid={`text-post-title-${post.id}`}>
          {post.title}
        </h2>
        <p className="text-foreground whitespace-pre-wrap leading-relaxed" data-testid={`text-post-content-${post.id}`}>
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="flex items-center gap-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
          data-testid={`button-like-${post.id}`}
        >
          <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span data-testid={`text-likes-count-${post.id}`}>{post.likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => onCommentClick(post.id)}
          data-testid={`button-comments-${post.id}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span data-testid={`text-comments-count-${post.id}`}>{post.commentsCount}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
