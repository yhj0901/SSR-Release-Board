"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, History } from "lucide-react"
import Link from "next/link"
import { DatePicker } from "@/components/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VersionHistory } from "@/components/version-history"

interface Release {
  id: string
  product_name: string
  dev_end_date: string
  qa_end_date: string
  release_date: string
  version: string
  release_notes?: string // Added release_notes field
}

export default function AdminPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    product_name: "",
    dev_end_date: "",
    qa_end_date: "",
    release_date: "",
    version: "",
    change_note: "",
    release_notes: "", // Added release_notes to form data
  })

  const [devEndDate, setDevEndDate] = useState<Date | undefined>()
  const [qaEndDate, setQaEndDate] = useState<Date | undefined>()
  const [releaseDate, setReleaseDate] = useState<Date | undefined>()

  useEffect(() => {
    fetchReleases()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      const release = releases.find((r) => r.product_name === selectedProduct)
      if (release) {
        setFormData({
          product_name: release.product_name,
          dev_end_date: release.dev_end_date,
          qa_end_date: release.qa_end_date,
          release_date: release.release_date,
          version: release.version || "1.0.0",
          change_note: "",
          release_notes: release.release_notes || "", // Added release_notes
        })
        setDevEndDate(new Date(release.dev_end_date))
        setQaEndDate(new Date(release.qa_end_date))
        setReleaseDate(new Date(release.release_date))
      } else {
        setFormData({
          product_name: selectedProduct,
          dev_end_date: "",
          qa_end_date: "",
          release_date: "",
          version: "1.0.0",
          change_note: "",
          release_notes: "", // Added release_notes
        })
        setDevEndDate(undefined)
        setQaEndDate(undefined)
        setReleaseDate(undefined)
      }
    }
  }, [selectedProduct, releases])

  useEffect(() => {
    if (devEndDate) {
      setFormData((prev) => ({ ...prev, dev_end_date: devEndDate.toISOString().split("T")[0] }))
    }
  }, [devEndDate])

  useEffect(() => {
    if (qaEndDate) {
      setFormData((prev) => ({ ...prev, qa_end_date: qaEndDate.toISOString().split("T")[0] }))
    }
  }, [qaEndDate])

  useEffect(() => {
    if (releaseDate) {
      setFormData((prev) => ({ ...prev, release_date: releaseDate.toISOString().split("T")[0] }))
    }
  }, [releaseDate])

  const fetchReleases = async () => {
    try {
      const response = await fetch("/api/releases")
      const data = await response.json()
      setReleases(data)
    } catch (error) {
      console.error("Failed to fetch releases:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct) {
      alert("제품을 선택해주세요")
      return
    }

    try {
      const existingRelease = releases.find((r) => r.product_name === selectedProduct)

      if (existingRelease) {
        // Update existing product
        const response = await fetch(`/api/releases/${existingRelease.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          await fetchReleases()
          setFormData((prev) => ({ ...prev, change_note: "" }))
          alert("일정이 업데이트되었습니다")
        }
      }
    } catch (error) {
      console.error("Failed to save release:", error)
      alert("저장에 실패했습니다")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">릴리즈 관리</h1>
            <p className="text-gray-400">제품 릴리즈 일정을 관리합니다</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
              전광판 보기
            </Button>
          </Link>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">일정 수정</CardTitle>
            <CardDescription className="text-gray-400">제품을 선택하고 각 단계의 날짜를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name" className="text-white">
                    제품명
                  </Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-full">
                      <SelectValue placeholder="제품 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {releases.map((release) => (
                        <SelectItem key={release.id} value={release.product_name}>
                          {release.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-white">
                    버전
                  </Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="예: 1.0.0"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dev_end_date" className="text-white">
                    개발 종료일
                  </Label>
                  <DatePicker date={devEndDate} onDateChange={setDevEndDate} placeholder="개발 종료일 선택" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa_end_date" className="text-white">
                    QA 종료일
                  </Label>
                  <DatePicker date={qaEndDate} onDateChange={setQaEndDate} placeholder="QA 종료일 선택" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date" className="text-white">
                    최종 릴리즈일
                  </Label>
                  <DatePicker date={releaseDate} onDateChange={setReleaseDate} placeholder="최종 릴리즈일 선택" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="change_note" className="text-white">
                  변경 사항 메모 (선택사항)
                </Label>
                <Textarea
                  id="change_note"
                  value={formData.change_note}
                  onChange={(e) => setFormData({ ...formData, change_note: e.target.value })}
                  placeholder="이번 업데이트의 변경 사항을 기록하세요"
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_notes" className="text-white">
                  릴리즈 노트 (전광판에 표시됨)
                </Label>
                <Textarea
                  id="release_notes"
                  value={formData.release_notes}
                  onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                  placeholder="이번 버전에 포함된 주요 기능과 변경사항을 입력하세요"
                  className="bg-white/5 border-white/10 text-white"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-white text-black hover:bg-gray-200" disabled={!selectedProduct}>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">등록된 릴리즈</h2>
          <div className="grid gap-4">
            {releases.map((release) => (
              <Card key={release.id} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{release.product_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                          {release.version || "1.0.0"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHistory(showHistory === release.id ? null : release.id)}
                          className="bg-white/5 border-white/10 hover:bg-white/10"
                        >
                          <History className="w-4 h-4 mr-1" />
                          히스토리
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">개발 종료</p>
                        <p className="text-white font-medium">
                          {new Date(release.dev_end_date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">QA 종료</p>
                        <p className="text-white font-medium">
                          {new Date(release.qa_end_date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">최종 릴리즈</p>
                        <p className="text-white font-medium">
                          {new Date(release.release_date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    {showHistory === release.id && <VersionHistory releaseId={release.id} />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
