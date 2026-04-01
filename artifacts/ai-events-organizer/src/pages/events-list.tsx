import { Layout } from "@/components/layout";
import { useListEvents, useListCategories } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Users, MapPin, Plus, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const statusStyle: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  draft:     "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function EventsList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: events, isLoading } = useListEvents({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
  });

  const { data: categories } = useListCategories();

  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "Loading…" : `${events?.length ?? 0} event${events?.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link href="/events/new">
            <Button data-testid="button-create-event" size="sm" className="gap-1.5 h-9 font-semibold shadow-sm">
              <Plus className="w-3.5 h-3.5" /> New Event
            </Button>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search events…"
              className="pl-9 h-9 text-sm bg-muted/30 border-border/60 focus:bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-events"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 text-sm w-full sm:w-44 bg-muted/30 border-border/60" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 text-sm w-full sm:w-40 bg-muted/30 border-border/60" data-testid="select-status-filter">
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
        <div className="space-y-2.5">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))
          ) : events?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-muted/10">
              <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold mb-1">No events found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {search || category !== "all" || status !== "all"
                  ? "Try adjusting your filters to see more events."
                  : "Create your first event to get started."}
              </p>
              {!search && category === "all" && status === "all" && (
                <Link href="/events/new" className="mt-5">
                  <Button size="sm" className="gap-1.5 h-8 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Create event
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            events?.map((event) => {
              const d = new Date(event.startDate);
              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                    data-testid={`card-event-${event.id}`}
                  >
                    {/* Date pill */}
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border border-border/60" style={{ background: "hsl(var(--primary)/0.07)" }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary/80 leading-none">
                        {d.toLocaleString("default", { month: "short" })}
                      </span>
                      <span className="text-[18px] font-black text-primary leading-tight">
                        {d.getDate()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {event.title}
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.startDate)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 max-w-[180px] truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendeeCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusStyle[event.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {event.status}
                      </span>
                      {event.category && (
                        <span className="text-[11px] text-muted-foreground/70 px-2 py-0.5 rounded-full border border-border/40 bg-muted/30">
                          {event.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
