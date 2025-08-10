"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { MenuRendererProps } from "../menu-renderer/types"
import { puckConfig } from "./config"

const Render = dynamic(() => import("@measured/puck").then(m => (m as any).Render), { ssr: false }) as any

export default function BuilderRenderer({ layout, data }: { layout: any; data: Omit<MenuRendererProps, "themeConfig" | "templateId"> }) {
  const content = layout?.content ?? layout
  // Attach __data at the root so blocks can use it
  return <Render config={puckConfig as any} data={{ content, __data: data }} />
}


