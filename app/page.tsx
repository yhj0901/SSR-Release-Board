import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { LiveClock } from "@/components/live-clock"
import { RealtimeDashboard } from "@/components/realtime-dashboard"

export default async function Home() {
  const supabase = await createClient()

  const { data: releases, error } = await supabase
    .from("releases")
    .select("*")
    .order("product_name", { ascending: true })

  const products =
    releases?.map((release) => ({
      name: release.product_name,
      developmentDate: release.dev_end_date,
      qaDate: release.qa_end_date,
      releaseDate: release.release_date,
      version: release.version,
      releaseNotes: release.release_notes,
    })) || []

  return (
    <main className="min-h-screen bg-background p-8 md:p-12 lg:p-16">
      <div className="mx-auto max-w-7xl">
        <LiveClock />

        <header className="mb-12 md:mb-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                SSR 제품 릴리즈 대시보드
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl text-pretty">
                제품 개발 및 릴리즈 일정 현황판
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                관리
              </Button>
            </Link>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">등록된 제품이 없습니다.</p>
            <Link href="/admin">
              <Button className="mt-4">제품 추가하기</Button>
            </Link>
          </div>
        ) : (
          <RealtimeDashboard initialProducts={products} />
        )}

        <footer className="mt-16 border-t border-border pt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("ko-KR")}</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
