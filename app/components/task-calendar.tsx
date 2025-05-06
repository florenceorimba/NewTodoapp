"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DayPicker } from "react-day-picker"
import { useTodoContext, type Task } from "../components/todo-provider"
import { TaskItem } from "../components/task-item"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, isSameDay } from "date-fns"

// Import the CSS for react-day-picker
import "react-day-picker/dist/style.css"

export function TaskCalendar() {
  const { tasks } = useTodoContext()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({})

  // Get tasks for the selected date
  const tasksForSelectedDate = selectedDate
    ? tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
    : []

  // Organize tasks by date for the calendar display
  useEffect(() => {
    const taskMap: Record<string, Task[]> = {}

    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), "yyyy-MM-dd")
        if (!taskMap[dateKey]) {
          taskMap[dateKey] = []
        }
        taskMap[dateKey].push(task)
      }
    })

    setTasksByDate(taskMap)
  }, [tasks])

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

  // Define modifiers for days with tasks
  const modifiers = {
    selected: selectedDate,
    "with-tasks": (date: Date) => {
      const dateKey = format(date, "yyyy-MM-dd")
      return (tasksByDate[dateKey]?.length || 0) > 0
    },
    "with-overdue-tasks": (date: Date) => {
      const dateKey = format(date, "yyyy-MM-dd")
      const tasksForDay = tasksByDate[dateKey] || []
      return tasksForDay.some((task) => !task.completed && new Date(task.dueDate!) < new Date())
    },
  }

  // Define custom CSS for the calendar
  const css = `
    .rdp-day_with-tasks {
      position: relative;
    }
    .rdp-day_with-tasks::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: hsl(var(--primary));
    }
    .rdp-day_with-overdue-tasks::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: hsl(var(--destructive));
    }
  `

  return (
    <div className="grid gap-6 md:grid-cols-[400px_1fr]">
      <Card>
        <CardContent className="p-4 items-center">
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

          <style>{css}</style>

          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={modifiers}
            onDayClick={(day, modifiers) => {
              if (modifiers.selected) {
                setSelectedDate(undefined)
              } else {
                setSelectedDate(day)
              }
            }}
            className="border rounded-md justify-center place-items-center"
            footer={selectedDate && `${tasksForSelectedDate.length} tasks on ${format(selectedDate, "MMM d, yyyy")}`}
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
