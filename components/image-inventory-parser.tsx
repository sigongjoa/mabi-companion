"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, PlusCircle, Save } from "lucide-react"
import { logger } from "@/lib/logger"
import { type Item } from "@/types/page-context" // Assuming Item type is defined here

interface ImageInventoryParserProps {
  localStorageKey?: string // Key to store/retrieve items from localStorage
}

export default function ImageInventoryParser({
  localStorageKey = "parsedInventoryItems",
}: ImageInventoryParserProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedItems, setParsedItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load items from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedItems = localStorage.getItem(localStorageKey)
        if (storedItems) {
          setParsedItems(JSON.parse(storedItems))
          logger.debug(`Loaded items from localStorage (${localStorageKey})`, JSON.parse(storedItems))
        }
      } catch (e) {
        logger.error(`Failed to load items from localStorage (${localStorageKey})`, e)
        setError("로컬 스토리지에서 아이템을 불러오는 데 실패했습니다.")
      }
    }
  }, [localStorageKey])

  // Handle file selection
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      setError(null)
    } else {
      setSelectedFile(null)
    }
  }, [])

  // Request image parsing from backend
  const handleParseImage = useCallback(async () => {
    if (!selectedFile) {
      setError("이미지 파일을 선택해주세요.")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      // This is a placeholder for your actual backend API call
      // Replace with your actual API endpoint and authentication if needed
      const response = await fetch("/api/parse-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "이미지 파싱에 실패했습니다.")
      }

      const data: Item[] = await response.json()
      setParsedItems(data)
      logger.debug("Image parsed successfully", data)
    } catch (e) {
      logger.error("Error parsing image", e)
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }, [selectedFile])

  // Handle changes to item fields
  const handleItemChange = useCallback(
    (index: number, field: keyof Item, value: string | number) => {
      setParsedItems((prevItems) =>
        prevItems.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      )
    },
    [],
  )

  // Add a new empty item
  const handleAddItem = useCallback(() => {
    setParsedItems((prevItems) => [
      ...prevItems,
      { id: Date.now(), name: "", quantity: 0, category: "" }, // Default empty item
    ])
  }, [])

  // Remove an item
  const handleRemoveItem = useCallback((index: number) => {
    setParsedItems((prevItems) => prevItems.filter((_, i) => i !== index))
  }, [])

  // Save current parsed items to localStorage
  const handleSaveToLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(parsedItems))
        alert("아이템 목록이 로컬 스토리지에 저장되었습니다!")
        logger.debug(`Items saved to localStorage (${localStorageKey})`, parsedItems)
      } catch (e) {
        logger.error(`Failed to save items to localStorage (${localStorageKey})`, e)
        setError("로컬 스토리지에 아이템을 저장하는 데 실패했습니다.")
      }
    }
  }, [localStorageKey, parsedItems])

  return (
    <Card className="modern-card fade-in">
      <CardHeader>
        <CardTitle>이미지에서 아이템 파싱</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <Button onClick={handleParseImage} disabled={!selectedFile || loading}>
            {loading ? "파싱 중..." : "이미지 파싱 요청"}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {parsedItems.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">파싱된 아이템 목록 (수정 가능)</h3>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead className="w-[100px]">수량</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead className="w-[50px] text-center">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedItems.map((item, index) => (
                    <TableRow key={item.id || `new-item-${index}`}>
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", parseInt(e.target.value) || 0)
                          }
                          min={0}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.category}
                          onChange={(e) => handleItemChange(index, "category", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between">
              <Button onClick={handleAddItem} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" /> 새 아이템 추가
              </Button>
              <Button onClick={handleSaveToLocalStorage}>
                <Save className="h-4 w-4 mr-2" /> 로컬 스토리지에 저장
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}