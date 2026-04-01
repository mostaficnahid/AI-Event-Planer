import { Layout } from "@/components/layout";
import { useCreateEvent, useListCategories, useGenerateEventDescription, useSuggestEventSchedule, getListEventsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EventNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useListCategories();
  const createEvent = useCreateEvent();
  const generateDesc = useGenerateEventDescription();
  const suggestSchedule = useSuggestEventSchedule();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [aiContext, setAiContext] = useState("");
  const [durationHours, setDurationHours] = useState("2");
  const [preferredDay, setPreferredDay] = useState("");

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
            setStartDate(suggestion.startDate.slice(0, 16)); // Format for datetime-local
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>The core details of your event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required data-testid="input-event-title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" data-testid="select-event-category">
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
                <Input id="location" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} placeholder="e.g. Main Conference Room or Zoom Link" data-testid="input-event-location" />
              </div>

              <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-primary font-medium">
                    <Sparkles className="w-4 h-4" />
                    AI Description Generator
                  </Label>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleGenerateDesc} 
                    disabled={generateDesc.isPending || !title || !category}
                    data-testid="button-ai-generate-desc"
                  >
                    {generateDesc.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiContext" className="text-xs text-muted-foreground">Additional Context (Optional)</Label>
                  <Input id="aiContext" value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="e.g. Mention that lunch is provided..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={5}
                  data-testid="input-event-description"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    data-testid="input-event-tags"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">✕</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>When is your event happening?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Label className="flex items-center gap-2 text-primary font-medium">
                      <Sparkles className="w-4 h-4" />
                      AI Schedule Suggester
                    </Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="duration" className="text-xs text-muted-foreground">Duration (Hours)</Label>
                        <Input id="duration" type="number" min="1" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="preferredDay" className="text-xs text-muted-foreground">Preferred Day</Label>
                        <Select value={preferredDay} onValueChange={setPreferredDay}>
                          <SelectTrigger id="preferredDay">
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
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleSuggestSchedule}
                    disabled={suggestSchedule.isPending || !title || !category}
                    data-testid="button-ai-suggest-schedule"
                  >
                    {suggestSchedule.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
                    Suggest Time
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required data-testid="input-event-start" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required data-testid="input-event-end" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Capacity and visibility settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger id="status" data-testid="select-event-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                  <Input id="maxAttendees" type="number" min="1" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} data-testid="input-event-capacity" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." data-testid="input-event-image" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/events")}>Cancel</Button>
            <Button type="submit" disabled={createEvent.isPending} data-testid="button-submit-event">
              {createEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
