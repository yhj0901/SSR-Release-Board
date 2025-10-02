"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProductTimeline } from "@/components/product-timeline"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Release {
  id: string
  product_name: string
  dev_end_date: string
  qa_end_date: string
  release_date: string
  version?: string
  release_notes?: string
}

interface Product {
  name: string
  developmentDate: string
  qaDate: string
  releaseDate: string
  version?: string
  releaseNotes?: string
}

interface RealtimeDashboardProps {
  initialProducts: Product[]
}

export function RealtimeDashboard({ initialProducts }: RealtimeDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting")

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      console.log("[v0] Setting up Supabase Realtime subscription...")

      channel = supabase
        .channel("releases-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "releases",
          },
          async (payload) => {
            console.log("[v0] Realtime change detected:", payload)

            // Fetch updated data
            const { data: releases, error } = await supabase
              .from("releases")
              .select("*")
              .order("product_name", { ascending: true })

            if (error) {
              console.error("[v0] Error fetching updated data:", error)
              return
            }

            if (releases) {
              console.log("[v0] Updating products with new data:", releases)
              const updatedProducts = releases.map((release: Release) => ({
                name: release.product_name,
                developmentDate: release.dev_end_date,
                qaDate: release.qa_end_date,
                releaseDate: release.release_date,
                version: release.version,
                releaseNotes: release.release_notes,
              }))
              setProducts(updatedProducts)
            }
          },
        )
        .subscribe((status, err) => {
          console.log("[v0] Subscription status:", status)
          if (err) {
            console.error("[v0] Subscription error:", err)
            setConnectionStatus("error")
          } else {
            setConnectionStatus(status)
          }
        })
    }

    setupRealtimeSubscription()

    return () => {
      console.log("[v0] Cleaning up Realtime subscription...")
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">
        연결 상태: {connectionStatus === "SUBSCRIBED" ? "✓ 실시간 연결됨" : connectionStatus}
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {products.map((product) => (
          <ProductTimeline key={product.name} product={product} />
        ))}
      </div>
    </div>
  )
}
