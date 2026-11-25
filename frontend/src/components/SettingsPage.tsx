// Settings component
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FormLayout } from '@/components/FormLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { loadSettings, applyDarkMode, type UserSettings } from '@/lib/darkMode';

export function SettingsPage() {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>(loadSettings());

  // Apply dark mode on mount and when settings change
  useEffect(() => {
    applyDarkMode(settings.darkMode);
  }, [settings.darkMode]);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('user_settings', JSON.stringify(newSettings));
    // Apply dark mode immediately when toggled
    if (key === 'darkMode') {
      applyDarkMode(value);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    applyDarkMode(settings.darkMode);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully",
    });
  };

  const handleDataExport = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User data not available",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      settings: settings,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-${user.userId}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully",
    });
  };

  return (
    <FormLayout title="Settings" back={{ to: '/chat', label: 'Back to chat' }}>
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-title font-semibold">Appearance</h2>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
            Dark mode
            <input
              type="checkbox"
              role="switch"
              checked={settings.darkMode}
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              className="h-5 w-5 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </label>
          <Button onClick={handleSaveSettings} size="lg" className="w-full">
            Save settings
          </Button>
        </section>

        <section className="space-y-3 border-t pt-6">
          <h2 className="text-title font-semibold">Privacy and security</h2>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link to="/forgot-password">Change password by email</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={handleDataExport}>
            Export my data
          </Button>
        </section>

        <section className="space-y-3 border-t pt-6">
          <h2 className="text-title font-semibold">Account</h2>
          <Button variant="outline" size="lg" className="w-full" onClick={handleLogout}>
            Log out
          </Button>
        </section>
      </div>
    </FormLayout>
  );
}
