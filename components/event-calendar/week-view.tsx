"use client"

import React, { useMemo } from "react"
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns"

import { cn } from "@/lib/utils"
import {
  DraggableEvent,
  DroppableCell,
  EventItem,
  useCurrentTimeIndicator,
  WeekCellsHeight,
  type CalendarEvent,
} from "@/components/event-calendar"
import { EndHour, StartHour } from "@/components/event-calendar/constants"
import { getArabicDayName } from "@/lib/calendar-locale"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate?: (startTime: Date) => void
}

interface PositionedEvent {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  )

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate)
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    })
  }, [currentDate])

  // Get all-day events for the week (only explicitly marked as all-day)
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Include only explicitly marked all-day events
        return event.allDay === true
      })
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return days.some(
          (day) =>
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd)
        )
      })
  }, [events, days])

  // Process events for each day to calculate positions
  const processedDayEvents = useMemo(() => {
    const result = days.map((day) => {
      // Get events for this day that are not explicitly all-day events
      const dayEvents = events.filter((event) => {
        // Skip only explicitly marked all-day events
        if (event.allDay === true) return false

        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        const dayStart = startOfDay(day)
        const dayEnd = addHours(dayStart, 24)

        // Check if event overlaps with this day at all
        // Event is on this day if:
        // 1. It starts on this day
        // 2. It ends on this day
        // 3. It started before this day and ends after this day (spanning this day)
        return (
          (eventStart >= dayStart && eventStart < dayEnd) || // Starts on this day
          (eventEnd > dayStart && eventEnd <= dayEnd) || // Ends on this day
          (eventStart < dayStart && eventEnd > dayEnd) // Spans entire day
        )
      })

      // Sort events by start time and duration
      const sortedEvents = [...dayEvents].sort((a, b) => {
        const aStart = new Date(a.start)
        const bStart = new Date(b.start)
        const aEnd = new Date(a.end)
        const bEnd = new Date(b.end)

        // First sort by start time
        if (aStart < bStart) return -1
        if (aStart > bStart) return 1

        // If start times are equal, sort by duration (longer events first)
        const aDuration = differenceInMinutes(aEnd, aStart)
        const bDuration = differenceInMinutes(bEnd, bStart)
        return bDuration - aDuration
      })

      // Calculate positions for each event
      const positionedEvents: PositionedEvent[] = []
      const dayStart = startOfDay(day)

      // Track columns for overlapping events
      const columns: { event: CalendarEvent; end: Date; adjustedStart: Date; adjustedEnd: Date }[][] = []
      const eventColumnMap = new Map<string, number>()

      // First pass: assign columns to events
      sortedEvents.forEach((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // Adjust start and end times if they're outside this day
        // For multi-day events, show them within working hours (StartHour to EndHour)
        let adjustedStart: Date
        let adjustedEnd: Date

        if (isSameDay(day, eventStart)) {
          // Event starts on this day - use actual start time
          adjustedStart = eventStart
        } else {
          // Event started on a previous day - show from StartHour
          adjustedStart = addHours(dayStart, StartHour)
        }

        if (isSameDay(day, eventEnd)) {
          // Event ends on this day - use actual end time
          adjustedEnd = eventEnd
        } else {
          // Event continues to next day - show until EndHour
          adjustedEnd = addHours(dayStart, EndHour)
        }

        // Find a column for this event
        let columnIndex = 0
        let placed = false

        while (!placed) {
          const col = columns[columnIndex] || []
          if (col.length === 0) {
            columns[columnIndex] = col
            placed = true
          } else {
            const overlaps = col.some((c) =>
              areIntervalsOverlapping(
                { start: adjustedStart, end: adjustedEnd },
                {
                  start: c.adjustedStart,
                  end: c.adjustedEnd,
                }
              )
            )
            if (!overlaps) {
              placed = true
            } else {
              columnIndex++
            }
          }
        }

        // Ensure column is initialized before pushing
        const currentColumn = columns[columnIndex] || []
        columns[columnIndex] = currentColumn
        currentColumn.push({ event, end: adjustedEnd, adjustedStart, adjustedEnd })
        eventColumnMap.set(event.id, columnIndex)
      })

      // Second pass: calculate positions with equal width distribution
      sortedEvents.forEach((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // Adjust start and end times (same logic as before)
        let adjustedStart: Date
        let adjustedEnd: Date

        if (isSameDay(day, eventStart)) {
          adjustedStart = eventStart
        } else {
          adjustedStart = addHours(dayStart, StartHour)
        }

        if (isSameDay(day, eventEnd)) {
          adjustedEnd = eventEnd
        } else {
          adjustedEnd = addHours(dayStart, EndHour)
        }

        // Calculate top position and height
        const startHour =
          getHours(adjustedStart) + getMinutes(adjustedStart) / 60
        const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60

        const top = (startHour - StartHour) * WeekCellsHeight
        const height = (endHour - startHour) * WeekCellsHeight

        const columnIndex = eventColumnMap.get(event.id) ?? 0

        // Find the maximum number of overlapping columns for this event's time range
        let maxOverlappingColumns = 1
        for (let i = 0; i < columns.length; i++) {
          const hasOverlap = columns[i].some((c) =>
            areIntervalsOverlapping(
              { start: adjustedStart, end: adjustedEnd },
              { start: c.adjustedStart, end: c.adjustedEnd }
            )
          )
          if (hasOverlap) {
            maxOverlappingColumns = Math.max(maxOverlappingColumns, i + 1)
          }
        }

        // Equal width distribution: divide by number of overlapping columns
        const width = 1 / maxOverlappingColumns
        const left = columnIndex / maxOverlappingColumns

        positionedEvents.push({
          event,
          top,
          height,
          left,
          width,
          zIndex: 10 + columnIndex,
        })
      })

      return positionedEvents
    })

    return result
  }, [days, events])

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const showAllDaySection = allDayEvents.length > 0
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week"
  )

  return (
    <div data-slot="week-view" className="flex h-full flex-col">
      <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-8 border-b backdrop-blur-md">
        <div className="text-muted-foreground/70 py-2 text-center text-sm">
          <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
        </div>
        {days.map((day, index) => (
          <div
            key={day.toString()}
            className="text-muted-foreground/70 py-2 text-center text-sm"
            data-today={isToday(day) || undefined}
          >
            <span className="sm:hidden" aria-hidden="true">
              {getArabicDayName(index, "short")} {format(day, "d")}
            </span>
            <span className="max-sm:hidden">
              {getArabicDayName(index, "abbreviated")} {format(day, "dd")}
            </span>
          </div>
        ))}
      </div>

      {showAllDaySection && (
        <div className="border-border/70 bg-muted/50 border-b">
          <div className="grid grid-cols-8">
            <div className="border-border/70 relative border-r">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            {days.map((day, dayIndex) => {
              const dayAllDayEvents = allDayEvents.filter((event) => {
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)
                return (
                  isSameDay(day, eventStart) ||
                  (day > eventStart && day < eventEnd) ||
                  isSameDay(day, eventEnd)
                )
              })

              return (
                <div
                  key={day.toString()}
                  className="border-border/70 relative border-r p-1"
                  data-today={isToday(day) || undefined}
                >
                  {dayAllDayEvents.map((event) => {
                    const eventStart = new Date(event.start)
                    const eventEnd = new Date(event.end)
                    const isFirstDay = isSameDay(day, eventStart)
                    const isLastDay = isSameDay(day, eventEnd)

                    // Check if this is the first day in the current week view
                    const isFirstVisibleDay =
                      dayIndex === 0 && isBefore(eventStart, weekStart)
                    const shouldShowTitle = isFirstDay || isFirstVisibleDay

                    return (
                      <EventItem
                        key={`spanning-${event.id}`}
                        onClick={(e) => handleEventClick(event, e)}
                        event={event}
                        view="month"
                        isFirstDay={isFirstDay}
                        isLastDay={isLastDay}
                      >
                        {/* Show title if it's the first day of the event or the first visible day in the week */}
                        <div
                          className={cn(
                            "truncate",
                            !shouldShowTitle && "invisible"
                          )}
                          aria-hidden={!shouldShowTitle}
                        >
                          {event.title}
                        </div>
                      </EventItem>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-8 overflow-hidden">
        <div className="border-border/70 grid auto-cols-fr border-r">
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative min-h-(--week-cells-height) border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {format(hour, "HH:mm")}
                </span>
              )}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={day.toString()}
            className="border-border/70 relative grid auto-cols-fr border-r"
            data-today={isToday(day) || undefined}
          >
            {/* Positioned events */}
            {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
              <div
                key={positionedEvent.event.id}
                className="absolute z-10 px-0.5"
                style={{
                  top: `${positionedEvent.top}px`,
                  height: `${positionedEvent.height}px`,
                  left: `${positionedEvent.left * 100}%`,
                  width: `${positionedEvent.width * 100}%`,
                  zIndex: positionedEvent.zIndex,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full w-full">
                  <DraggableEvent
                    event={positionedEvent.event}
                    view="week"
                    onClick={(e) => handleEventClick(positionedEvent.event, e)}
                    showTime
                    height={positionedEvent.height}
                  />
                </div>
              </div>
            ))}

            {/* Current time indicator - only show for today's column */}
            {currentTimeVisible && isToday(day) && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="relative flex items-center">
                  <div
                    className="h-0.5 w-full border-t-2 border-dashed border-primary/40"
                    style={{ borderTopWidth: '1px' }}
                  ></div>
                  <div className="bg-primary/40 absolute -right-1 h-2 w-2 rounded-full"></div>
                </div>
              </div>
            )}
            {hours.map((hour) => {
              const hourValue = getHours(hour)
              return (
                <div
                  key={hour.toString()}
                  className="border-border/70 relative min-h-(--week-cells-height) border-b last:border-b-0"
                >
                  {/* Quarter-hour intervals */}
                  {[0, 1, 2, 3].map((quarter) => {
                    const quarterHourTime = hourValue + quarter * 0.25
                    return (
                      <DroppableCell
                        key={`${hour.toString()}-${quarter}`}
                        id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                        date={day}
                        time={quarterHourTime}
                        className={cn(
                          "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                          quarter === 0 && "top-0",
                          quarter === 1 &&
                            "top-[calc(var(--week-cells-height)/4)]",
                          quarter === 2 &&
                            "top-[calc(var(--week-cells-height)/4*2)]",
                          quarter === 3 &&
                            "top-[calc(var(--week-cells-height)/4*3)]"
                        )}
                        onDoubleClick={onEventCreate ? () => {
                          const startTime = new Date(day)
                          startTime.setHours(hourValue)
                          startTime.setMinutes(quarter * 15)
                          onEventCreate(startTime)
                        } : undefined}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
