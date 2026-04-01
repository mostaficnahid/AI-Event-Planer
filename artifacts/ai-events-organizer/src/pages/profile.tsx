import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading } = useGetMe();
  const updateMe = useUpdateMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMe.mutate(
      { data: { name, avatarUrl: avatarUrl || null } },
      {
        onSuccess: (updatedUser) => {
          queryClient.setQueryData(getGetMeQueryKey(), updatedUser);
          updateUser(updatedUser);
          toast({ title: "Profile updated successfully" });
        },
        onError: (err: any) => {
          toast({ title: "Failed to update profile", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Update your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border-2 border-border">
                  <AvatarImage src={avatarUrl || ""} alt={name} />
                  <AvatarFallback className="text-2xl">{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium">Avatar URL</h3>
                  <p className="text-sm text-muted-foreground">Provide a link to an image.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar Image URL</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  data-testid="input-profile-avatar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-profile-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={user?.role || ""}
                  disabled
                  readOnly
                  className="bg-muted text-muted-foreground capitalize"
                />
              </div>

              <Button type="submit" disabled={updateMe.isPending} data-testid="button-profile-save">
                {updateMe.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
