import { GoogleGenerativeAI, type Part } from "@google/generative-ai"

/**
 * Extracts text from an image using the Gemini API
 * @param imageFile The image file to extract text from
 * @returns A promise that resolves to the extracted text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Convert the image file to a base64 string
    const base64Image = await fileToBase64(imageFile)

    // Create a multipart prompt with text and image
    const parts: Part[] = [
      { text: "Explain what is written in the image" },
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ]

    // Generate content from the model
    const result = await model.generateContent({
      contents: [{ parts }],
    })

    // Get the response text
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Error extracting text from image:", error)
    throw new Error("Failed to extract text from image")
  }
}

/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1]
        resolve(base64)
      } else {
        reject(new Error("Failed to convert file to base64"))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

