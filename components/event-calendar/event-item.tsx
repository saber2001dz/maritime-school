"use client"

import { useMemo } from "react"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { format, getMinutes, isPast } from "date-fns"

import { cn } from "@/lib/utils"
import {
  getBorderRadiusClasses,
  getEventColorClasses,
  type CalendarEvent,
} from "@/components/event-calendar"

// Using date-fns format with custom formatting:
// 'HH' - hours (00-23)
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date) => {
  return format(date, getMinutes(date) === 0 ? "HH" : "HH:mm")
}

interface EventWrapperProps {
  event: CalendarEvent
  isFirstDay?: boolean
  isLastDay?: boolean
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  children: React.ReactNode
  currentTime?: Date
  dndListeners?: SyntheticListenerMap
  dndAttributes?: DraggableAttributes
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventWrapperProps) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime())
      )
    : new Date(event.end)

  const isEventInPast = isPast(displayEnd)

  // Filter out onClick from dndListeners to prevent interference with onDoubleClick
  const filteredDndListeners = useMemo(() => {
    if (!dndListeners) return undefined
    const { onClick: _onClick, ...rest } = dndListeners as any
    return rest
  }, [dndListeners])

  return (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
        getEventColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...filteredDndListeners}
      {...dndAttributes}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={onClick}
    >
      {children}
    </button>
  )
}

interface EventItemProps {
  event: CalendarEvent
  view: "month" | "week" | "day" | "agenda"
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  currentTime?: Date // For updating time during drag
  isFirstDay?: boolean
  isLastDay?: boolean
  children?: React.ReactNode
  className?: string
  dndListeners?: SyntheticListenerMap
  dndAttributes?: DraggableAttributes
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const eventColor = event.color

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start)
  }, [currentTime, event.start])

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(
          new Date(currentTime).getTime() +
            (new Date(event.end).getTime() - new Date(event.start).getTime())
        )
      : new Date(event.end)
  }, [currentTime, event.start, event.end])

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "mt-(--event-gap) h-(--event-height) items-center text-[10px] sm:text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children || (
          <span className="truncate">
            {event.title}
          </span>
        )}
      </EventWrapper>
    )
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "py-1",
          view === "week" ? "text-[10px] sm:text-xs text-center!" : "text-xs",
          view === "day" && "max-w-[200px]",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div
          className={cn(
            "font-medium h-full w-full flex",
            view === "week" ? "items-center justify-center whitespace-nowrap" : "items-start justify-start px-1 truncate"
          )}
        >
          <span
            style={view === "week" ? {
              transform: "rotate(-90deg)",
              display: "inline-block",
            } : undefined}
          >
            {event.title}
          </span>
        </div>
      </EventWrapper>
    )
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 text-right transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventColor),
        className
      )}
      data-past-event={isPast(new Date(event.end)) || undefined}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="text-sm font-medium">{event.title}</div>
      <div className="text-xs opacity-70">
        {event.allDay ? (
          <span>All day</span>
        ) : (
          <span className="uppercase">
            {formatTimeWithOptionalMinutes(displayStart)} -{" "}
            {formatTimeWithOptionalMinutes(displayEnd)}
          </span>
        )}
        {event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{event.location}</span>
          </>
        )}
      </div>
      {event.description && (
        <div className="my-1 text-xs opacity-90 leading-relaxed">
          {event.description.split(' • ').map((part, index, array) => {
            const [label, ...valueParts] = part.split(': ')
            const value = valueParts.join(': ')
            return (
              <span key={index}>
                <span className="font-semibold">{label}</span>
                {value && <>: {value}</>}
                {index < array.length - 1 && <span className="px-2 opacity-50">•</span>}
              </span>
            )
          })}
        </div>
      )}
    </button>
  )
}
