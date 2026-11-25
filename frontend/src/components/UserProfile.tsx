// User profile component
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FormLayout } from '@/components/FormLayout';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile(name);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setIsEditing(false);
  };

  return (
    <FormLayout title="Profile" back={{ to: '/chat', label: 'Back to chat' }}>
      <div className="space-y-5">
        <Field id="email" label="Email" type="email" value={user?.email || ''} hint="Email address cannot be changed." disabled />
        <Field id="name" label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button size="lg" onClick={handleSave} disabled={isLoading} className="flex-1">
                {isLoading ? 'Saving…' : 'Save changes'}
              </Button>
              <Button size="lg" variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
                Cancel
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={() => setIsEditing(true)} className="flex-1">
              Edit profile
            </Button>
          )}
        </div>

        <dl className="border-t pt-6">
          <dt className="text-muted-foreground">User ID</dt>
          <dd className="mt-1 font-mono text-sm [overflow-wrap:anywhere]">{user?.userId || 'N/A'}</dd>
        </dl>
      </div>
    </FormLayout>
  );
}
