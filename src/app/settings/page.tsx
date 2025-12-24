'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedPage, FadeIn } from '@/components/animated-page';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Lock, Bell, User, Palette, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [changing, setChanging] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChanging(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Password changed successfully!');
    setChanging(false);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <FadeIn>
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-6 w-6" />
                  Settings
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>Update your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="Enter username" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="current">Current Password</Label>
                        <Input id="current" type="password" required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="new">New Password</Label>
                        <Input id="new" type="password" required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="confirm">Confirm New Password</Label>
                        <Input id="confirm" type="password" required className="mt-2" />
                      </div>
                      <Button type="submit" disabled={changing} className="w-full">
                        {changing ? 'Changing...' : 'Change Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose what notifications you receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive push notifications on your device</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-gray-400">Receive emails about new features and updates</p>
                      </div>
                      <Switch checked={marketing} onCheckedChange={setMarketing} />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <Label>Email Preferences</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="comments" defaultChecked />
                          <Label htmlFor="comments" className="font-normal cursor-pointer">
                            Comments on your posts
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mentions" defaultChecked />
                          <Label htmlFor="mentions" className="font-normal cursor-pointer">
                            When someone mentions you
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="followers" />
                          <Label htmlFor="followers" className="font-normal cursor-pointer">
                            New followers
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => toast.success('Preferences saved!')}>
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5" />
                      Appearance
                    </CardTitle>
                    <CardDescription>Customize how the app looks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select defaultValue="dark">
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark (Current)</SelectItem>
                          <SelectItem value="auto">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="font">Font Size</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Apply Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
      </div>
    </AnimatedPage>
  );
}
