interface ChartData {
    title: string;
    data: Array<{
        name: string;
        value: number;
    }>;
    type: "bar" | "pie" | "line";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Service for API calls to the backend
 */
const apiService = {
    /**
     * Generate chart data based on a user query
     * @param {string} query - The user's query
     * @returns {Promise<ChartData>} - The chart data
     */
    generateChartData: async (query: string): Promise<ChartData> => {
        try {
            const response = await fetch(`${API_URL}/api/generate-chart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to generate chart");
            }

            return response.json();
        } catch (error) {
            console.error("Error generating chart data:", error);
            throw error;
        }
    },
};

export default apiService;
