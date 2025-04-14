"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"
import { CreditCard, Download, Trash2, Save, Mail, Smartphone, Globe, Calendar } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-500">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.smith@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" defaultValue="San Francisco, CA" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-red-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-red-600">Delete Account</h3>
                        <p className="text-sm text-gray-500">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={() => setIsDeleteAccountOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-interviews" className="text-sm">
                            Interview Invitations
                          </Label>
                        </div>
                        <Switch id="email-interviews" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-feedback" className="text-sm">
                            Interview Feedback
                          </Label>
                        </div>
                        <Switch id="email-feedback" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-messages" className="text-sm">
                            Messages from Companies
                          </Label>
                        </div>
                        <Switch id="email-messages" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-reminders" className="text-sm">
                            Interview Reminders
                          </Label>
                        </div>
                        <Switch id="email-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="email-marketing" className="text-sm">
                            Marketing & Updates
                          </Label>
                        </div>
                        <Switch id="email-marketing" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">SMS Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="sms-interviews" className="text-sm">
                            Interview Invitations
                          </Label>
                        </div>
                        <Switch id="sms-interviews" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="sms-reminders" className="text-sm">
                            Interview Reminders
                          </Label>
                        </div>
                        <Switch id="sms-reminders" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Browser Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="browser-all" className="text-sm">
                            All Notifications
                          </Label>
                        </div>
                        <Switch id="browser-all" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Calendar Integration</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="calendar-add" className="text-sm">
                            Add interviews to calendar
                          </Label>
                        </div>
                        <Switch id="calendar-add" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <Label htmlFor="calendar-reminders" className="text-sm">
                            Calendar reminders
                          </Label>
                        </div>
                        <Switch id="calendar-reminders" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Profile Visibility</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profile-companies" className="text-sm font-medium">
                            Visible to Companies
                          </Label>
                          <p className="text-xs text-gray-500">Allow companies to view your profile and resume</p>
                        </div>
                        <Switch id="profile-companies" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profile-search" className="text-sm font-medium">
                            Appear in Search Results
                          </Label>
                          <p className="text-xs text-gray-500">Allow your profile to appear in company searches</p>
                        </div>
                        <Switch id="profile-search" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Data Usage</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="data-analytics" className="text-sm font-medium">
                            Analytics
                          </Label>
                          <p className="text-xs text-gray-500">
                            Allow us to collect anonymous usage data to improve the platform
                          </p>
                        </div>
                        <Switch id="data-analytics" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="data-personalization" className="text-sm font-medium">
                            Personalization
                          </Label>
                          <p className="text-xs text-gray-500">
                            Allow us to personalize your experience based on your activity
                          </p>
                        </div>
                        <Switch id="data-personalization" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="security-2fa" className="text-sm font-medium">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Switch id="security-2fa" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="security-sessions" className="text-sm font-medium">
                            Active Sessions
                          </Label>
                          <p className="text-xs text-gray-500">Manage your active login sessions</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Data Export & Deletion</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Export Your Data</Label>
                          <p className="text-xs text-gray-500">Download a copy of all your data</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Current Plan</h3>
                        <p className="text-sm text-gray-500">Free Plan</p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Interviews per month</span>
                        <span>5</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Resume analysis</span>
                        <span>Basic</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Interview feedback</span>
                        <span>Limited</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button>Upgrade Plan</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Payment Methods</h3>
                    <div className="rounded-lg border p-4 bg-slate-50">
                      <p className="text-sm text-gray-500">No payment methods added yet.</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Billing History</h3>
                    <div className="rounded-lg border p-4 bg-slate-50">
                      <p className="text-sm text-gray-500">No billing history available.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p>Deleting your account will:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Remove all your personal information</li>
                <li>Delete all your interview recordings and results</li>
                <li>Cancel any scheduled interviews</li>
                <li>Remove your resume and profile from our system</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
              <Input
                id="confirm-delete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="border-red-300 focus-visible:ring-red-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleteConfirmation !== "DELETE"}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

