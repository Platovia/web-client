"use client"

import * as React from "react"
import type { MenuRendererProps } from "./types"

type MenuData = Omit<MenuRendererProps, "themeConfig" | "templateId">

const MenuDataContext = React.createContext<MenuData | null>(null)

export function MenuDataProvider({ value, children }: { value: MenuData; children: React.ReactNode }) {
  return <MenuDataContext.Provider value={value}>{children}</MenuDataContext.Provider>
}

export function useMenuData(): MenuData {
  const ctx = React.useContext(MenuDataContext)
  if (!ctx) throw new Error("useMenuData must be used within MenuDataProvider")
  return ctx
}


