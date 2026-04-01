import { Layout } from "@/components/layout";
import { 
  useGetEvent, 
  useUpdateEvent, 
  useDeleteEvent, 
  useRsvpToEvent, 
  getGetEventQueryKey, 
  useListCategories,
  getListEventsQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Calendar, MapPin, Users, Edit2, Trash2, Check, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EventDetail() {
  const [match, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading: isLoadingEvent, error } = useGetEvent(eventId, {
    query: {
      enabled: !!eventId,
      queryKey: getGetEventQueryKey(eventId)
    }
  });

  const { data: categories } = useListCategories();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const rsvpEvent = useRsvpToEvent();

  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<any>("draft");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setCategory(event.category);
      setLocationStr(event.location || "");
      setStartDate(event.startDate ? event.startDate.slice(0, 16) : "");
      setEndDate(event.endDate ? event.endDate.slice(0, 16) : "");
      setStatus(event.status);
      setMaxAttendees(event.maxAttendees ? event.maxAttendees.toString() : "");
      setImageUrl(event.imageUrl || "");
      setTags(event.tags || []);
    }
  }, [event, isEditing]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent.mutate(
      {
        id: eventId,
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
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetEventQueryKey(eventId), updated);
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Event updated successfully" });
          setIsEditing(false);
        },
        onError: (err) => {
          toast({ title: "Error updating event", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteEvent.mutate(
      { id: eventId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Event deleted" });
          setLocation("/events");
        },
        onError: (err) => {
          toast({ title: "Error deleting event", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleRSVP = () => {
    rsvpEvent.mutate(
      { id: eventId },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetEventQueryKey(eventId), updated);
          toast({ title: "RSVP successful!" });
        },
        onError: (err) => {
          toast({ title: "Error with RSVP", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleStatusChange = (newStatus: "draft" | "published" | "cancelled" | "completed") => {
    updateEvent.mutate(
      {
        id: eventId,
        data: { status: newStatus }
      },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetEventQueryKey(eventId), updated);
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          toast({ title: `Event marked as ${newStatus}` });
        },
        onError: (err) => {
          toast({ title: "Error updating status", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  if (isLoadingEvent) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">The event you are looking for does not exist or has been deleted.</p>
          <Button onClick={() => setLocation("/events")}>Back to Events</Button>
        </div>
      </Layout>
    );
  }

  const isFull = event.maxAttendees !== null && event.attendeeCount >= event.maxAttendees;

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation("/events")} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Badge variant={event.status === 'published' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-sm">
              {event.status}
            </Badge>
            <Badge variant="outline" className="bg-background text-sm">
              {event.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {event.status === 'draft' && (
              <Button variant="outline" onClick={() => handleStatusChange('published')} data-testid="button-publish-event">
                <Check className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
            {event.status === 'published' && (
              <Button variant="outline" onClick={() => handleStatusChange('completed')} data-testid="button-complete-event">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Completed
              </Button>
            )}
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusChange('cancelled')} data-testid="button-cancel-event">
                <X className="w-4 h-4 mr-2" />
                Cancel Event
              </Button>
            )}
            
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="secondary" data-testid="button-edit-event">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
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
                    <Input id="location" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date & Time *</Label>
                      <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date & Time *</Label>
                      <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <Input id="maxAttendees" type="number" min="1" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add a tag..."
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

                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" disabled={updateEvent.isPending} data-testid="button-save-event">
                      {updateEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" data-testid="button-delete-event">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the event "{event.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
                    {deleteEvent.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4" data-testid="text-event-title">{event.title}</h1>
              {event.imageUrl && (
                <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6 bg-muted">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">#{tag}</Badge>
                ))}
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">About this event</h3>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed" data-testid="text-event-description">
                  {event.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Date & Time</h4>
                    <p className="text-muted-foreground text-sm mt-1">{formatDateTime(event.startDate)}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">to {formatDateTime(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Location</h4>
                    <p className="text-muted-foreground text-sm mt-1">{event.location || "TBD"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Attendees</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      <span className="font-medium text-foreground" data-testid="text-event-attendees">{event.attendeeCount}</span>
                      {event.maxAttendees ? ` / ${event.maxAttendees} capacity` : ' attending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-lg">Join this event</h3>
                  <p className="text-sm text-muted-foreground">Reserve your spot before it fills up.</p>
                  
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleRSVP} 
                    disabled={rsvpEvent.isPending || isFull || event.status !== 'published'}
                    data-testid="button-rsvp"
                  >
                    {rsvpEvent.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {event.status !== 'published' 
                      ? 'Not open for RSVP' 
                      : isFull 
                        ? 'Event Full' 
                        : 'RSVP Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
