// User profile component
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/chat" 
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              User Profile
            </CardTitle>
            <CardDescription className="text-slate-600">
              Manage your account information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 bg-slate-50"
                />
              </div>
              <p className="text-xs text-slate-500">
                Email address cannot be changed
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Account Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">User ID</span>
                  <span className="text-sm font-mono text-slate-900">
                    {user?.userId || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Member Since</span>
                  <span className="text-sm text-slate-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
