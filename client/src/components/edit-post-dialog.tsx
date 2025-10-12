import { useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

interface EditPostDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPostDialog({ post, open, onOpenChange }: EditPostDialogProps) {
  const { toast } = useToast();

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
      section: 'social',
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        section: post.section,
      });
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

  const onSubmit = (data: InsertPost) => {
    updatePostMutation.mutate(data);
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
