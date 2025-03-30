const API_BASE_URL = "http://localhost:8000/api";

/**
 * Service for API calls to the backend
 */
class ApiService {
    async chat(query) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error calling API:", error);
            throw error;
        }
    }
}

export default new ApiService();
