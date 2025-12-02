"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "날짜 선택",
  className,
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("[DatePicker] Date input changed:", value);
    if (value) {
      // Create date at local timezone
      const selectedDate = new Date(value + "T00:00:00");
      console.log("[DatePicker] Selected date:", selectedDate);
      onDateChange(selectedDate);
    } else {
      onDateChange(undefined);
    }
  };

  const dateValue = date ? date.toISOString().split("T")[0] : "";

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 px-3 py-2 rounded-md border text-sm",
          "bg-background border-border text-foreground",
          "hover:bg-muted/50",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "cursor-pointer transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-calendar-picker-indicator]:opacity-100",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          !date && "text-muted-foreground"
        )}
      />
    </div>
  );
}
