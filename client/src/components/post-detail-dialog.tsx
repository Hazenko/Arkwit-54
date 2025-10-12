import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { CommentsSection } from './comments-section';
import { PostCard } from './post-card';
import type { PostWithDetails } from '@shared/schema';
import { Loader2 } from 'lucide-react';

interface PostDetailDialogProps {
  postId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
}

export function PostDetailDialog({ 
  postId, 
  open, 
  onOpenChange, 
  onLike, 
  onDelete, 
  onEdit 
}: PostDetailDialogProps) {
  const { data: post, isLoading } = useQuery<PostWithDetails>({
    queryKey: ['/api/posts', postId],
    enabled: !!postId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل المنشور</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : post ? (
          <div className="space-y-6">
            <PostCard
              post={post}
              onLike={onLike}
              onDelete={onDelete}
              onEdit={onEdit}
              onCommentClick={() => {}}
            />
            <CommentsSection postId={post.id} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
