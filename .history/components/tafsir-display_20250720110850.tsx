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
      const tafsirText = await dataService.getTafsir(ayah.surahId, ayah.number)
      setTafsir(tafsirText)
      setHasLoaded(true)
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
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Tafsir (Commentary)</span>
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading commentary...</span>
                </div>
              ) : tafsir ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-primary">Commentary for Verse {ayah.number}:</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{tafsir}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No commentary available for this verse.</p>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
