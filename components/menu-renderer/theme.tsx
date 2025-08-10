"use client"

import * as React from "react"
import type { MenuThemeConfig } from "./types"

export function MenuThemeProvider({ theme, children }: { theme?: MenuThemeConfig | null; children: React.ReactNode }) {
  const styleVars: React.CSSProperties = React.useMemo(() => {
    const vars: Record<string, string> = {}
    if (theme?.colors?.primary) vars["--menu-color-primary" as any] = theme.colors.primary
    if (theme?.colors?.surface) vars["--menu-color-surface" as any] = theme.colors.surface
    if (theme?.colors?.background) vars["--menu-color-background" as any] = theme.colors.background
    if (theme?.colors?.text) vars["--menu-color-text" as any] = theme.colors.text
    if (theme?.colors?.price) vars["--menu-color-price" as any] = theme.colors.price
    if (theme?.radii?.card !== undefined) vars["--menu-radius-card" as any] = `${theme.radii.card}px`
    return vars as React.CSSProperties
  }, [theme])

  return (
    <div style={styleVars as React.CSSProperties}>
      {children}
    </div>
  )
}


