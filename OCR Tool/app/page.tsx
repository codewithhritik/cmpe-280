"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload } from "lucide-react"
import { extractTextFromImage } from "@/lib/gemini-api"

export default function OCRPage() {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<string>("1")
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.includes("image")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setFile(file)
    const imageUrl = URL.createObjectURL(file)
    setImage(imageUrl)
    setExtractedText("")
    setActiveStep("2")
  }

  const analyzeImage = async () => {
    if (!file) return

    try {
      setIsLoading(true)
      const text = await extractTextFromImage(file)
      setExtractedText(text)
      setActiveStep("3")
    } catch (error) {
      console.error("Error analyzing image:", error)
      toast({
        title: "Error analyzing image",
        description: "There was an error extracting text from the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setImage(null)
    setFile(null)
    setExtractedText("")
    setActiveStep("1")
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-primary text-primary-foreground text-center">
          <CardTitle className="text-2xl">OCR Analytics Page</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Upload an image to extract text using OCR
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger
                value="1"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Step 1
              </TabsTrigger>
              <TabsTrigger
                value="2"
                disabled={!image}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Step 2
              </TabsTrigger>
              <TabsTrigger
                value="3"
                disabled={!extractedText}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Step 3
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div className="border-2 border-dashed rounded-lg aspect-square md:aspect-auto md:h-[300px] flex items-center justify-center bg-muted/50">
                    {image ? (
                      <Image
                        src={image || "/placeholder.svg"}
                        alt="Uploaded image"
                        width={400}
                        height={300}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Upload an image to begin</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="image-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button asChild className="w-full bg-primary text-primary-foreground">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        Select Image
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Upload a clear image containing text</li>
                    <li>Click on "OCR Analyze" to extract text</li>
                    <li>View the extracted text in the results section</li>
                  </ol>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Supported formats: JPG, PNG, GIF, BMP
                    <br />
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="2" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden">
                  {image && (
                    <Image
                      src={image || "/placeholder.svg"}
                      alt="Uploaded image"
                      width={400}
                      height={300}
                      className="w-full object-contain max-h-[300px]"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium mb-4">Ready to Analyze</h3>
                  <p className="mb-6 text-muted-foreground">
                    Your image has been uploaded successfully. Click the button below to extract text from the image.
                  </p>
                  <Button
                    onClick={analyzeImage}
                    disabled={isLoading || !image}
                    className="bg-primary text-primary-foreground"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "OCR Analyze"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="3" className="mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg overflow-hidden">
                  {image && (
                    <Image
                      src={image || "/placeholder.svg"}
                      alt="Uploaded image"
                      width={400}
                      height={300}
                      className="w-full object-contain max-h-[300px]"
                    />
                  )}
                </div>

                <div className="border rounded-lg p-4 h-full">
                  <h3 className="text-lg font-medium mb-2">OCR Results</h3>
                  <Separator className="my-2" />
                  <div className="max-h-[250px] overflow-y-auto">
                    {extractedText ? (
                      <p className="whitespace-pre-wrap">{extractedText}</p>
                    ) : (
                      <p className="text-muted-foreground">No text extracted</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetForm}>
            Start Over
          </Button>
          {extractedText && (
            <Button
              onClick={() => {
                navigator.clipboard.writeText(extractedText)
                toast({
                  title: "Copied to clipboard",
                  description: "The extracted text has been copied to your clipboard",
                })
              }}
            >
              Copy Text
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}

