import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUpload: (url: string) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  className?: string;
  disabled?: boolean;
  name?: string;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  onRemove,
  className,
  disabled = false,
  name = 'User',
}: AvatarUploadProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (url: string) => {
    try {
      await onUpload(url);
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    try {
      setIsRemoving(true);
      await onRemove();
      toast({
        title: 'Success',
        description: 'Profile picture removed',
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
          {currentAvatar ? (
            <AvatarImage 
              src={currentAvatar} 
              alt={name} 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="text-2xl">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          )}
        </Avatar>
        
        {currentAvatar && onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 rounded-full h-8 w-8"
            onClick={handleRemove}
            disabled={disabled || isRemoving}
          >
            {isRemoving ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.x className="h-4 w-4" />
            )}
            <span className="sr-only">Remove profile picture</span>
          </Button>
        )}
      </div>
      
      <FileUpload
        onSuccess={handleUpload}
        accept={{
          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        }}
        maxSize={2 * 1024 * 1024} // 2MB
        disabled={disabled}
        className="w-full max-w-xs"
        label="Upload new photo"
        description="JPG, PNG, or WebP up to 2MB"
      />
    </div>
  );
}
