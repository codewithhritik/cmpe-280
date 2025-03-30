"use client"

import { BarChart, PieChart, LineChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts"

// Beautiful color palettes
const COLORS = {
  pie: ["#4361ee", "#3a86ff", "#4cc9f0", "#4895ef", "#560bad", "#480ca8", "#b5179e", "#f72585", "#7209b7", "#3f37c9"],
  bar: ["#4361ee", "#4895ef", "#4cc9f0", "#3a86ff", "#3f37c9"],
  line: ["#4361ee", "#4cc9f0", "#560bad", "#f72585", "#7209b7"],
}

type ChartPreviewProps = {
  data: {
    title: string
    data: any[]
    type: "bar" | "pie" | "line"
  }
}

export function ChartPreview({ data }: ChartPreviewProps) {
  const renderChart = () => {
    switch (data.type) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPieChart>
              <defs>
                {COLORS.pie.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data.data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={130}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {data.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorGradient${index % COLORS.pie.length})`}
                    stroke={COLORS.pie[index % COLORS.pie.length]}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}`, "Value"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "20px" }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4361ee" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value}`, "Value"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4361ee"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={3}
                activeDot={{ r: 8, strokeWidth: 0, fill: "#4361ee" }}
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsBarChart data={data.data} barGap={8}>
              <defs>
                {COLORS.bar.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value}`, "Value"]}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar
                dataKey="value"
                fill="url(#colorBar0)"
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-out"
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        )
    }
  }

  const getChartIcon = () => {
    switch (data.type) {
      case "pie":
        return <PieChart className="h-5 w-5 text-primary" />
      case "line":
        return <LineChart className="h-5 w-5 text-primary" />
      case "bar":
      default:
        return <BarChart className="h-5 w-5 text-primary" />
    }
  }

  return (
    <Card className="w-full border shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex items-center">
          {getChartIcon()}
          <CardTitle className="ml-2 text-lg">{data.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-6">{renderChart()}</CardContent>
    </Card>
  )
}

