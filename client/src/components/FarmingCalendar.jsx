"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"

const FarmingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Mock events data - in a real app, this would come from an API
  const events = [
    {
      id: 1,
      title: "Wheat Planting",
      date: new Date(2023, 4, 15), // May 15, 2023
      type: "planting",
    },
    {
      id: 2,
      title: "Fertilizer Application",
      date: new Date(2023, 4, 20), // May 20, 2023
      type: "maintenance",
    },
    {
      id: 3,
      title: "Irrigation Check",
      date: new Date(2023, 4, 25), // May 25, 2023
      type: "maintenance",
    },
    {
      id: 4,
      title: "Pest Control",
      date: new Date(2023, 5, 5), // June 5, 2023
      type: "maintenance",
    },
    {
      id: 5,
      title: "Rice Harvesting",
      date: new Date(2023, 5, 15), // June 15, 2023
      type: "harvesting",
    },
  ]

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const firstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date &&
        event.date.getMonth() === currentMonth &&
        event.date.getFullYear() === currentYear,
    )
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case "planting":
        return "bg-green-500"
      case "harvesting":
        return "bg-amber-500"
      case "maintenance":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const renderCalendar = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth, currentYear)
    const firstDay = firstDayOfMonth(currentMonth, currentYear)

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const eventsForDay = getEventsForDate(day)
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear()

      days.push(
        <div
          key={day}
          className={`h-10 flex flex-col items-center justify-center relative ${
            isToday ? "bg-green-50 rounded-full font-bold text-green-600" : ""
          }`}
        >
          <span>{day}</span>
          {eventsForDay.length > 0 && (
            <div className="absolute bottom-1 flex space-x-1">
              {eventsForDay.map((event) => (
                <div
                  key={event.id}
                  className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`}
                  title={event.title}
                ></div>
              ))}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, 3)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Farming Calendar</h3>
          <div className="flex items-center">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full mr-2">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <span className="font-medium">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full ml-2">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={index} className="text-center font-medium text-gray-500 text-sm">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>

        {/* Upcoming Events */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Upcoming Events</h4>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getEventTypeColor(event.type)}`}></div>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.date.toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No upcoming events</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FarmingCalendar

