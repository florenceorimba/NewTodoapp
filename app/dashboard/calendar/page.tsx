import { TaskCalendar } from "../../components/task-calendar"

export default function CalendarPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View your tasks organized by date.</p>
      </div>

      <TaskCalendar />
    </div>
  )
}
