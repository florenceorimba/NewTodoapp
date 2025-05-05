"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useTodoContext, type Task } from "../components/todo-provider"
import { TaskItem } from "../components/task-item"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, isSameDay } from "date-fns"

export function TaskCalendar() {
  const { tasks } = useTodoContext()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date>(new Date())

  // Get tasks for the selected date
  const tasksForSelectedDate = selectedDate
    ? tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
    : []

  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    if (!date || isNaN(date.getTime())) {
      return [] // Return empty array for invalid dates
    }
    return tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date))
  }

  // Custom day render function for the calendar
  const renderDay = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return <div>Invalid</div> // Handle invalid date
    }

    const tasksForDay = getTasksForDate(date)
    const hasOverdueTasks = tasksForDay.some((task) => !task.completed && new Date(task.dueDate!) < new Date())

    return (
      <div className="relative">
        <div>{format(date, "d")}</div>
        {tasksForDay.length > 0 && (
          <Badge
            variant={hasOverdueTasks ? "destructive" : "secondary"}
            className="absolute bottom-0 right-0 -mr-1 -mb-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]"
          >
            {tasksForDay.length}
          </Badge>
        )}
      </div>
    )
  }

  const handlePreviousMonth = () => {
    setMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
  }

  const handleNextMonth = () => {
    setMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[400px_1fr]">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">{format(month, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            components={{
              Day: ({ date, ...dayProps }) => {
                // Filter out any custom props that shouldn't be passed to DOM elements
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { displayMonth: _, ...domSafeProps } = dayProps

                return (
                  <Button
                    variant="ghost"
                    {...domSafeProps}
                    className="h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                  >
                    {renderDay(date)}
                  </Button>
                )
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {selectedDate ? (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Tasks for {format(selectedDate, "MMMM d, yyyy")}</h2>

              {tasksForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground">No tasks scheduled for this day.</p>
              ) : (
                <div className="space-y-3">
                  {tasksForSelectedDate.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Select a date to view tasks.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
