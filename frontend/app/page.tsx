"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Copy, Loader2, QrCode, LocateFixed, Share2, ArrowRight, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { API_BASE_URL } from "@/lib/baseUrl"

export default function DigiPinConverter() {
  const [decodeInput, setDecodeInput] = useState("")
  const [encodeLatInput, setEncodeLatInput] = useState("")
  const [encodeLngInput, setEncodeLngInput] = useState("")
  const [decodedResult, setDecodedResult] = useState<null | {
    latitude: string
    longitude: string
    mapsUrl: string
    qrImageUrl: string
    qrImageBase64: string
  }>(null)

  const [encodedDigiPin, setEncodedDigiPin] = useState("")
  const [activeTab, setActiveTab] = useState("decode")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);


  const simulateLoading = (callback: () => void) => {
    setIsLoading(true)
    setTimeout(() => {
      callback()
      setIsLoading(false)
    }, 800)
  }

  const handleEncode = async () => {
  simulateLoading(async () => {
    const lat = Number.parseFloat(encodeLatInput)
    const lng = Number.parseFloat(encodeLngInput)

    if (isNaN(lat) || isNaN(lng) || lat < 2.5 || lat > 38.5 || lng < 63.5 || lng > 99.5) {
      toast({
        title: "Invalid Coordinates",
        description: "Enter lat 2.5–38.5 & lon 63.5–99.5 (India only)",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/digipin/encode?latitude=${lat}&longitude=${lng}`)
      const data = await res.json()

      if (data.digipin) {
        setEncodedDigiPin(data.digipin)
      } else {
        throw new Error("No DigiPin in response")
      }
    } catch (err) {
      toast({
        title: "API Error",
        description: "Check backend or DigiPin service",
        variant: "destructive",
      })
    }
  })
}


  const handleDecode = () => {
    simulateLoading(async () => {
      try {
        // const pin = decodeInput.trim()
        const pin = decodeInput.trim()

        const res = await fetch(`${API_BASE_URL}/api/digipin/qrcode/${pin}`)
        const data = await res.json()

        if (data.latitude && data.longitude && data.qrImageBase64) {
          setDecodedResult(data)
          toast({
            title: "DigiPin Decoded",
            description: `Lat: ${data.latitude}, Lon: ${data.longitude}`,
          })
        } else {
          throw new Error("Invalid DigiPin or no QR response")
        }
      } catch (err) {
        toast({
          title: "Error Decoding",
          description: "Ensure valid DigiPin & backend running",
          variant: "destructive",
        })
      }
    })
  }

const copyToClipboard = (text: string, setCopied: (value: boolean) => void) => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  toast({
    title: "Copied",
    description: text,
    duration: 2000,
  });

  setTimeout(() => {
    setCopied(false);
  }, 2000);
};





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-2 bg-white/10 backdrop-blur-lg rounded-2xl mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Convert Location to DigiPin + QR Instantly
            </h1>
          <p className="text-lg text-blue-100/80 max-w-2xl mx-auto">
            Turn your coordinates into smart DigiPins with QR codes and Google Maps links — seamless, stylish, and ready to share!
          </p>
        </motion.div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 w-full max-w-md bg-white/10 backdrop-blur-md p-1 rounded-xl">
                <TabsTrigger
                  value="decode"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg py-3 px-6 transition-all duration-300 ease-out"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Decode DigiPin
                </TabsTrigger>
                <TabsTrigger
                  value="encode"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg py-3 px-6 transition-all duration-300 ease-out"
                >
                  <LocateFixed className="h-4 w-4 mr-2" />
                  Encode Coordinates
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "decode" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "decode" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="decode" className="mt-0">
  <Card className="bg-white/10 backdrop-blur-lg border-0 shadow-xl overflow-hidden">
    <CardContent className="p-6 md:p-8">
      <div className="space-y-6">
        {/* Input Section */}
        <div className="space-y-3">
          <Label htmlFor="digipin-input" className="text-lg font-medium text-blue-100">
            Enter DigiPin Code
          </Label>
          <div className="relative">
            <Input
              id="digipin-input"
              placeholder="e.g., DPABCD1234EFGH"
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-14 pl-12 pr-4 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
            <Button
              onClick={handleDecode}
              disabled={!decodeInput.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg h-10 px-4 transition-all"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="mr-2">Decode</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <AnimatePresence>
          {decodedResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coordinates & Actions */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-blue-100">Coordinates</Label>
                  <div className="p-4 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-xs text-blue-300 mr-2">LAT </span>
                          <span className="font-mono text-lg">{Number(decodedResult.latitude).toFixed(6)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-blue-300 mr-2">LNG </span>
                          <span className="font-mono text-lg">{Number(decodedResult.longitude).toFixed(6)}</span>
                        </div>
                      </div>
                      <Button
  variant="ghost"
  size="sm"
  onClick={() =>
    copyToClipboard(
      `${Number(decodedResult.latitude).toFixed(6)}, ${Number(decodedResult.longitude).toFixed(6)}`,
      setCopiedCoords
    )
  }
  className="hover:bg-white/10 text-blue-300 hover:text-white"
>
  {copiedCoords ? (
    <>
      <Check className="h-4 w-4 text-green-400" />
    </>
  ) : (
    <Copy className="h-4 w-4" />
  )}
</Button>


                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-blue-300 hover:text-white"
                      onClick={() => window.open(decodedResult.mapsUrl, "_blank")}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Open in Maps
                    </Button>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-blue-100">Google Maps QR Code</Label>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <img
                      src={`data:image/png;base64,${decodedResult.qrImageBase64}`}
                      alt="QR Code"
                      className="h-48 w-48 rounded-md shadow"
                    />
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CardContent>
  </Card>
</TabsContent>


            {/* HandleEncode */}
                <TabsContent value="encode" className="mt-0">
                  <Card className="bg-white/10 backdrop-blur-lg border-0 shadow-xl overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-lg font-medium text-blue-100">Enter Coordinates</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <Input
                                id="latitude-input"
                                type="number"
                                step="any"
                                placeholder="Latitude (e.g., 40.7128)"
                                value={encodeLatInput}
                                onChange={(e) => setEncodeLatInput(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-14 pl-12 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 font-medium">
                                LAT
                              </span>
                            </div>
                            <div className="relative">
                              <Input
                                id="longitude-input"
                                type="number"
                                step="any"
                                placeholder="Longitude (e.g., -74.0060)"
                                value={encodeLngInput}
                                onChange={(e) => setEncodeLngInput(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-14 pl-12 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 font-medium">
                                LNG
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={handleEncode}
                            disabled={!encodeLatInput || !encodeLngInput || isLoading}
                            className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg h-12 transition-all"
                          >
                            {isLoading ? (
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <LocateFixed className="h-5 w-5 mr-2" />
                                Generate DigiPin
                              </>
                            )}
                          </Button>
                          <Button
                                    onClick={() => {
                                      if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                          (position) => {
                                            setEncodeLatInput(position.coords.latitude.toFixed(6));
                                            setEncodeLngInput(position.coords.longitude.toFixed(6));
                                          },
                                          (error) => {
                                            alert("Unable to fetch location. Please allow GPS or enter manually.");
                                            console.error(error);
                                          }
                                        );
                                      } else {
                                        alert("Geolocation is not supported by this browser.");
                                      }
                                    }}
                                    className="w-full md:w-auto text-sm font-medium mt-2 bg-white/10 hover:bg-white/20 text-blue-100 px-4 py-2 rounded-lg transition-all"
                                  >
                                    📍 Use My Current Location
                                  </Button>

                        </div>
                        <AnimatePresence>
                          {encodedDigiPin && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.4 }}
                              className="space-y-6 pt-6 border-t border-white/10"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <Label className="text-lg font-medium text-blue-100">Generated DigiPin</Label>
                                  <div className="p-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl backdrop-blur-md border border-white/10">
                                    <div className="flex flex-col items-center">
                                      <span className="font-mono text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider">
                                        {encodedDigiPin}
                                      </span>
                                      <Button
  variant="ghost"
  size="sm"
  onClick={() => copyToClipboard(encodedDigiPin, setCopiedPin)}
  className="mt-3 hover:bg-white/10 text-blue-300 hover:text-white"
>
  {copiedPin ? (
    <>
      <Check className="h-4 w-4 mr-2 text-green-400" />
      Copied!
    </>
  ) : (
    <>
      <Copy className="h-4 w-4 mr-2" />
      Copy DigiPin
    </>
  )}
</Button>

                                      
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center text-sm text-blue-200/60"
        >
         <p className="text-sm text-blue-200 text-center">
              DigiPin by <a 
                href="https://github.com/abhisheksharma226" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                Abhishek Sharma
              </a> • Precision Location Tool
            </p>

        </motion.div>
      </div>
    </div>
  )
}
