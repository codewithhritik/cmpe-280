import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getDashboardMetrics } from "../services/llmService";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const data = await getDashboardMetrics();
            setMetrics(data);
            setLastFetch(Date.now());
            setError(null);
        } catch (err) {
            setError("Failed to fetch metrics");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const shouldFetch =
            !lastFetch || Date.now() - lastFetch > CACHE_DURATION;
        if (shouldFetch) {
            fetchMetrics();
        }
    }, [lastFetch]);

    if (loading) {
        return <Typography>Loading dashboard data...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!metrics) {
        return <Typography>No data available</Typography>;
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Users</Typography>
                            <Typography variant="h4">
                                {metrics.totalUsers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Active Users</Typography>
                            <Typography variant="h4">
                                {metrics.activeUsers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Total Conversations
                            </Typography>
                            <Typography variant="h4">
                                {metrics.totalConversations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Avg Response Time
                            </Typography>
                            <Typography variant="h4">
                                {metrics.avgResponseTime}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Usage Trends */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Daily Active Users
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={metrics.dailyActiveUsers}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Conversation Volume
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={metrics.conversationVolume}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#82ca9d"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* User Engagement */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Average Session Duration
                            </Typography>
                            <Typography variant="h4">
                                {metrics.avgSessionDuration} minutes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Response Rate</Typography>
                            <Typography variant="h4">
                                {metrics.responseRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Performance Metrics */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Average Latency
                            </Typography>
                            <Typography variant="h4">
                                {metrics.avgLatency}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Error Rate</Typography>
                            <Typography variant="h4">
                                {metrics.errorRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;
