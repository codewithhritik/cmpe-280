"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, BarChart2 } from "lucide-react";
import Script from "next/script";

export default function ChatInterface() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        // Add user message to chat
        const userMessage = { role: "user", content: question };
        setMessages((prev) => [...prev, userMessage]);

        // Clear input and set loading
        setQuestion("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();

            // Add assistant message to chat
            const assistantMessage = {
                role: "assistant",
                content: data.isChartData ? data.text : data.response,
                chartData: data.isChartData ? data.chartData : null,
                chartConfig: data.isChartData ? data.chartConfig : null,
                messageId: Date.now().toString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, there was an error processing your request.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const drawChart = (
        messageId: string,
        chartData: any[],
        chartConfig: any
    ) => {
        if (!googleLoaded || !chartRefs.current[messageId]) return;

        // @ts-ignore
        const google = window.google;

        if (google && google.charts) {
            google.charts.load("current", { packages: ["corechart"] });
            google.charts.setOnLoadCallback(() => {
                const data = new google.visualization.DataTable();

                // Add columns based on the first row of chartData
                chartData[0].forEach((column: string, index: number) => {
                    data.addColumn(index === 0 ? "date" : "number", column);
                });

                // Add rows, skipping the header row
                const rows = chartData.slice(1).map((row) => [
                    new Date(row[0]), // Convert date string to Date object
                    row[1], // Price value
                ]);
                data.addRows(rows);

                const chart = new google.visualization.LineChart(
                    chartRefs.current[messageId]
                );

                // Enhanced chart options
                const options = {
                    title: chartConfig.options.title,
                    titleTextStyle: {
                        fontSize: 16,
                        bold: true,
                    },
                    hAxis: {
                        title: "Year",
                        format: "yyyy",
                        gridlines: {
                            count: 10,
                            color: "#E4E4E4",
                        },
                        textStyle: {
                            fontSize: 12,
                        },
                        titleTextStyle: {
                            fontSize: 14,
                            bold: true,
                        },
                    },
                    vAxis: {
                        title: "Price (USD)",
                        format: "$#.##",
                        minValue: 2.5,
                        gridlines: {
                            count: 8,
                            color: "#E4E4E4",
                        },
                        textStyle: {
                            fontSize: 12,
                        },
                        titleTextStyle: {
                            fontSize: 14,
                            bold: true,
                        },
                    },
                    legend: {
                        position: "bottom",
                        textStyle: {
                            fontSize: 12,
                        },
                    },
                    chartArea: {
                        width: "85%",
                        height: "75%",
                        top: 50,
                        left: 60,
                        right: 20,
                        bottom: 50,
                    },
                    lineWidth: 3,
                    colors: ["#2E7D32"],
                    backgroundColor: "white",
                    animation: {
                        startup: true,
                        duration: 1000,
                        easing: "out",
                    },
                    ...chartConfig.options,
                };

                chart.draw(data, options);

                // Add window resize handler
                window.addEventListener("resize", () => {
                    chart.draw(data, options);
                });
            });
        }
    };

    const handleGoogleLoad = () => {
        setGoogleLoaded(true);
    };

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Script
                src="https://www.gstatic.com/charts/loader.js"
                onLoad={handleGoogleLoad}
                strategy="afterInteractive"
            />

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Data Visualization Chat</CardTitle>
                    <CardDescription>
                        Ask questions about milk price data and visualize the
                        results
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="h-[500px] overflow-y-auto p-4 border rounded-md">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <p>
                                    No messages yet. Start by asking a question
                                    about milk price data.
                                </p>
                                <p className="mt-2 text-sm">
                                    Try: "Show me a chart of milk prices for the
                                    last 10 years"
                                </p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 ${
                                        message.role === "user"
                                            ? "text-right"
                                            : "text-left"
                                    }`}
                                >
                                    <div
                                        className={`inline-block px-4 py-2 rounded-lg ${
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-slate-100 dark:bg-slate-800"
                                        }`}
                                    >
                                        <p>{message.content}</p>
                                    </div>

                                    {message.chartData && (
                                        <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-slate-900">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-medium">
                                                    Milk Price Data
                                                </h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        drawChart(
                                                            message.messageId,
                                                            message.chartData,
                                                            message.chartConfig
                                                        )
                                                    }
                                                >
                                                    <BarChart2 className="h-4 w-4 mr-2" />
                                                    Create Chart
                                                </Button>
                                            </div>

                                            <div className="mb-4 p-3 rounded bg-slate-50 dark:bg-slate-800 font-mono text-sm overflow-x-auto">
                                                <pre className="whitespace-pre-wrap">
                                                    {JSON.stringify(
                                                        message.chartData,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>

                                            <div
                                                ref={(el) => {
                                                    if (el)
                                                        chartRefs.current[
                                                            message.messageId
                                                        ] = el;
                                                }}
                                                className="w-full h-[400px] bg-white"
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="text-left mb-4">
                                <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                                    <p>Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask about milk price data..."
                            className="flex-1"
                            disabled={loading}
                        />
                        <Button type="submit" disabled={loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="text-sm text-muted-foreground">
                    <p>
                        Data source: FRED Economic Data, Federal Reserve Bank of
                        St. Louis
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
