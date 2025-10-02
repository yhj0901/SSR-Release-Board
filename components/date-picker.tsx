"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ date, onDateChange, placeholder = "날짜 선택", className }: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log("[v0] Date input changed:", value)
    if (value) {
      onDateChange(new Date(value))
    } else {
      onDateChange(undefined)
    }
  }

  const dateValue = date ? date.toISOString().split("T")[0] : ""

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2.5 rounded-md border",
          "bg-white/10 border-white/20 text-white",
          "hover:bg-white/15 hover:border-white/30",
          "focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40",
          "cursor-pointer transition-colors",
          "[color-scheme:dark]",
          // Style the calendar picker indicator
          "[&::-webkit-calendar-picker-indicator]:opacity-100",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:brightness-200",
          "[&::-webkit-calendar-picker-indicator]:scale-110",
          // Style for when no date is selected
          !date && "text-gray-400",
        )}
      />
    </div>
  )
}
