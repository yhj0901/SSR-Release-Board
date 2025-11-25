"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, History, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { DatePicker } from "@/components/date-picker";
import { createClient } from "@/lib/supabase/client";

interface Release {
  id: string;
  product_name: string;
  dev_end_date: string;
  qa_end_date: string;
  release_date: string;
  version: string;
}

interface VersionHistoryEntry {
  id: string;
  version: string;
  product_name: string;
  dev_end_date: string;
  qa_end_date: string;
  release_date: string;
  changed_by: string | null;
  changed_at: string;
  change_note: string | null;
  release_notes: string | null;
}

export default function AdminPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [versionHistories, setVersionHistories] = useState<
    Record<string, VersionHistoryEntry[]>
  >({});
  const [selectedVersion, setSelectedVersion] = useState<{
    releaseId: string;
    versionData: VersionHistoryEntry | null;
    isNewVersion: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    product_name: "",
    dev_end_date: "",
    qa_end_date: "",
    release_date: "",
    version: "",
    change_note: "",
    release_notes: "",
  });

  const [devEndDate, setDevEndDate] = useState<Date | undefined>();
  const [qaEndDate, setQaEndDate] = useState<Date | undefined>();
  const [releaseDate, setReleaseDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchReleases();
  }, []);

  useEffect(() => {
    if (devEndDate) {
      setFormData((prev) => ({
        ...prev,
        dev_end_date: devEndDate.toISOString().split("T")[0],
      }));
    }
  }, [devEndDate]);

  useEffect(() => {
    if (qaEndDate) {
      setFormData((prev) => ({
        ...prev,
        qa_end_date: qaEndDate.toISOString().split("T")[0],
      }));
    }
  }, [qaEndDate]);

  useEffect(() => {
    if (releaseDate) {
      setFormData((prev) => ({
        ...prev,
        release_date: releaseDate.toISOString().split("T")[0],
      }));
    }
  }, [releaseDate]);

  const fetchReleases = async () => {
    try {
      const response = await fetch("/api/releases");
      const data = await response.json();
      setReleases(data);
    } catch (error) {
      console.error("Failed to fetch releases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVersionHistory = async (releaseId: string, force = false) => {
    if (!force && versionHistories[releaseId]) {
      return; // Already fetched
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("version_history")
        .select("*")
        .eq("release_id", releaseId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch version history:", error);
        return;
      }

      setVersionHistories((prev) => ({
        ...prev,
        [releaseId]: data || [],
      }));
    } catch (error) {
      console.error("Failed to fetch version history:", error);
    }
  };

  const handleHistoryToggle = (releaseId: string) => {
    if (showHistory === releaseId) {
      setShowHistory(null);
    } else {
      setShowHistory(releaseId);
      fetchVersionHistory(releaseId);
    }
  };

  const handleVersionClick = (
    releaseId: string,
    versionData: VersionHistoryEntry
  ) => {
    const release = releases.find((r) => r.id === releaseId);
    if (!release) return;

    setSelectedVersion({
      releaseId,
      versionData,
      isNewVersion: false,
    });

    setFormData({
      product_name: release.product_name,
      dev_end_date: versionData.dev_end_date,
      qa_end_date: versionData.qa_end_date,
      release_date: versionData.release_date,
      version: versionData.version,
      change_note: versionData.change_note || "",
      release_notes: versionData.release_notes || "",
    });

    setDevEndDate(new Date(versionData.dev_end_date));
    setQaEndDate(new Date(versionData.qa_end_date));
    setReleaseDate(new Date(versionData.release_date));
  };

  const handleAddNewVersion = (releaseId: string) => {
    const release = releases.find((r) => r.id === releaseId);
    if (!release) return;

    setSelectedVersion({
      releaseId,
      versionData: null,
      isNewVersion: true,
    });

    setFormData({
      product_name: release.product_name,
      dev_end_date: "",
      qa_end_date: "",
      release_date: "",
      version: "",
      change_note: "",
      release_notes: "",
    });

    setDevEndDate(undefined);
    setQaEndDate(undefined);
    setReleaseDate(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVersion) {
      alert("버전을 선택해주세요");
      return;
    }

    if (
      !formData.version ||
      !formData.dev_end_date ||
      !formData.qa_end_date ||
      !formData.release_date
    ) {
      alert("모든 필드를 입력해주세요");
      return;
    }

    try {
      // 1. Update releases table
      const releaseResponse = await fetch(
        `/api/releases/${selectedVersion.releaseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: formData.product_name,
            dev_end_date: formData.dev_end_date,
            qa_end_date: formData.qa_end_date,
            release_date: formData.release_date,
            version: formData.version,
          }),
        }
      );

      if (!releaseResponse.ok) {
        throw new Error("Failed to update release");
      }

      // 2. Update or Insert version history
      let versionHistoryResponse;
      if (selectedVersion.isNewVersion) {
        // Insert new version history
        versionHistoryResponse = await fetch("/api/version-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            release_id: selectedVersion.releaseId,
            version: formData.version,
            product_name: formData.product_name,
            dev_end_date: formData.dev_end_date,
            qa_end_date: formData.qa_end_date,
            release_date: formData.release_date,
            release_notes: formData.release_notes || null,
            change_note: formData.change_note || null,
          }),
        });
      } else {
        // Update existing version history
        versionHistoryResponse = await fetch(
          `/api/version-history/${selectedVersion.versionData?.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              version: formData.version,
              product_name: formData.product_name,
              dev_end_date: formData.dev_end_date,
              qa_end_date: formData.qa_end_date,
              release_date: formData.release_date,
              release_notes: formData.release_notes || null,
              change_note: formData.change_note || null,
            }),
          }
        );
      }

      if (!versionHistoryResponse.ok) {
        throw new Error("Failed to save version history");
      }

      // Success - refresh and reset
      await fetchReleases();
      await fetchVersionHistory(selectedVersion.releaseId, true);
      setShowHistory(selectedVersion.releaseId); // 히스토리를 열어둠
      setSelectedVersion(null);
      setFormData({
        product_name: "",
        dev_end_date: "",
        qa_end_date: "",
        release_date: "",
        version: "",
        change_note: "",
        release_notes: "",
      });
      setDevEndDate(undefined);
      setQaEndDate(undefined);
      setReleaseDate(undefined);
      alert("일정이 업데이트되었습니다");
    } catch (error) {
      console.error("Failed to save release:", error);
      alert("저장에 실패했습니다");
    }
  };

  const handleCancel = () => {
    setSelectedVersion(null);
    setFormData({
      product_name: "",
      dev_end_date: "",
      qa_end_date: "",
      release_date: "",
      version: "",
      change_note: "",
      release_notes: "",
    });
    setDevEndDate(undefined);
    setQaEndDate(undefined);
    setReleaseDate(undefined);
  };

  const handleDeleteVersion = async (
    releaseId: string,
    versionHistoryId: string,
    versionName: string
  ) => {
    if (
      !confirm(
        `버전 ${versionName}을(를) 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/version-history/${versionHistoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh version history
        await fetchVersionHistory(releaseId, true);

        // If the deleted version was selected, clear the form
        if (selectedVersion?.versionData?.id === versionHistoryId) {
          handleCancel();
        }

        alert("버전 히스토리가 삭제되었습니다");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Failed to delete version history:", error);
      alert("삭제에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">릴리즈 관리</h1>
            <p className="text-muted-foreground">
              제품 릴리즈 일정을 관리합니다
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/customer-modules">
              <Button variant="outline">고객사 관리</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">전광판 보기</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">등록된 릴리즈</h2>
          <div className="grid gap-4">
            {releases.map((release) => (
              <Card key={release.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground">
                        {release.product_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {release.version || "1.0.0"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHistoryToggle(release.id)}
                        >
                          <History className="w-4 h-4 mr-1" />
                          히스토리
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddNewVersion(release.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          추가
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">개발 종료</p>
                        <p className="text-foreground font-medium">
                          {new Date(release.dev_end_date).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">QA 종료</p>
                        <p className="text-foreground font-medium">
                          {new Date(release.qa_end_date).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">최종 릴리즈</p>
                        <p className="text-foreground font-medium">
                          {new Date(release.release_date).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                    </div>
                    {showHistory === release.id && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          버전 히스토리
                        </h4>
                        {versionHistories[release.id] &&
                        versionHistories[release.id].length > 0 ? (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {versionHistories[release.id].map((entry) => (
                              <Card
                                key={entry.id}
                                className="bg-muted/30 border-border cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() =>
                                  handleVersionClick(release.id, entry)
                                }
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                                        {entry.version}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(
                                          entry.changed_at
                                        ).toLocaleString("ko-KR")}
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVersion(
                                          release.id,
                                          entry.id,
                                          entry.version
                                        );
                                      }}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                    <div>
                                      <span className="text-muted-foreground">
                                        개발:{" "}
                                      </span>
                                      <span className="text-foreground">
                                        {new Date(
                                          entry.dev_end_date
                                        ).toLocaleDateString("ko-KR")}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        QA:{" "}
                                      </span>
                                      <span className="text-foreground">
                                        {new Date(
                                          entry.qa_end_date
                                        ).toLocaleDateString("ko-KR")}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        릴리즈:{" "}
                                      </span>
                                      <span className="text-foreground">
                                        {new Date(
                                          entry.release_date
                                        ).toLocaleDateString("ko-KR")}
                                      </span>
                                    </div>
                                  </div>
                                  {entry.change_note && (
                                    <p className="text-sm text-foreground mt-2 p-2 bg-muted/50 rounded">
                                      {entry.change_note}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            변경 이력이 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedVersion && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                {selectedVersion.isNewVersion ? "새 버전 추가" : "일정 수정"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedVersion.isNewVersion
                  ? "새로운 버전의 일정을 입력하세요"
                  : "선택한 버전의 일정을 수정하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_name" className="text-foreground">
                      제품명
                    </Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      disabled
                      className="bg-muted border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version" className="text-foreground">
                      버전
                    </Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) =>
                        setFormData({ ...formData, version: e.target.value })
                      }
                      placeholder="예: 1.0.0"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dev_end_date" className="text-foreground">
                      개발 종료일
                    </Label>
                    <DatePicker
                      date={devEndDate}
                      onDateChange={setDevEndDate}
                      placeholder="개발 종료일 선택"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qa_end_date" className="text-foreground">
                      QA 종료일
                    </Label>
                    <DatePicker
                      date={qaEndDate}
                      onDateChange={setQaEndDate}
                      placeholder="QA 종료일 선택"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="release_date" className="text-foreground">
                      최종 릴리즈일
                    </Label>
                    <DatePicker
                      date={releaseDate}
                      onDateChange={setReleaseDate}
                      placeholder="최종 릴리즈일 선택"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="change_note" className="text-foreground">
                    변경 사항 메모 (선택사항)
                  </Label>
                  <Textarea
                    id="change_note"
                    value={formData.change_note}
                    onChange={(e) =>
                      setFormData({ ...formData, change_note: e.target.value })
                    }
                    placeholder="이번 업데이트의 변경 사항을 기록하세요"
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_notes" className="text-foreground">
                    릴리즈 노트 (전광판에 표시됨)
                  </Label>
                  <Textarea
                    id="release_notes"
                    value={formData.release_notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        release_notes: e.target.value,
                      })
                    }
                    placeholder="이번 버전에 포함된 주요 기능과 변경사항을 입력하세요"
                    className="bg-background border-border text-foreground"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
