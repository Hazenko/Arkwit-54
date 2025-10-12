import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertPostSchema, type InsertPost } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

interface CreatePostDialogProps {
  defaultSection?: string;
}

export function CreatePostDialog({ defaultSection = 'social' }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
      section: defaultSection,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      return apiRequest('POST', '/api/posts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setOpen(false);
      form.reset();
      toast({
        title: 'تم النشر',
        description: 'تم نشر منشورك بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل نشر المنشور',
      });
    },
  });

  const onSubmit = (data: InsertPost) => {
    createPostMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-post">
          <Plus className="ml-2 h-5 w-5" />
          منشور جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إنشاء منشور جديد</DialogTitle>
          <DialogDescription>شارك أفكارك مع سكان الحي</DialogDescription>
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
                      <SelectTrigger data-testid="select-section">
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
                    <Input {...field} placeholder="عنوان المنشور" data-testid="input-title" />
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
                      data-testid="input-content"
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
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createPostMutation.isPending}
                data-testid="button-submit-post"
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  'نشر'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
