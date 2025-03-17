"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";

const QuestionPrompt = () => {
    // Start with an initial assistant message
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hello! I'm your AI tax consultant. How can I help you with tax-related questions?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (error) setError("");
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) {
            setError("Please enter a tax-related question!");
            return;
        }

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/gpt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question: userMessage.content }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate response.");
            }

            // Add assistant response to messages
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response || "" },
            ]);
        } catch (err) {
            console.error("Error fetching GPT response:", err);
            setError(err.message || "An error occurred. Please try again.");
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "I'm sorry, there was an error processing your request. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Optional: "Save Conversation" feature
    const saveConversation = () => {
        const conversationText = messages
            .map(
                (msg) =>
                    `${msg.role === "user" ? "You" : "Assistant"}: ${
                        msg.content
                    }`
            )
            .join("\n\n");

        const blob = new Blob([conversationText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tax-conversation-${new Date()
            .toISOString()
            .slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle>Deloitte Tax Advisory Chat</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>Error: {error}</AlertDescription>
                    </Alert>
                )}
                <ScrollArea className="h-[400px] pr-4">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    {/* Render the message with Markdown support */}
                                    <div className="prose break-words whitespace-pre-wrap">
                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                                    <p>Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <form onSubmit={handleSend} className="flex w-full gap-2">
                    <Input
                        placeholder="Ask a tax-related question..."
                        value={input}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <div className="flex justify-end w-full">
                    <Button
                        variant="outline"
                        onClick={saveConversation}
                        disabled={messages.length <= 1}
                    >
                        <Save className="h-4 w-4 mr-2" /> Save Conversation
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default QuestionPrompt;
