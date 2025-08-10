"use client"

import dynamic from "next/dynamic"
import { MenuThemeProvider } from "./theme"
import type { MenuRendererProps } from "./types"

const DefaultTemplate = dynamic(() => import("./templates/default"), { ssr: true })

export function MenuRenderer(props: MenuRendererProps & { layoutConfig?: any | null; mode?: "template" | "builder" }) {
  const { themeConfig, layoutConfig, mode = "template", templateId, ...rest } = props

  // Builder mode (Puck) will be handled by a separate renderer to keep concerns isolated.
  if (mode === "builder" && layoutConfig) {
    const BuilderRenderer = dynamic(() => import("../puck/BuilderRenderer"), { ssr: true }) as any
    return (
      <MenuThemeProvider theme={themeConfig}>
        {/* @ts-ignore - dynamic import typing */}
        <BuilderRenderer layout={layoutConfig} data={rest} />
      </MenuThemeProvider>
    )
  }

  // Template mode - for now only default implemented
  return (
    <MenuThemeProvider theme={themeConfig}>
      <DefaultTemplate templateId={templateId} {...rest} themeConfig={themeConfig} />
    </MenuThemeProvider>
  )
}


