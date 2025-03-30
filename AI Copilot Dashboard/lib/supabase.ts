import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Type definitions for our database tables
export type Widget = {
    id: string;
    session_id: string;
    name: string;
    type: "bar" | "pie" | "line";
    data: any;
    created_at?: string;
};

// Add this type at the top of the file, after the Widget type
export type LocalStorageWidget = Omit<Widget, "session_id"> & {
    created_at: string;
};

// Widget CRUD operations
// Replace the widgetService object with this updated version
export const widgetService = {
    // Get all widgets for a session
    async getWidgets(sessionId: string): Promise<Widget[]> {
        try {
            const { data, error } = await supabase
                .from("widgets")
                .select("*")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: false });

            if (error) {
                // Check if the error is about missing table
                if (error.message.includes("does not exist")) {
                    console.warn(
                        "Widgets table does not exist. Using local storage fallback."
                    );
                    return this.getLocalWidgets(sessionId);
                }
                console.error("Error fetching widgets:", error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error("Failed to get widgets:", error);
            // Fallback to local storage
            return this.getLocalWidgets(sessionId);
        }
    },

    // Create a new widget
    async createWidget(widget: Omit<Widget, "created_at">): Promise<Widget> {
        try {
            const { data, error } = await supabase
                .from("widgets")
                .insert([widget])
                .select()
                .single();

            if (error) {
                // Check if the error is about missing table
                if (error.message.includes("does not exist")) {
                    console.warn(
                        "Widgets table does not exist. Using local storage fallback."
                    );
                    return this.createLocalWidget(widget);
                }
                console.error("Error creating widget:", error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Failed to create widget:", error);
            // Fallback to local storage
            return this.createLocalWidget(widget);
        }
    },

    // Update an existing widget
    async updateWidget(id: string, updates: Partial<Widget>): Promise<Widget> {
        try {
            const { data, error } = await supabase
                .from("widgets")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) {
                // Check if the error is about missing table
                if (error.message.includes("does not exist")) {
                    console.warn(
                        "Widgets table does not exist. Using local storage fallback."
                    );
                    return this.updateLocalWidget(id, updates);
                }
                console.error("Error updating widget:", error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Failed to update widget:", error);
            // Fallback to local storage
            return this.updateLocalWidget(id, updates);
        }
    },

    // Delete a widget
    async deleteWidget(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from("widgets")
                .delete()
                .eq("id", id);

            if (error) {
                // Check if the error is about missing table
                if (error.message.includes("does not exist")) {
                    console.warn(
                        "Widgets table does not exist. Using local storage fallback."
                    );
                    return this.deleteLocalWidget(id);
                }
                console.error("Error deleting widget:", error);
                throw error;
            }
        } catch (error) {
            console.error("Failed to delete widget:", error);
            // Fallback to local storage
            return this.deleteLocalWidget(id);
        }
    },

    // Local storage fallback methods
    getLocalWidgets(sessionId: string): Widget[] {
        try {
            const storedWidgets = localStorage.getItem(`widgets_${sessionId}`);
            if (!storedWidgets) return [];

            const widgets = JSON.parse(storedWidgets) as LocalStorageWidget[];
            return widgets.map((widget) => ({
                ...widget,
                session_id: sessionId,
            }));
        } catch (error) {
            console.error("Error reading from local storage:", error);
            return [];
        }
    },

    createLocalWidget(widget: Omit<Widget, "created_at">): Widget {
        try {
            const newWidget: Widget = {
                ...widget,
                created_at: new Date().toISOString(),
            };

            const existingWidgets = this.getLocalWidgets(widget.session_id);
            const updatedWidgets = [newWidget, ...existingWidgets];

            // Store without session_id to avoid duplication
            const storageWidgets: LocalStorageWidget[] = updatedWidgets.map(
                (w) => ({
                    id: w.id,
                    name: w.name,
                    type: w.type,
                    data: w.data,
                    created_at: w.created_at || new Date().toISOString(),
                })
            );

            localStorage.setItem(
                `widgets_${widget.session_id}`,
                JSON.stringify(storageWidgets)
            );
            return newWidget;
        } catch (error) {
            console.error("Error saving to local storage:", error);
            throw error;
        }
    },

    updateLocalWidget(id: string, updates: Partial<Widget>): Widget {
        try {
            // We need to determine the session_id from existing widgets
            const sessionId = this.findSessionIdForWidget(id);
            if (!sessionId) throw new Error("Widget not found");

            const existingWidgets = this.getLocalWidgets(sessionId);
            const widgetIndex = existingWidgets.findIndex((w) => w.id === id);

            if (widgetIndex === -1) throw new Error("Widget not found");

            const updatedWidget = {
                ...existingWidgets[widgetIndex],
                ...updates,
            };

            existingWidgets[widgetIndex] = updatedWidget;

            // Store without session_id to avoid duplication
            const storageWidgets: LocalStorageWidget[] = existingWidgets.map(
                (w) => ({
                    id: w.id,
                    name: w.name,
                    type: w.type,
                    data: w.data,
                    created_at: w.created_at || new Date().toISOString(),
                })
            );

            localStorage.setItem(
                `widgets_${sessionId}`,
                JSON.stringify(storageWidgets)
            );
            return updatedWidget;
        } catch (error) {
            console.error("Error updating in local storage:", error);
            throw error;
        }
    },

    deleteLocalWidget(id: string): void {
        try {
            // We need to determine the session_id from existing widgets
            const sessionId = this.findSessionIdForWidget(id);
            if (!sessionId) return;

            const existingWidgets = this.getLocalWidgets(sessionId);
            const filteredWidgets = existingWidgets.filter((w) => w.id !== id);

            // Store without session_id to avoid duplication
            const storageWidgets: LocalStorageWidget[] = filteredWidgets.map(
                (w) => ({
                    id: w.id,
                    name: w.name,
                    type: w.type,
                    data: w.data,
                    created_at: w.created_at || new Date().toISOString(),
                })
            );

            localStorage.setItem(
                `widgets_${sessionId}`,
                JSON.stringify(storageWidgets)
            );
        } catch (error) {
            console.error("Error deleting from local storage:", error);
            throw error;
        }
    },

    findSessionIdForWidget(widgetId: string): string | null {
        try {
            // Check if we have a current session
            const currentSessionId = sessionService.getSessionId();
            const currentSessionWidgets =
                this.getLocalWidgets(currentSessionId);

            if (currentSessionWidgets.some((w) => w.id === widgetId)) {
                return currentSessionId;
            }

            // If not found in current session, we'd need to search all sessions
            // This is a simplified approach - in a real app, you might want to track all sessions
            return currentSessionId;
        } catch (error) {
            console.error("Error finding session for widget:", error);
            return null;
        }
    },
};

// Session management
export const sessionService = {
    // Get or create a session ID
    getSessionId(): string {
        // Check if we're on the client side
        if (typeof window === "undefined") {
            return crypto.randomUUID(); // Return a temporary ID for SSR
        }

        let sessionId = localStorage.getItem("session_id");

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("session_id", sessionId);
        }

        return sessionId;
    },
};

// Authentication service
export const authService = {
    async signUp(email: string, password: string): Promise<any> {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }

        return data;
    },

    async signIn(email: string, password: string): Promise<any> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }

        return data;
    },

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }
    },

    async getCurrentUser(): Promise<any> {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user;
    },
};
