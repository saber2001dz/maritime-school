"use client"

import { useRef, useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { differenceInDays } from "date-fns"

import {
  CalendarEvent,
  EventItem,
  useCalendarDnd,
} from "@/components/event-calendar"

interface DraggableEventProps {
  event: CalendarEvent
  view: "month" | "week" | "day"
  showTime?: boolean
  onClick?: (e: React.MouseEvent) => void
  height?: number
  isMultiDay?: boolean
  multiDayWidth?: number
  isFirstDay?: boolean
  isLastDay?: boolean
  "aria-hidden"?: boolean | "true" | "false"
}

export function DraggableEvent({
  event,
  view,
  showTime,
  onClick,
  height,
  isMultiDay,
  multiDayWidth,
  isFirstDay = true,
  isLastDay = true,
  "aria-hidden": ariaHidden,
}: DraggableEventProps) {
  const { activeId } = useCalendarDnd()
  const elementRef = useRef<HTMLDivElement>(null)
  const [dragHandlePosition, setDragHandlePosition] = useState<{
    x: number
    y: number
  } | null>(null)

  // Double-click detection
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if this is a multi-day event
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  const isMultiDayEvent =
    isMultiDay || event.allDay || differenceInDays(eventEnd, eventStart) >= 1

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${event.id}-${view}`,
      data: {
        event,
        view,
        height: height || elementRef.current?.offsetHeight || null,
        isMultiDay: isMultiDayEvent,
        multiDayWidth: multiDayWidth,
        dragHandlePosition,
        isFirstDay,
        isLastDay,
      },
    })

  // Handle mouse down to track position for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Track position for dragging
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      setDragHandlePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    // Increment click count
    clickCountRef.current += 1

    if (clickCountRef.current === 1) {
      // First click - start timer
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, 300)
    } else if (clickCountRef.current === 2) {
      // Second click within 300ms - it's a double-click
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }
      clickCountRef.current = 0

      // Stop propagation to prevent drag
      e.stopPropagation()
      e.preventDefault()

      // Trigger onClick handler
      if (onClick) {
        // Small delay to ensure drag is not started
        setTimeout(() => {
          onClick(e)
        }, 0)
      }
    }
  }

  // Handle double-click event (native event as backup)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Trigger onClick handler
    if (onClick) {
      onClick(e)
    }
  }

  // Don't render if this event is being dragged
  if (isDragging || activeId === `${event.id}-${view}`) {
    return (
      <div
        ref={setNodeRef}
        className="opacity-0"
        style={{ height: height || "auto" }}
      />
    )
  }

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        height: height || "auto",
        width:
          isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      }
    : {
        height: height || "auto",
        width:
          isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      }

  // Handle touch start to track where on the event the user touched
  const handleTouchStart = (e: React.TouchEvent) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      if (touch) {
        setDragHandlePosition({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        })
      }
    }
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (elementRef) elementRef.current = node
      }}
      style={style}
      className="touch-none"
    >
      <EventItem
        event={event}
        view={view}
        showTime={showTime}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        dndListeners={listeners}
        dndAttributes={attributes}
        aria-hidden={ariaHidden}
      />
    </div>
  )
}
