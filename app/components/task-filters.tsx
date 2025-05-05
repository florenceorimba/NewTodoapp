"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTodoContext, type TaskFilters } from "../components/todo-provider"
import { CalendarDays, Check, CircleSlash, FilterX, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TaskFilters() {
  const { filterTasks, categories, activeFilters, clearFilters } = useTodoContext()

  const handleStatusChange = (value: string) => {
    filterTasks({ status: value as TaskFilters["status"] })
  }

  const handlePriorityChange = (value: string) => {
    filterTasks({ priority: value as TaskFilters["priority"] })
  }

  const handleCategoryChange = (value: string) => {
    filterTasks({ categoryId: value })
  }

  const handleDueDateChange = (value: string) => {
    filterTasks({ dueDate: value as TaskFilters["dueDate"] })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
            <FilterX className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>
        <CardDescription>Filter tasks by different criteria</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            <Label className="text-sm font-medium">Status</Label>
          </div>
          <RadioGroup defaultValue="all" value={activeFilters.status} onValueChange={handleStatusChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="status-completed" />
              <Label htmlFor="status-completed">Completed</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <CircleSlash className="mr-2 h-4 w-4" />
            <Label className="text-sm font-medium">Priority</Label>
          </div>
          <Select value={activeFilters.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            <Label className="text-sm font-medium">Category</Label>
          </div>
          <Select value={activeFilters.categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            <Label className="text-sm font-medium">Due Date</Label>
          </div>
          <RadioGroup defaultValue="all" value={activeFilters.dueDate} onValueChange={handleDueDateChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="date-all" />
              <Label htmlFor="date-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="today" id="date-today" />
              <Label htmlFor="date-today">Today</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="week" id="date-week" />
              <Label htmlFor="date-week">This week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="month" id="date-month" />
              <Label htmlFor="date-month">This month</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}
