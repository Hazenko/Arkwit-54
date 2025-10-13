import { useState } from 'react';
import { MessageCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { EmojiReactionPicker } from './emoji-reaction-picker';
import { motion } from 'framer-motion';
import type { PostWithDetails } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PostCardProps {
  post: PostWithDetails;
  onReaction: (postId: number, reactionType: string) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  onCommentClick: (postId: number) => void;
}

export function PostCard({ post, onReaction, onDelete, onEdit, onCommentClick }: PostCardProps) {
  const { user } = useAuth();
  const [isReacting, setIsReacting] = useState(false);

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

  const handleReaction = async (reactionType: string) => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      await onReaction(post.id, reactionType);
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
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
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: post.mediaUrls.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {post.mediaUrls.map((url, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden bg-muted" data-testid={`media-item-${post.id}-${index}`}>
                {url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-auto max-h-96 object-contain"
                    data-testid={`video-${post.id}-${index}`}
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-auto max-h-96 object-contain"
                    data-testid={`image-${post.id}-${index}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-4 pt-4">
        <div className="flex items-center gap-2">
          <EmojiReactionPicker
            onReactionSelect={handleReaction}
            currentReaction={post.userReaction}
            disabled={isReacting}
          />
          {post.likesCount > 0 && (
            <motion.span 
              className="text-sm text-muted-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              data-testid={`text-likes-count-${post.id}`}
            >
              {post.likesCount}
            </motion.span>
          )}
        </div>

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
    </motion.div>
  );
}
