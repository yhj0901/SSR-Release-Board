"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, Home, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
}

interface Module {
  id: string;
  name: string;
  description: string | null;
}

interface CustomerModule {
  id: string;
  customer_id: string;
  module_id: string;
  version: string | null;
  image_url: string | null;
  notes: string | null;
  uploaded_by: string | null;
  created_at: string;
  customer: Customer;
  module: Module;
}

export default function CustomerModulesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [customerModules, setCustomerModules] = useState<CustomerModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [showNewCustomerInput, setShowNewCustomerInput] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerModules(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchData = async () => {
    try {
      const [customersRes, modulesRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/modules"),
      ]);

      const customersData = await customersRes.json();
      const modulesData = await modulesRes.json();

      setCustomers(customersData);
      setModules(modulesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerModules = async (customerId: string) => {
    try {
      const response = await fetch(
        `/api/customer-modules?customer_id=${customerId}`
      );
      const data = await response.json();
      setCustomerModules(data);
    } catch (error) {
      console.error("Failed to fetch customer modules:", error);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert("고객사 이름을 입력해주세요");
      return;
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustomerName }),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomers([...customers, newCustomer]);
        setSelectedCustomerId(newCustomer.id);
        setNewCustomerName("");
        setShowNewCustomerInput(false);
        alert("고객사가 추가되었습니다");
      } else {
        const error = await response.json();
        alert(`오류: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("고객사 추가에 실패했습니다");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId || !selectedModuleId) {
      alert("고객사와 모듈을 선택해주세요");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = null;

      // 이미지 업로드
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          throw new Error("이미지 업로드 실패");
        }
      }

      // 모듈 버전 정보 저장
      const response = await fetch("/api/customer-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          module_id: selectedModuleId,
          version: version || null,
          image_url: imageUrl,
          notes: notes || null,
          uploaded_by: uploadedBy || null,
        }),
      });

      if (response.ok) {
        alert("저장되었습니다");
        fetchCustomerModules(selectedCustomerId);
        // 폼 초기화
        setSelectedModuleId("");
        setVersion("");
        setNotes("");
        setUploadedBy("");
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        const error = await response.json();
        alert(`오류: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("저장에 실패했습니다");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">고객사 모듈 버전 관리</h1>
            <p className="text-muted-foreground">
              고객사별 솔루션 모듈 버전을 관리합니다
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* 고객사 선택 섹션 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">고객사 선택</CardTitle>
            <CardDescription className="text-muted-foreground">
              고객사를 선택하거나 새로 추가하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-foreground">
                고객사
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCustomerId}
                  onValueChange={(value) => {
                    setSelectedCustomerId(value);
                    setShowNewCustomerInput(false);
                  }}
                >
                  <SelectTrigger className="flex-1 bg-background border-border text-foreground">
                    <SelectValue placeholder="고객사를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCustomerInput(!showNewCustomerInput)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  신규 추가
                </Button>
              </div>
            </div>

            {showNewCustomerInput && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-md">
                <Label htmlFor="new-customer" className="text-foreground">
                  신규 고객사 이름
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-customer"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="예: 삼성전자"
                    className="bg-background border-border text-foreground"
                  />
                  <Button type="button" onClick={handleCreateCustomer}>
                    추가
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewCustomerInput(false);
                      setNewCustomerName("");
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 모듈 버전 등록 폼 */}
        {selectedCustomerId && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">모듈 버전 등록</CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedCustomer?.name}의 모듈 버전 정보를 등록하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="module" className="text-foreground">
                      모듈 선택 *
                    </Label>
                    <Select
                      value={selectedModuleId}
                      onValueChange={setSelectedModuleId}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="모듈을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version" className="text-foreground">
                      버전 (선택사항)
                    </Label>
                    <Input
                      id="version"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="예: 1.0.0"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uploaded-by" className="text-foreground">
                    작성자 (선택사항)
                  </Label>
                  <Input
                    id="uploaded-by"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    버전 정보 이미지 (선택사항)
                  </Label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-auto max-h-96 rounded-md border-2 border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4 mr-1" />
                          제거
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-12 h-12 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              클릭하여 이미지 업로드
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP (최대 10MB)
                          </p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageSelect}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">
                    메모 (선택사항)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="추가 정보를 입력하세요"
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isUploading} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "저장 중..." : "저장"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 등록된 모듈 목록 */}
        {selectedCustomerId && customerModules.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">등록된 모듈</CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedCustomer?.name}의 모듈 버전 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customerModules.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-muted/30 border-border overflow-hidden"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.module.name}
                        </h3>
                        {item.version && (
                          <p className="text-sm text-muted-foreground mt-1">
                            버전: {item.version}
                          </p>
                        )}
                      </div>

                      {item.image_url && (
                        <div className="mt-2">
                          <img
                            src={item.image_url}
                            alt={item.module.name}
                            onClick={() => setModalImageUrl(item.image_url)}
                            className="w-full h-auto rounded-md border border-border hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {item.notes}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        {item.uploaded_by && <p>작성자: {item.uploaded_by}</p>}
                        <p>
                          등록일:{" "}
                          {new Date(item.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 이미지 모달 */}
      {modalImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setModalImageUrl(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setModalImageUrl(null)}
              className="absolute top-2 right-2 z-10"
            >
              <X className="w-4 h-4 mr-1" />
              닫기
            </Button>
            <img
              src={modalImageUrl}
              alt="확대 이미지"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
