"use client"

import { useState, useEffect } from "react"
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { dataService } from "@/lib/data-service"
import type { Ayah } from "@/lib/types"

interface TafsirDisplayProps {
  ayah: Ayah
  className?: string
}

export function TafsirDisplay({ ayah, className }: TafsirDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tafsir, setTafsir] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadTafsir = async () => {
    if (hasLoaded) return

    setIsLoading(true)
    try {
      console.log(`Loading tafsir for ${ayah.surahId}:${ayah.number}`)
      const tafsirText = await dataService.getTafsir(ayah.surahId, ayah.number)
      setTafsir(tafsirText)
      setHasLoaded(true)
      console.log(`Tafsir loaded:`, tafsirText ? "Success" : "No tafsir found")
    } catch (error) {
      console.error("Error loading tafsir:", error)
      setTafsir("Tafsir not available for this verse.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && !hasLoaded) {
      loadTafsir()
    }
  }, [isOpen, hasLoaded])

  return (
    <div className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between text-left">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-blue-600 font-medium">Tafsir (Commentary)</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                  <span className="text-sm text-blue-600">Loading commentary...</span>
                </div>
              ) : tafsir ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                      Tafsir Ibn Kathir - Verse {ayah.number}
                    </h4>
                  </div>
                  <div className="pl-6 border-l-2 border-blue-300 dark:border-blue-700">
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{tafsir}</p>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 italic">Source: Tafsir Ibn Kathir (English)</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 italic">No commentary available for this verse.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
