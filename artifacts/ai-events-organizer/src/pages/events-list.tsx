import { Layout } from "@/components/layout";
import { useListEvents, useListCategories } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Users, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function EventsList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: events, isLoading } = useListEvents({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
  });

  const { data: categories } = useListCategories();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your events.</p>
          </div>
          <Link href="/events/new">
            <Button data-testid="button-create-event">Create Event</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-events"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger data-testid="select-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : events?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-card/50">
              <Calendar className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No events found</h3>
              <p className="text-muted-foreground max-w-sm mt-2">Try adjusting your filters or create a new event.</p>
            </div>
          ) : (
            events?.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group" data-testid={`card-event-${event.id}`}>
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                    {/* Date Block */}
                    <div className="flex-shrink-0 w-32 flex flex-col items-center justify-center p-4 rounded-md bg-muted text-center border">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-3xl font-bold mt-1">
                        {new Date(event.startDate).getDate()}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(event.startDate).getFullYear()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-background">
                          {event.category}
                        </Badge>
                        <Badge 
                          variant={event.status === 'published' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      
                      <h2 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{event.title}</h2>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span className="truncate">{formatDateTime(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{event.attendeeCount} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
