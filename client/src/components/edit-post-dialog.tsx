import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertPostSchema, type InsertPost, type Post } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImagePlus, Plus, X } from 'lucide-react';

interface EditPostDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [currentMediaUrl, setCurrentMediaUrl] = useState('');
  const { toast } = useToast();

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
      section: 'social',
      mediaUrls: [],
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        section: post.section,
        mediaUrls: post.mediaUrls || [],
      });
      setMediaUrls(post.mediaUrls || []);
    }
  }, [post, form]);

  const updatePostMutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      return apiRequest('PATCH', `/api/posts/${post?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      onOpenChange(false);
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث المنشور بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل تحديث المنشور',
      });
    },
  });

  const addMediaUrl = () => {
    if (currentMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, currentMediaUrl.trim()]);
      setCurrentMediaUrl('');
    }
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const onSubmit = (data: InsertPost) => {
    updatePostMutation.mutate({
      ...data,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setCurrentMediaUrl('');
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل المنشور</DialogTitle>
          <DialogDescription>قم بتحديث محتوى المنشور</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القسم</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-section">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="social">القسم الاجتماعي</SelectItem>
                      <SelectItem value="cultural">القسم الثقافي</SelectItem>
                      <SelectItem value="general">قسم المنوعات</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="عنوان المنشور" data-testid="input-edit-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المحتوى</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="اكتب محتوى المنشور..."
                      className="min-h-32"
                      data-testid="input-edit-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                الصور والفيديوهات
              </FormLabel>
              <div className="flex gap-2">
                <Input
                  value={currentMediaUrl}
                  onChange={(e) => setCurrentMediaUrl(e.target.value)}
                  placeholder="الصق رابط الصورة أو الفيديو"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMediaUrl())}
                  data-testid="input-edit-media-url"
                />
                <Button
                  type="button"
                  onClick={addMediaUrl}
                  variant="outline"
                  size="icon"
                  data-testid="button-add-edit-media"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {mediaUrls.length > 0 && (
                <div className="space-y-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg" data-testid={`edit-media-url-${index}`}>
                      <span className="text-sm truncate flex-1">{url}</span>
                      <Button
                        type="button"
                        onClick={() => removeMediaUrl(index)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        data-testid={`button-remove-edit-media-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={updatePostMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updatePostMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'حفظ التعديلات'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
