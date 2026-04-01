import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useAiChat, AiChatBodyHistoryItem } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User as UserIcon, Send, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  timestamp: Date;
};

export default function AiAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI Events Assistant. How can I help you plan, manage, or optimize your events today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const aiChatMutation = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiChatMutation.isPending]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const history: AiChatBodyHistoryItem[] = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    aiChatMutation.mutate(
      { data: { message: text, history } },
      {
        onSuccess: (data) => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
            suggestions: data.suggestions,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        },
        onError: (err: any) => {
          toast({ title: "Failed to get response", description: err.error || "Unknown error", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Your personal co-pilot for event organization.</p>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-border shadow-sm">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                  <Avatar className="w-8 h-8 shrink-0 border">
                    {msg.role === "user" ? (
                      <>
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted rounded-tl-none border border-border/50 shadow-sm whitespace-pre-wrap leading-relaxed"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(suggestion)}
                            className="text-xs bg-background hover:bg-muted border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors text-left"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {aiChatMutation.isPending && (
                <div className="flex gap-4 max-w-[85%]">
                  <Avatar className="w-8 h-8 shrink-0 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-background shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
              className="relative flex items-center"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask the AI assistant anything..."
                className="pr-12 py-6 rounded-xl border-border bg-muted/50 focus-visible:bg-background"
                disabled={aiChatMutation.isPending}
                data-testid="input-chat"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-2 h-8 w-8 rounded-lg"
                disabled={!inputValue.trim() || aiChatMutation.isPending}
                data-testid="button-chat-submit"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
