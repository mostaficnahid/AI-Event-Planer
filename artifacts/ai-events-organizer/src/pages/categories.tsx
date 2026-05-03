import { Layout } from "@/components/layout";
import { useListCategories, useCreateCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Folder } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesList() {
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [icon, setIcon] = useState("tag");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(
      { data: { name, color, icon } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category created" });
          setOpen(false);
          setName("");
        },
        onError: (err) => {
          toast({ title: "Error creating category", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1">Manage event categories to organize your events.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-category"><Plus className="w-4 h-4 mr-2"/> Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>Add a new category to organize your events.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="e.g. Conference, Meetup"
                    data-testid="input-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="color" 
                      type="color" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)} 
                      className="w-16 p-1 h-10 cursor-pointer"
                    />
                    <Input 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)} 
                      className="flex-1 font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon Name</Label>
                  <Input 
                    id="icon" 
                    value={icon} 
                    onChange={(e) => setIcon(e.target.value)} 
                    placeholder="lucide icon name"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={createCategory.isPending} data-testid="button-submit-category">
                    {createCategory.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : categories?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-card/50">
              <Folder className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground mt-2">Create a category to start organizing events.</p>
            </div>
          ) : (
            categories?.map((cat) => (
              <Card key={cat.id} className="overflow-hidden" data-testid={`card-category-${cat.id}`}>
                <div className="h-2 w-full" style={{ backgroundColor: cat.color }} />
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.eventCount} events</p>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center opacity-20"
                    style={{ backgroundColor: cat.color }}
                  >
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
