import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    try {
        const { question } = await req.json();

        if (!question) {
            return NextResponse.json(
                { error: "Tax prompt required!" },
                { status: 400 }
            );
        }

        const client = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.AZURE_OPENAI_KEY,
        });

        const response = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a tax advisory assistant specialized in US tax law. 
Your purpose is to provide helpful information about tax-related topics only.

Guidelines:
1. Only answer questions related to US tax law, deductions, credits, filing procedures, and general tax advice.
2. Provide factual information based on current tax laws and regulations.
3. If a question is not related to taxes, politely redirect the conversation to tax topics.
4. Do not provide specific financial advice that would require a licensed professional.
5. Make it clear when information might be subject to change or requires verification with a tax professional.
6. Do not discuss illegal tax evasion strategies.

Always maintain a professional, helpful tone.`,
                },
                { role: "user", content: question },
            ],
            model: "gpt-4o",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9,
        });

        return NextResponse.json({
            response: response.choices[0].message.content,
        });
    } catch (error) {
        console.error("Azure OpenAI API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch GPT response" },
            { status: 500 }
        );
    }
}
