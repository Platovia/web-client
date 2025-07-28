"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SUPPORTED_LOCALES, detectBrowserLocale } from "@/lib/locale"
import { useEffect, useState } from "react"

interface LocaleSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  detectDefault?: boolean
}

export function LocaleSelect({ 
  value, 
  onValueChange, 
  placeholder = "Select locale...",
  detectDefault = false 
}: LocaleSelectProps) {
  const [detectedLocale, setDetectedLocale] = useState<string>()

  useEffect(() => {
    if (detectDefault && !value) {
      const detected = detectBrowserLocale()
      setDetectedLocale(detected)
      onValueChange(detected)
    }
  }, [detectDefault, value, onValueChange])

  return (
    <Select value={value || detectedLocale} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((locale) => (
          <SelectItem key={locale.value} value={locale.value}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 