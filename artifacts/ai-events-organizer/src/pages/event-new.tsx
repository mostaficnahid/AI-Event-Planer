import { Layout } from "@/components/layout";
import { useCreateEvent, useListCategories, useGenerateEventDescription, useSuggestEventSchedule, useEstimateBudget, useSuggestThemes, getListEventsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, Calendar as CalendarIcon, ArrowLeft, DollarSign, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useListCategories();
  const createEvent = useCreateEvent();
  const generateDesc = useGenerateEventDescription();
  const suggestSchedule = useSuggestEventSchedule();
  const estimateBudget = useEstimateBudget();
  const suggestThemes = useSuggestThemes();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [aiContext, setAiContext] = useState("");
  const [durationHours, setDurationHours] = useState("2");
  const [preferredDay, setPreferredDay] = useState("");

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isThemesModalOpen, setIsThemesModalOpen] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleGenerateDesc = () => {
    if (!title || !category) {
      toast({ title: "Missing fields", description: "Title and Category are required for AI generation.", variant: "destructive" });
      return;
    }
    generateDesc.mutate(
      { data: { title, category, location: locationStr, additionalContext: aiContext || null } },
      {
        onSuccess: (data) => {
          setDescription(data.description);
          setTags((prev) => Array.from(new Set([...prev, ...data.tags])));
          toast({ title: "Description generated" });
        },
        onError: (err) => {
          toast({ title: "Failed to generate description", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleSuggestSchedule = () => {
    if (!title || !category || !durationHours) {
      toast({ title: "Missing fields", description: "Title, Category, and Duration are required for AI schedule suggestion.", variant: "destructive" });
      return;
    }
    suggestSchedule.mutate(
      { data: { title, category, durationHours: parseInt(durationHours, 10), preferredDayOfWeek: preferredDay || null } },
      {
        onSuccess: (data) => {
          if (data.suggestions && data.suggestions.length > 0) {
            const suggestion = data.suggestions[0];
            setStartDate(suggestion.startDate.slice(0, 16)); 
            setEndDate(suggestion.endDate.slice(0, 16));
            toast({ title: "Schedule suggested", description: suggestion.reasoning });
          }
        },
        onError: (err) => {
          toast({ title: "Failed to suggest schedule", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleEstimateBudget = () => {
    if (!title || !category) {
      toast({ title: "Missing fields", description: "Title and Category are required.", variant: "destructive" });
      return;
    }
    estimateBudget.mutate(
      { data: { 
        title, 
        category, 
        location: locationStr || "Unknown", 
        attendeeCount: maxAttendees ? parseInt(maxAttendees, 10) : 50, 
        durationHours: parseInt(durationHours, 10) || 4 
      } },
      {
        onSuccess: (data) => {
          setBudget(data.totalEstimate.toString());
          toast({ title: "Budget estimation complete" });
        },
        onError: (err) => {
          toast({ title: "Estimation failed", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleSuggestThemes = () => {
    if (!title || !category) {
      toast({ title: "Missing fields", description: "Title and Category are required.", variant: "destructive" });
      return;
    }
    suggestThemes.mutate(
      { data: { title, category, description: description || "New event" } },
      {
        onSuccess: () => {
          toast({ title: "Theme suggestions generated" });
        },
        onError: (err) => {
          toast({ title: "Theme suggestion failed", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !startDate || !endDate) {
      toast({ title: "Missing required fields", variant: "destructive" });
      return;
    }

    createEvent.mutate(
      {
        data: {
          title,
          description,
          category,
          location: locationStr,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
          maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
          imageUrl: imageUrl || null,
          budget: budget ? parseFloat(budget) : null,
          budgetUsed: 0,
          tags,
        }
      },
      {
        onSuccess: (newEvent) => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Event created successfully" });
          setLocation(`/events/${newEvent.id}`);
        },
        onError: (err) => {
          toast({ title: "Error creating event", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/events")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
            <p className="text-muted-foreground mt-1">Add a new event to your schedule.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>The core details of your event.</CardDescription>
                </div>
                
                <Dialog open={isThemesModalOpen} onOpenChange={setIsThemesModalOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="text-indigo-500 border-border hover:bg-indigo-500/10" onClick={handleSuggestThemes} disabled={!title || !category}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      AI Themes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        AI Theme Suggestions
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      {suggestThemes.isPending ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                          <p className="text-muted-foreground text-sm">Brainstorming creative concepts based on your input...</p>
                        </div>
                      ) : suggestThemes.data ? (
                        <div className="grid gap-6">
                          {suggestThemes.data.themes.map((theme, idx) => (
                            <Card key={idx} className="border-indigo-500/20 bg-indigo-500/5">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xl text-indigo-600 dark:text-indigo-400">{theme.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">{theme.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Improvements</h4>
                                  <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-foreground/80">
                                    {theme.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                                  </ul>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button type="button" variant="secondary" className="w-full" onClick={() => {
                                  setTags(prev => Array.from(new Set([...prev, theme.name])));
                                  if (!description) setDescription(theme.description);
                                  setIsThemesModalOpen(false);
                                  toast({ title: "Theme applied!" });
                                }}>
                                  Use this Theme
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-event-title" className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" data-testid="select-event-category" className="bg-muted/30">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} placeholder="e.g. Main Conference Room or Zoom Link" data-testid="input-event-location" className="bg-muted/30" />
              </div>

              <div className="space-y-4 p-5 border border-primary/20 rounded-xl bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Label className="flex items-center gap-2 text-primary font-medium text-base">
                    <Sparkles className="w-5 h-5" />
                    AI Copywriter
                  </Label>
                  <Button 
                    type="button" 
                    variant="default" 
                    size="sm" 
                    onClick={handleGenerateDesc} 
                    disabled={generateDesc.isPending || !title || !category}
                    data-testid="button-ai-generate-desc"
                    className="shadow-sm"
                  >
                    {generateDesc.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Description
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiContext" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Additional Context (Optional)</Label>
                  <Input id="aiContext" value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="e.g. Mention that lunch is provided, strict dress code..." className="bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={6}
                  data-testid="input-event-description"
                  className="bg-muted/30 resize-y"
                  placeholder="Describe your event..."
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter..."
                    data-testid="input-event-tags"
                    className="bg-muted/30"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1 bg-muted/50 border border-border/50">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">✕</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-sm h-fit">
              <CardHeader className="pb-4 border-b">
                <CardTitle>Schedule</CardTitle>
                <CardDescription>When is your event happening?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-4 p-5 border border-primary/20 rounded-xl bg-primary/5">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-primary font-medium text-base">
                      <Sparkles className="w-5 h-5" />
                      AI Schedule Optimizer
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Duration (Hrs)</Label>
                        <Input id="duration" type="number" min="1" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredDay" className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Preferred Day</Label>
                        <Select value={preferredDay} onValueChange={setPreferredDay}>
                          <SelectTrigger id="preferredDay" className="bg-background">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="default" 
                      className="w-full mt-2 shadow-sm"
                      onClick={handleSuggestSchedule}
                      disabled={suggestSchedule.isPending || !title || !category}
                      data-testid="button-ai-suggest-schedule"
                    >
                      {suggestSchedule.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
                      Find Best Time
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time <span className="text-destructive">*</span></Label>
                    <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required data-testid="input-event-start" className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time <span className="text-destructive">*</span></Label>
                    <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required data-testid="input-event-end" className="bg-muted/30" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Budget</CardTitle>
                      <CardDescription>Financial planning.</CardDescription>
                    </div>
                    <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="text-emerald-500 border-border hover:bg-emerald-500/10" onClick={handleEstimateBudget} disabled={!title || !category}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          AI Estimate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            AI Budget Estimation
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          {estimateBudget.isPending ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                              <p className="text-muted-foreground text-sm">Calculating expected costs...</p>
                            </div>
                          ) : estimateBudget.data ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <div>
                                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Estimated Total</p>
                                  <h3 className="text-3xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                                    {estimateBudget.data.currency} {estimateBudget.data.totalEstimate.toLocaleString()}
                                  </h3>
                                </div>
                                <Badge variant="outline" className="bg-background">{estimateBudget.data.confidence} Confidence</Badge>
                              </div>
                              <div className="flex justify-end">
                                <Button type="button" onClick={() => {
                                  setBudget(estimateBudget.data.totalEstimate.toString());
                                  setIsBudgetModalOpen(false);
                                  toast({ title: "Budget applied!" });
                                }}>
                                  Use this Budget
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Total Budget ($)</Label>
                    <Input id="budget" type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-muted/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Capacity and visibility settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
                      <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                        <SelectTrigger id="status" data-testid="select-event-status" className="bg-muted/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <Input id="maxAttendees" type="number" min="1" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} data-testid="input-event-capacity" placeholder="Unlimited" className="bg-muted/30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Cover Image URL</Label>
                    <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." data-testid="input-event-image" className="bg-muted/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-border pt-6 mt-4">
            <Button type="button" variant="outline" size="lg" onClick={() => setLocation("/events")}>Cancel</Button>
            <Button type="submit" size="lg" className="px-8 shadow-sm" disabled={createEvent.isPending} data-testid="button-submit-event">
              {createEvent.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
