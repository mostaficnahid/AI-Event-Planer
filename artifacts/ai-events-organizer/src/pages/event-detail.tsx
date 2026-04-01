import { Layout } from "@/components/layout";
import { 
  useGetEvent, 
  useUpdateEvent, 
  useDeleteEvent, 
  useRsvpToEvent, 
  getGetEventQueryKey, 
  useListCategories,
  getListEventsQueryKey,
  getGetDashboardSummaryQueryKey,
  useListGuests,
  getListGuestsQueryKey,
  useAddGuest,
  useUpdateGuest,
  useRemoveGuest,
  useEstimateBudget,
  useSuggestThemes
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Calendar, MapPin, Users, Edit2, Trash2, Check, X, CheckCircle2, DollarSign, Sparkles, UserPlus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const CURRENCIES = [
  { code: "USD", symbol: "$",    name: "US Dollar",          flag: "🇺🇸" },
  { code: "EUR", symbol: "€",    name: "Euro",               flag: "🇪🇺" },
  { code: "GBP", symbol: "£",    name: "British Pound",      flag: "🇬🇧" },
  { code: "INR", symbol: "₹",    name: "Indian Rupee",       flag: "🇮🇳" },
  { code: "BDT", symbol: "৳",    name: "Bangladeshi Taka",   flag: "🇧🇩" },
  { code: "PKR", symbol: "₨",    name: "Pakistani Rupee",    flag: "🇵🇰" },
  { code: "AED", symbol: "د.إ",  name: "UAE Dirham",         flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼",    name: "Saudi Riyal",        flag: "🇸🇦" },
  { code: "QAR", symbol: "ر.ق",  name: "Qatari Riyal",       flag: "🇶🇦" },
  { code: "KWD", symbol: "د.ك",  name: "Kuwaiti Dinar",      flag: "🇰🇼" },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar",     flag: "🇧🇭" },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial",         flag: "🇴🇲" },
  { code: "JPY", symbol: "¥",    name: "Japanese Yen",       flag: "🇯🇵" },
  { code: "CNY", symbol: "¥",    name: "Chinese Yuan",       flag: "🇨🇳" },
  { code: "KRW", symbol: "₩",    name: "South Korean Won",   flag: "🇰🇷" },
  { code: "SGD", symbol: "S$",   name: "Singapore Dollar",   flag: "🇸🇬" },
  { code: "MYR", symbol: "RM",   name: "Malaysian Ringgit",  flag: "🇲🇾" },
  { code: "THB", symbol: "฿",    name: "Thai Baht",          flag: "🇹🇭" },
  { code: "IDR", symbol: "Rp",   name: "Indonesian Rupiah",  flag: "🇮🇩" },
  { code: "PHP", symbol: "₱",    name: "Philippine Peso",    flag: "🇵🇭" },
  { code: "VND", symbol: "₫",    name: "Vietnamese Dong",    flag: "🇻🇳" },
  { code: "TWD", symbol: "NT$",  name: "Taiwan Dollar",      flag: "🇹🇼" },
  { code: "HKD", symbol: "HK$",  name: "Hong Kong Dollar",   flag: "🇭🇰" },
  { code: "AUD", symbol: "A$",   name: "Australian Dollar",  flag: "🇦🇺" },
  { code: "NZD", symbol: "NZ$",  name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "CAD", symbol: "CA$",  name: "Canadian Dollar",    flag: "🇨🇦" },
  { code: "MXN", symbol: "MX$",  name: "Mexican Peso",       flag: "🇲🇽" },
  { code: "BRL", symbol: "R$",   name: "Brazilian Real",     flag: "🇧🇷" },
  { code: "ARS", symbol: "$",    name: "Argentine Peso",     flag: "🇦🇷" },
  { code: "CLP", symbol: "$",    name: "Chilean Peso",       flag: "🇨🇱" },
  { code: "COP", symbol: "$",    name: "Colombian Peso",     flag: "🇨🇴" },
  { code: "PEN", symbol: "S/.",  name: "Peruvian Sol",       flag: "🇵🇪" },
  { code: "NGN", symbol: "₦",    name: "Nigerian Naira",     flag: "🇳🇬" },
  { code: "ZAR", symbol: "R",    name: "South African Rand", flag: "🇿🇦" },
  { code: "KES", symbol: "KSh",  name: "Kenyan Shilling",    flag: "🇰🇪" },
  { code: "GHS", symbol: "₵",    name: "Ghanaian Cedi",      flag: "🇬🇭" },
  { code: "EGP", symbol: "E£",   name: "Egyptian Pound",     flag: "🇪🇬" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham",    flag: "🇲🇦" },
  { code: "TZS", symbol: "TSh",  name: "Tanzanian Shilling", flag: "🇹🇿" },
  { code: "TRY", symbol: "₺",    name: "Turkish Lira",       flag: "🇹🇷" },
  { code: "CHF", symbol: "CHF",  name: "Swiss Franc",        flag: "🇨🇭" },
  { code: "SEK", symbol: "kr",   name: "Swedish Krona",      flag: "🇸🇪" },
  { code: "NOK", symbol: "kr",   name: "Norwegian Krone",    flag: "🇳🇴" },
  { code: "DKK", symbol: "kr",   name: "Danish Krone",       flag: "🇩🇰" },
  { code: "PLN", symbol: "zł",   name: "Polish Złoty",       flag: "🇵🇱" },
  { code: "CZK", symbol: "Kč",   name: "Czech Koruna",       flag: "🇨🇿" },
  { code: "HUF", symbol: "Ft",   name: "Hungarian Forint",   flag: "🇭🇺" },
  { code: "RON", symbol: "lei",  name: "Romanian Leu",       flag: "🇷🇴" },
  { code: "UAH", symbol: "₴",    name: "Ukrainian Hryvnia",  flag: "🇺🇦" },
  { code: "RUB", symbol: "₽",    name: "Russian Ruble",      flag: "🇷🇺" },
  { code: "ILS", symbol: "₪",    name: "Israeli Shekel",     flag: "🇮🇱" },
  { code: "LKR", symbol: "Rs",   name: "Sri Lankan Rupee",   flag: "🇱🇰" },
  { code: "NPR", symbol: "Rs",   name: "Nepalese Rupee",     flag: "🇳🇵" },
  { code: "MMK", symbol: "K",    name: "Myanmar Kyat",       flag: "🇲🇲" },
  { code: "KHR", symbol: "៛",    name: "Cambodian Riel",     flag: "🇰🇭" },
  { code: "MNT", symbol: "₮",    name: "Mongolian Tögrög",   flag: "🇲🇳" },
  { code: "XOF", symbol: "CFA",  name: "West African CFA",   flag: "🌍" },
  { code: "XAF", symbol: "CFA",  name: "Central African CFA",flag: "🌍" },
];

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

  const { data: guests, isLoading: isLoadingGuests } = useListGuests(eventId, {
    query: {
      enabled: !!eventId,
      queryKey: getListGuestsQueryKey(eventId)
    }
  });

  const { data: categories } = useListCategories();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const rsvpEvent = useRsvpToEvent();
  
  const addGuest = useAddGuest();
  const updateGuest = useUpdateGuest();
  const removeGuest = useRemoveGuest();
  const estimateBudget = useEstimateBudget();
  const suggestThemes = useSuggestThemes();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isThemesModalOpen, setIsThemesModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [currencySearch, setCurrencySearch] = useState("");

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
  const [budget, setBudget] = useState("");
  const [budgetUsed, setBudgetUsed] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Guest form
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

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
      setBudget(event.budget ? event.budget.toString() : "");
      setBudgetUsed(event.budgetUsed ? event.budgetUsed.toString() : "");
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
          budget: budget ? parseFloat(budget) : null,
          budgetUsed: budgetUsed ? parseFloat(budgetUsed) : null,
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
          queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
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

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;
    addGuest.mutate(
      { eventId, data: { name: guestName, email: guestEmail } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
          toast({ title: "Guest added successfully" });
          setGuestName("");
          setGuestEmail("");
          setIsAddingGuest(false);
        },
        onError: (err) => {
          toast({ title: "Error adding guest", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleEstimateBudget = () => {
    estimateBudget.mutate(
      { data: { 
        title: event?.title || "", 
        category: event?.category || "", 
        location: event?.location || "Unknown",
        attendeeCount: event?.maxAttendees || 50,
        durationHours: 4,
        currency: selectedCurrency,
      } },
      {
        onSuccess: () => {
          toast({ title: "Budget estimation complete" });
        },
        onError: (err) => {
          toast({ title: "Estimation failed", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  const handleSuggestThemes = () => {
    suggestThemes.mutate(
      { data: { 
        title: event?.title || "", 
        category: event?.category || "", 
        description: event?.description || ""
      } },
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

  if (isLoadingEvent) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
  const budgetProgress = event.budget && event.budget > 0 ? ((event.budgetUsed || 0) / event.budget) * 100 : 0;
  const isOverBudget = event.budget && event.budgetUsed && event.budgetUsed > event.budget;

  return (
    <Layout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation("/events")} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Badge variant={event.status === 'published' ? 'default' : event.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-sm px-3 py-1 shadow-sm">
              {event.status}
            </Badge>
            <Badge variant="outline" className="bg-background text-sm px-3 py-1 border-border">
              {event.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isBudgetModalOpen} onOpenChange={(open) => { setIsBudgetModalOpen(open); if (!open) { estimateBudget.reset?.(); setCurrencySearch(""); } }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-emerald-500 border-border hover:bg-emerald-500/10" data-testid="button-estimate-budget">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Estimate Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    AI Budget Estimation
                  </DialogTitle>
                </DialogHeader>

                {/* ── Currency picker (shown before result) ── */}
                {!estimateBudget.data && !estimateBudget.isPending && (
                  <div className="space-y-4 py-2">
                    <div>
                      <p className="text-sm font-semibold mb-1">Select currency</p>
                      <p className="text-xs text-muted-foreground mb-3">The AI will estimate costs in local market rates for the chosen currency.</p>
                      <Input
                        placeholder="Search currency (e.g. BDT, Euro, Rupee…)"
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="mb-3"
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                        {CURRENCIES.filter(c =>
                          !currencySearch ||
                          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                          c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                          c.symbol.includes(currencySearch)
                        ).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setSelectedCurrency(c.code)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
                              selectedCurrency === c.code
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                                : "border-border bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5"
                            }`}
                          >
                            <span className="text-base">{c.flag}</span>
                            <span className="font-bold text-xs">{c.code}</span>
                            <span className="text-muted-foreground text-xs truncate">{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected currency chip */}
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                      <span className="text-lg">{CURRENCIES.find(c => c.code === selectedCurrency)?.flag}</span>
                      <div>
                        <p className="text-sm font-bold">{selectedCurrency} — {CURRENCIES.find(c => c.code === selectedCurrency)?.name}</p>
                        <p className="text-xs text-muted-foreground">Symbol: {CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}</p>
                      </div>
                      <Button size="sm" className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEstimateBudget} data-testid="button-run-budget-estimate">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Generate Estimate
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Loading state ── */}
                {estimateBudget.isPending && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-muted-foreground text-sm">Analyzing market rates in {selectedCurrency}…</p>
                  </div>
                )}

                {/* ── Results ── */}
                {estimateBudget.data && (
                  <div className="space-y-5 py-2">
                    {/* Total header */}
                    <div className="flex items-start justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Estimated Total</p>
                        <h3 className="text-3xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                          {CURRENCIES.find(c => c.code === estimateBudget.data!.currency)?.symbol ?? estimateBudget.data.currency}{" "}
                          {estimateBudget.data.totalEstimate.toLocaleString()}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span>{CURRENCIES.find(c => c.code === estimateBudget.data!.currency)?.flag}</span>
                          {estimateBudget.data.currency} — {CURRENCIES.find(c => c.code === estimateBudget.data!.currency)?.name ?? estimateBudget.data.currency}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={`bg-background capitalize ${estimateBudget.data.confidence === "high" ? "text-emerald-600 border-emerald-400" : estimateBudget.data.confidence === "medium" ? "text-amber-600 border-amber-400" : "text-red-600 border-red-400"}`}>
                          {estimateBudget.data.confidence} confidence
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => { estimateBudget.reset?.(); setCurrencySearch(""); }}>
                          Change currency
                        </Button>
                      </div>
                    </div>

                    {/* Breakdown rows */}
                    <div className="space-y-2.5">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Cost Breakdown</h4>
                      {estimateBudget.data.breakdown.map((item, idx) => (
                        <div key={idx} className="p-3 border border-border rounded-lg bg-card space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{item.category}</span>
                            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                              {CURRENCIES.find(c => c.code === estimateBudget.data!.currency)?.symbol ?? estimateBudget.data!.currency}{" "}
                              {item.amount.toLocaleString()} &nbsp;<span className="text-muted-foreground font-normal">({item.percentage}%)</span>
                            </span>
                          </div>
                          {/* mini progress bar */}
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${item.percentage}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">{item.notes}</p>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" className="w-full" onClick={handleEstimateBudget} disabled={estimateBudget.isPending}>
                      <Loader2 className={`w-3.5 h-3.5 mr-1.5 ${estimateBudget.isPending ? "animate-spin" : "hidden"}`} />
                      Re-generate estimate
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isThemesModalOpen} onOpenChange={setIsThemesModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-indigo-500 border-border hover:bg-indigo-500/10" onClick={handleSuggestThemes} data-testid="button-suggest-themes">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggest Themes
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
                      <p className="text-muted-foreground text-sm">Brainstorming creative concepts...</p>
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
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Improvements to Event</h4>
                              <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                                {theme.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Engagement Tips</h4>
                              <div className="flex flex-wrap gap-2">
                                {theme.engagementTips.map((tip, i) => (
                                  <Badge key={i} variant="secondary" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20">{tip}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>

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
              <Button variant="outline" className="text-destructive border-border hover:bg-destructive/10" onClick={() => handleStatusChange('cancelled')} data-testid="button-cancel-event">
                <X className="w-4 h-4 mr-2" />
                Cancel
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
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
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
                      <Label htmlFor="budget">Total Budget ($)</Label>
                      <Input id="budget" type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetUsed">Budget Used ($)</Label>
                      <Input id="budgetUsed" type="number" min="0" step="0.01" value={budgetUsed} onChange={(e) => setBudgetUsed(e.target.value)} />
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
                <Button variant="destructive" size="icon" className="shadow-sm" data-testid="button-delete-event">
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
              <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight" data-testid="text-event-title">{event.title}</h1>
              {event.imageUrl && (
                <div className="w-full h-64 md:h-[400px] rounded-2xl overflow-hidden mb-6 bg-muted shadow-md border border-border">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 bg-muted">#{tag}</Badge>
                ))}
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                  <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Overview</TabsTrigger>
                  <TabsTrigger value="guests" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Guest List</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:text-foreground">
                    <h3 className="text-xl font-semibold mb-3">About this event</h3>
                    <p className="whitespace-pre-wrap" data-testid="text-event-description">
                      {event.description || "No description provided."}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="guests" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Attendees</h3>
                    <Dialog open={isAddingGuest} onOpenChange={setIsAddingGuest}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          Add Guest
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Guest</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddGuest} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="guestName">Name</Label>
                            <Input id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guestEmail">Email</Label>
                            <Input id="guestEmail" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddingGuest(false)}>Cancel</Button>
                            <Button type="submit" disabled={addGuest.isPending}>
                              {addGuest.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Add Guest
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {isLoadingGuests ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                    </div>
                  ) : guests?.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-lg bg-card">
                      <Users className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-muted-foreground">No guests have RSVP'd yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {guests?.map(guest => (
                        <div key={guest.id} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors shadow-sm">
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            <p className="text-sm text-muted-foreground">{guest.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select 
                              value={guest.rsvpStatus} 
                              onValueChange={(val: any) => {
                                updateGuest.mutate({ eventId, guestId: guest.id, data: { rsvpStatus: val } }, {
                                  onSuccess: () => {
                                    queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
                                    toast({ title: "RSVP updated" });
                                  }
                                });
                              }}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                                <SelectItem value="maybe">Maybe</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if (confirm("Remove this guest?")) {
                                  removeGuest.mutate({ eventId, guestId: guest.id }, {
                                    onSuccess: () => {
                                      queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
                                      toast({ title: "Guest removed" });
                                    }
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-border">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Date & Time</h4>
                    <p className="text-muted-foreground text-sm mt-1">{formatDateTime(event.startDate)}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground/80 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>to {formatDateTime(event.endDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Location</h4>
                    <p className="text-muted-foreground text-sm mt-1">{event.location || "TBD"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-sm">Capacity</h4>
                      <span className="text-xs font-medium text-muted-foreground">{event.attendeeCount} / {event.maxAttendees || '∞'}</span>
                    </div>
                    {event.maxAttendees ? (
                      <Progress value={(event.attendeeCount / event.maxAttendees) * 100} className="h-1.5 mt-2" />
                    ) : null}
                  </div>
                </div>

                {event.budget !== null && (
                  <div className="flex gap-4 pt-2 border-t border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-semibold text-sm">Budget</h4>
                        <span className={cn("text-xs font-medium", isOverBudget ? "text-destructive" : "text-muted-foreground")}>
                          ${event.budgetUsed?.toLocaleString() || 0} / ${event.budget.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={budgetProgress} 
                        className="h-1.5 mt-2" 
                        indicatorClassName={isOverBudget ? "bg-destructive" : ""} 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-lg">Join this event</h3>
                  <p className="text-sm text-muted-foreground">Reserve your spot before it fills up.</p>
                  
                  <Button 
                    className="w-full shadow-md" 
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
