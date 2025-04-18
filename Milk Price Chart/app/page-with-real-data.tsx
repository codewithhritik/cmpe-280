"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMilkPriceData } from "./fetch-data"

export default function MilkPriceChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const googleLoaded = useRef(false)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMilkPriceData()
        if (data) {
          setChartData(data.chartData)
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && googleLoaded.current && chartRef.current && chartData.length > 0) {
      // @ts-ignore
      const google = window.google

      if (google && google.charts) {
        google.charts.load("current", { packages: ["corechart"] })
        google.charts.setOnLoadCallback(drawChart)
      }
    }
  }, [googleLoaded.current, chartData])

  const drawChart = () => {
    if (!chartRef.current || chartData.length === 0) return

    // @ts-ignore
    const google = window.google
    const data = new google.visualization.DataTable()
    data.addColumn("date", "Date")
    data.addColumn("number", "Price per Gallon ($)")

    // Add the actual data
    const rows = chartData.map((item) => [new Date(item.date), item.price])
    data.addRows(rows)

    const options = {
      title: "Average Price: Milk, Fresh, Whole, Fortified (Cost per Gallon)",
      subtitle: "U.S. City Average - Last 10 Years",
      width: "100%",
      height: 500,
      hAxis: {
        title: "Date",
        format: "MMM yyyy",
        gridlines: { count: 10 },
      },
      vAxis: {
        title: "Price ($)",
        format: "$#.##",
        minValue: 0,
      },
      legend: { position: "none" },
      chartArea: { width: "80%", height: "70%" },
      lineWidth: 3,
      colors: ["#4285F4"],
      trendlines: {
        0: {
          type: "linear",
          color: "#DB4437",
          lineWidth: 2,
          opacity: 0.3,
          showR2: true,
          visibleInLegend: true,
        },
      },
      animation: {
        startup: true,
        duration: 1000,
        easing: "out",
      },
    }

    const chart = new google.visualization.LineChart(chartRef.current)
    chart.draw(data, options)

    // Make chart responsive
    window.addEventListener("resize", () => {
      chart.draw(data, options)
    })
  }

  const handleGoogleLoad = () => {
    googleLoaded.current = true
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-[500px]">
        <p>Loading milk price data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Script src="https://www.gstatic.com/charts/loader.js" onLoad={handleGoogleLoad} strategy="afterInteractive" />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Milk Price Trends</CardTitle>
          <CardDescription>
            {stats
              ? `Average Price of Fresh, Whole, Fortified Milk per Gallon (${new Date(stats.startDate).toLocaleDateString()} - ${new Date(stats.endDate).toLocaleDateString()})`
              : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="w-full h-[500px]" />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Source: FRED Economic Data, Federal Reserve Bank of St. Louis</p>
            <p>Series ID: APU0000709112</p>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle>Price Analysis</CardTitle>
            <CardDescription>Key statistics about milk prices over the last decade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Price Range</h3>
                <p className="text-2xl font-bold">
                  ${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Min and max prices per gallon</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Average Price</h3>
                <p className="text-2xl font-bold">${stats.avgPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Mean price over the period</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Price Change</h3>
                <p className="text-2xl font-bold">
                  {stats.percentChange > 0 ? "+" : ""}
                  {stats.percentChange.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Overall change during period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
