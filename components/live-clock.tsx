"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-center mb-8 p-6 bg-card border border-border rounded-lg">
      <div className="text-5xl font-bold text-foreground font-mono tracking-tight">
        {format(currentTime, "HH:mm:ss")}
      </div>
      <div className="text-xl text-muted-foreground mt-2">
        {format(currentTime, "yyyy년 M월 d일 EEEE", { locale: ko })}
      </div>
    </div>
  )
}
