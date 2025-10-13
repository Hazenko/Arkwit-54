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
import { Plus, Loader2, ImagePlus, X } from 'lucide-react';

interface CreatePostDialogProps {
  defaultSection?: string;
}

export function CreatePostDialog({ defaultSection = 'social' }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [currentMediaUrl, setCurrentMediaUrl] = useState('');
  const { toast } = useToast();

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
      section: defaultSection,
      mediaUrls: [],
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
    createPostMutation.mutate({
      ...data,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setMediaUrls([]);
          setCurrentMediaUrl('');
        }
      }}
    >
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
                  data-testid="input-media-url"
                />
                <Button
                  type="button"
                  onClick={addMediaUrl}
                  variant="outline"
                  size="icon"
                  data-testid="button-add-media"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {mediaUrls.length > 0 && (
                <div className="space-y-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg" data-testid={`media-url-${index}`}>
                      <span className="text-sm truncate flex-1">{url}</span>
                      <Button
                        type="button"
                        onClick={() => removeMediaUrl(index)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        data-testid={`button-remove-media-${index}`}
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
