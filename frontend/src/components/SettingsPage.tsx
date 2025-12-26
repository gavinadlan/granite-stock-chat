// Settings component
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Shield, Palette, ArrowLeft, LogOut, Download, Trash2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
}

const STORAGE_KEY = 'user_settings';

export function SettingsPage() {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  
  // Load settings from localStorage
  const loadSettings = (): UserSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return { notifications: true, darkMode: false };
  };

  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Apply dark mode on mount and when settings change
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleSaveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully",
    });
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual password change API call
    // For now, just show success message
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    });
    
    setChangePasswordOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
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

  const handleDeleteAccount = async () => {
    // TODO: Implement actual account deletion API call
    // For now, just show confirmation and logout
    toast({
      title: "Account Deletion",
      description: "Account deletion feature will be implemented soon",
      variant: "destructive",
    });
    
    setDeleteAccountOpen(false);
    
    // Uncomment when backend is ready:
    // try {
    //   await deleteAccountAPI();
    //   await logout();
    //   navigate('/');
    //   toast({
    //     title: "Account Deleted",
    //     description: "Your account has been permanently deleted",
    //   });
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete account. Please try again.",
    //     variant: "destructive",
    //   });
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your account preferences and privacy settings</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Notifications Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Switch to dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your privacy and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleDataExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Actions</span>
                </CardTitle>
                <CardDescription>
                  Manage your account and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleLogout}
                    variant="destructive" 
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => setDeleteAccountOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button onClick={handleSaveSettings} size="lg">
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setChangePasswordOpen} />
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min. 8 characters)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogClose onOpenChange={setDeleteAccountOpen} />
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
