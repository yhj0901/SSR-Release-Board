"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface VersionHistoryEntry {
  id: string
  version: string
  product_name: string
  dev_end_date: string
  qa_end_date: string
  release_date: string
  changed_by: string | null
  changed_at: string
  change_note: string | null
}

interface VersionHistoryProps {
  releaseId: string
}

export function VersionHistory({ releaseId }: VersionHistoryProps) {
  const [history, setHistory] = useState<VersionHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [releaseId])

  const fetchHistory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("version_history")
        .select("*")
        .eq("release_id", releaseId)
        .order("changed_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch version history:", error)
        return
      }

      setHistory(data || [])
    } catch (error) {
      console.error("Failed to fetch version history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-gray-400 text-sm mt-4">히스토리 로딩 중...</div>
  }

  if (history.length === 0) {
    return <div className="text-gray-400 text-sm mt-4">변경 이력이 없습니다.</div>
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        변경 이력
      </h4>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((entry) => (
          <Card key={entry.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                  {entry.version}
                </span>
                <span className="text-xs text-gray-400">{new Date(entry.changed_at).toLocaleString("ko-KR")}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div>
                  <span className="text-gray-400">개발: </span>
                  <span className="text-white">{new Date(entry.dev_end_date).toLocaleDateString("ko-KR")}</span>
                </div>
                <div>
                  <span className="text-gray-400">QA: </span>
                  <span className="text-white">{new Date(entry.qa_end_date).toLocaleDateString("ko-KR")}</span>
                </div>
                <div>
                  <span className="text-gray-400">릴리즈: </span>
                  <span className="text-white">{new Date(entry.release_date).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
              {entry.change_note && (
                <p className="text-sm text-gray-300 mt-2 p-2 bg-white/5 rounded">{entry.change_note}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
