import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
    try {
        const { question } = await req.json();

        if (!question) {
            return NextResponse.json(
                { error: "Data query prompt required!" },
                { status: 400 }
            );
        }

        const client = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: process.env.AZURE_OPENAI_KEY,
        });

        // Check if this is a data visualization request
        const isDataVisualizationRequest =
            question.toLowerCase().includes("chart") ||
            question.toLowerCase().includes("graph") ||
            question.toLowerCase().includes("visualization") ||
            question.toLowerCase().includes("price") ||
            question.toLowerCase().includes("data");

        // Define the system prompt based on request type
        let systemPrompt;

        if (isDataVisualizationRequest) {
            systemPrompt = `You are a data analysis assistant specialized in economic data visualization.

When users ask for data or charts, you MUST respond with a JSON object that contains:
1. A "text" field with your explanation of the data
2. A "chartData" field with the properly formatted data for visualization
3. A "chartConfig" field with Google Charts configuration

For time series data requests about 'Average Price: Milk, Fresh, Whole, Fortified (Cost per Gallon/3.8 Liters) in U.S. City Average (APU0000709112)' from the FRED database:

- Use this sample data for the most recent 10 years (you can interpolate or extrapolate as needed):
[
  ["Date", "Price (USD)"],
  ["2015-01-01", 3.42],
  ["2016-01-01", 3.20],
  ["2017-01-01", 3.23],
  ["2018-01-01", 2.90],
  ["2019-01-01", 3.05],
  ["2020-01-01", 3.26],
  ["2021-01-01", 3.55],
  ["2022-01-01", 3.72],
  ["2023-01-01", 4.02],
  ["2024-01-01", 4.21],
  ["2025-01-01", 4.05]
]

Your response MUST be a valid JSON object with these exact fields:
{
  "text": "Your explanation here",
  "chartData": [...data points here...],
  "chartConfig": {
    "options": {
      "title": "Chart Title",
      "hAxis": {
        "title": "Year",
        "format": "yyyy"
      },
      "vAxis": {
        "title": "Price (USD)",
        "minValue": 2.5
      },
      "legend": {
        "position": "bottom"
      }
    }
  }
}

The chartData MUST be in the format shown above, with the first row containing column headers and subsequent rows containing the data points.`;
        } else {
            systemPrompt = `You are a helpful assistant. Provide clear and concise answers to user questions.`;
        }

        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question },
            ],
            model: "gpt-4o",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9,
            response_format: isDataVisualizationRequest
                ? { type: "json_object" }
                : undefined,
        });

        const content = response.choices[0].message.content;

        // For data visualization requests, parse the JSON
        if (isDataVisualizationRequest) {
            try {
                const jsonResponse = JSON.parse(content);
                return NextResponse.json({
                    text: jsonResponse.text,
                    chartData: jsonResponse.chartData,
                    chartConfig: jsonResponse.chartConfig,
                    isChartData: true,
                });
            } catch (error) {
                console.error("Failed to parse JSON response:", error);
                return NextResponse.json({
                    response: content,
                    isChartData: false,
                });
            }
        } else {
            // For regular requests, return the text response
            return NextResponse.json({
                response: content,
                isChartData: false,
            });
        }
    } catch (error) {
        console.error("Azure OpenAI API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch response" },
            { status: 500 }
        );
    }
}
