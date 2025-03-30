import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.AZURE_OPENAI_KEY,
});

// Cache for storing responses
let metricsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, retries = MAX_RETRIES) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await sleep(RETRY_DELAY);
        return retryWithBackoff(fn, retries - 1);
    }
}

export async function getDashboardMetrics() {
    // Check cache first
    const now = Date.now();
    if (metricsCache && now - lastFetchTime < CACHE_DURATION) {
        return metricsCache;
    }

    try {
        const response = await retryWithBackoff(async () => {
            return await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an AI analytics assistant. Generate realistic metrics for an AI Copilot dashboard.
                        Return a JSON object with the following structure:
                        {
                            "totalUsers": number (between 1000-10000),
                            "activeUsers": number (between 500-5000),
                            "totalConversations": number (between 5000-50000),
                            "avgResponseTime": number (between 100-500),
                            "dailyActiveUsers": [
                                { "date": "YYYY-MM-DD", "count": number (between 100-1000) }
                            ] (last 7 days),
                            "conversationVolume": [
                                { "date": "YYYY-MM-DD", "count": number (between 500-5000) }
                            ] (last 7 days),
                            "avgSessionDuration": number (between 5-30),
                            "responseRate": number (between 95-100),
                            "avgLatency": number (between 50-200),
                            "errorRate": number (between 0-2)
                        }
                        Use realistic values and ensure dates are sequential for the last 7 days.`,
                    },
                    {
                        role: "user",
                        content:
                            "Generate current metrics for the AI Copilot dashboard with realistic values for the last 7 days.",
                    },
                ],
                model: "gpt-4o",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
            });
        });

        const metrics = JSON.parse(response.choices[0].message.content);

        // Validate and ensure data is in correct format
        if (!validateMetrics(metrics)) {
            throw new Error("Invalid metrics format received from LLM");
        }

        // Update cache
        metricsCache = metrics;
        lastFetchTime = now;

        return metrics;
    } catch (error) {
        console.error("Error fetching metrics from LLM:", error);
        // If we have cached data, return it even if expired
        if (metricsCache) {
            return metricsCache;
        }
        throw error;
    }
}

function validateMetrics(metrics) {
    // Basic validation of required fields and types
    const requiredFields = [
        "totalUsers",
        "activeUsers",
        "totalConversations",
        "avgResponseTime",
        "dailyActiveUsers",
        "conversationVolume",
        "avgSessionDuration",
        "responseRate",
        "avgLatency",
        "errorRate",
    ];

    // Check if all required fields exist
    if (!requiredFields.every((field) => field in metrics)) {
        return false;
    }

    // Validate arrays
    if (
        !Array.isArray(metrics.dailyActiveUsers) ||
        !Array.isArray(metrics.conversationVolume)
    ) {
        return false;
    }

    // Validate array lengths (should be 7 days)
    if (
        metrics.dailyActiveUsers.length !== 7 ||
        metrics.conversationVolume.length !== 7
    ) {
        return false;
    }

    // Validate date format and sequence
    const dates = metrics.dailyActiveUsers.map((d) => new Date(d.date));
    for (let i = 1; i < dates.length; i++) {
        if (dates[i] <= dates[i - 1]) {
            return false;
        }
    }

    return true;
}
