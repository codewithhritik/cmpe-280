"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarWithWidgets } from "@/components/sidebar-with-widgets";
import { ChartPreview } from "@/components/chart-preview";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { widgetService, sessionService, type Widget } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import apiService from "../src/services/apiService";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    jsonData?: any;
    showChart?: boolean;
    type?: "text" | "chart";
};

export function ChatInterface() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Hello! I'm your AI Copilot. I can help you with:\n" +
                "1. Questions about clinical studies and food security from our documents\n" +
                "2. General knowledge questions\n" +
                "3. Creating data visualizations and charts",
            timestamp: new Date(),
            type: "text",
        },
    ]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingWidgets, setIsLoadingWidgets] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const sessionId = sessionService.getSessionId();

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchWidgets();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchWidgets = async () => {
        setIsLoadingWidgets(true);
        try {
            const fetchedWidgets = await widgetService.getWidgets(sessionId);
            setWidgets(fetchedWidgets);
        } catch (error) {
            console.error("Error fetching widgets:", error);
            toast({
                title: "Database Not Configured",
                description:
                    "Using local storage for now. To use Supabase, create a 'widgets' table in your database.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingWidgets(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
            type: "text",
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Call API to generate response
        const processQuery = async () => {
            try {
                const response = await apiService.chat(input);

                // Create AI response message based on response type
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    timestamp: new Date(),
                    type: response.type,
                };

                if (response.type === "chart") {
                    aiMessage.content =
                        "Here's the visualization you requested:";
                    aiMessage.jsonData = response.response;
                    aiMessage.showChart = true;
                } else {
                    aiMessage.content = response.response as string;
                }

                setMessages((prev) => [...prev, aiMessage]);
            } catch (error) {
                console.error("Error processing query:", error);
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        "I apologize, but I encountered an error. Please try again.",
                    timestamp: new Date(),
                    type: "text",
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        };

        processQuery();
    };

    const addToWidgets = async (data: any) => {
        // Check if widget with same title already exists
        const widgetExists = widgets.some(
            (widget) =>
                widget.name === (data.title || `Chart ${widgets.length + 1}`)
        );

        if (widgetExists) {
            toast({
                title: "Chart already exists",
                description: "This chart is already saved to the sidebar",
                variant: "destructive",
            });
            return;
        }

        const newWidget: Omit<Widget, "created_at"> = {
            id: uuidv4(),
            session_id: sessionId,
            name: data.title || `Chart ${widgets.length + 1}`,
            type: data.type || "bar",
            data: data,
        };

        try {
            // Save to Supabase
            const savedWidget = await widgetService.createWidget(newWidget);

            // Update local state
            setWidgets((prev) => [...prev, savedWidget]);

            toast({
                title: "Chart saved",
                description: "Chart has been added to your sidebar",
            });
        } catch (error) {
            console.error("Error saving widget:", error);
            toast({
                title: "Error",
                description: "Failed to save chart. Please try again.",
                variant: "destructive",
            });
        }
    };

    const removeWidget = async (id: string) => {
        try {
            await widgetService.deleteWidget(id);
            setWidgets((prev) => prev.filter((widget) => widget.id !== id));
        } catch (error) {
            console.error("Error removing widget:", error);
            toast({
                title: "Error",
                description: "Failed to delete chart. Please try again.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const renameWidget = async (id: string, newName: string) => {
        try {
            await widgetService.updateWidget(id, { name: newName });
            setWidgets((prev) =>
                prev.map((widget) =>
                    widget.id === id ? { ...widget, name: newName } : widget
                )
            );
        } catch (error) {
            console.error("Error renaming widget:", error);
            toast({
                title: "Error",
                description: "Failed to rename chart. Please try again.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const toggleChart = (id: string) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === id
                    ? { ...message, showChart: !message.showChart }
                    : message
            )
        );
    };

    return (
        <>
            <SidebarWithWidgets
                widgets={widgets}
                onRemove={removeWidget}
                onRename={renameWidget}
                isLoading={isLoadingWidgets}
            />
            <main className="flex flex-col flex-1 h-screen overflow-hidden bg-muted/20">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex",
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] flex",
                                        message.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <Avatar className="h-8 w-8 mr-2 mt-1">
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                AI
                                            </AvatarFallback>
                                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                        </Avatar>
                                    )}

                                    <Card
                                        className={cn(
                                            "shadow-sm",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : ""
                                        )}
                                    >
                                        <CardContent
                                            className={cn(
                                                "p-4",
                                                message.jsonData ? "pb-2" : ""
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                            {message.jsonData && (
                                                <div className="mt-4">
                                                    <Card className="bg-muted/50 border-0">
                                                        <CardContent className="p-3 text-sm">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="font-medium">
                                                                    {
                                                                        message
                                                                            .jsonData
                                                                            .title
                                                                    }
                                                                </h4>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 px-2"
                                                                    onClick={() =>
                                                                        toggleChart(
                                                                            message.id
                                                                        )
                                                                    }
                                                                >
                                                                    <BarChart3 className="h-4 w-4 mr-1" />
                                                                    {message.showChart
                                                                        ? "Hide Chart"
                                                                        : "Show Chart"}
                                                                </Button>
                                                            </div>
                                                            <pre className="overflow-x-auto text-xs rounded-md bg-muted p-2">
                                                                {JSON.stringify(
                                                                    message.jsonData,
                                                                    null,
                                                                    2
                                                                )}
                                                            </pre>
                                                        </CardContent>
                                                    </Card>

                                                    {message.showChart && (
                                                        <div className="mt-4 mb-2">
                                                            <ChartPreview
                                                                data={
                                                                    message.jsonData
                                                                }
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="mt-3"
                                                                onClick={() =>
                                                                    addToWidgets(
                                                                        message.jsonData
                                                                    )
                                                                }
                                                            >
                                                                Save to Sidebar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {message.role === "user" && (
                                        <Avatar className="h-8 w-8 ml-2 mt-1">
                                            <AvatarFallback className="bg-secondary">
                                                You
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex">
                                    <Avatar className="h-8 w-8 mr-2 mt-1">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            AI
                                        </AvatarFallback>
                                    </Avatar>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                <p>Thinking...</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="border-t p-4 bg-background">
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-5xl mx-auto flex gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about clinical studies, food security, or request a data visualization..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="shrink-0"
                            disabled={isLoading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </main>
        </>
    );
}
