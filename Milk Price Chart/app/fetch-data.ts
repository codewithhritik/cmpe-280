"use server"

import { parse } from "csv-parse/sync"

export async function fetchMilkPriceData() {
  try {
    // Fetch the CSV data from the provided URL
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Average%20Price%20Milk%20Cost%20per%20Gallon-nfAtIjFKrws4NL6M5Yw7UKNNCC0m17.csv",
    )
    const csvText = await response.text()

    // Parse the CSV data
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    })

    // Sort the data by date (ascending)
    records.sort((a, b) => new Date(a.observation_date) - new Date(b.observation_date))

    // Get the most recent 10 years of data
    const currentDate = new Date()
    const tenYearsAgo = new Date()
    tenYearsAgo.setFullYear(currentDate.getFullYear() - 10)

    const filteredData = records.filter((record) => {
      const recordDate = new Date(record.observation_date)
      return recordDate >= tenYearsAgo
    })

    // Format the data for Google Charts
    const formattedData = filteredData
      .map((record) => {
        return {
          date: record.observation_date,
          price: Number.parseFloat(record.APU0000709112),
        }
      })
      .filter((item) => !isNaN(item.price))

    // Calculate statistics
    const prices = formattedData.map((item) => item.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const startPrice = prices[0]
    const endPrice = prices[prices.length - 1]
    const percentChange = ((endPrice - startPrice) / startPrice) * 100

    return {
      chartData: formattedData,
      stats: {
        minPrice,
        maxPrice,
        avgPrice,
        percentChange,
        startDate: formattedData[0].date,
        endDate: formattedData[formattedData.length - 1].date,
        dataPoints: formattedData.length,
      },
    }
  } catch (error) {
    console.error("Error processing the data:", error)
    return null
  }
}
