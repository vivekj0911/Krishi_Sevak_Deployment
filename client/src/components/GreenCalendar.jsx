import { useState, useEffect } from 'react';

const GreenCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  
  // Get the first day of the month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  
  // Get the number of days in the month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setShowEventForm(false);
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setShowEventForm(false);
  };
  
  const formatDateKey = (year, month, day) => {
    return `${year}-${month + 1}-${day}`;
  };
  
  const handleDayClick = (day) => {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(dateKey);
    setShowEventForm(true);
  };
  
  const addEvent = () => {
    if (newEvent.trim() === '' || !selectedDate) return;
    
    setEvents(prevEvents => ({
      ...prevEvents,
      [selectedDate]: [...(prevEvents[selectedDate] || []), newEvent]
    }));
    
    setNewEvent('');
  };
  
  const removeEvent = (dateKey, index) => {
    setEvents(prevEvents => ({
      ...prevEvents,
      [dateKey]: prevEvents[dateKey].filter((_, i) => i !== index)
    }));
  };
  
  // Create calendar grid
  const renderCalendarDays = () => {
    const blanks = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(<div key={`blank-${i}`} className="p-2 text-center"></div>);
    }
    
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), d);
      const hasEvents = events[dateKey] && events[dateKey].length > 0;
      const isSelected = selectedDate === dateKey;
      const isToday = new Date().getDate() === d && 
                       new Date().getMonth() === currentDate.getMonth() &&
                       new Date().getFullYear() === currentDate.getFullYear();
      
      days.push(
        <div 
          key={`day-${d}`} 
          className={`flex flex-col justify-between p-2 text-center cursor-pointer rounded-lg transition-all duration-200 h-12 
          ${isSelected ? 'bg-green-100 border-green-500 shadow-md transform scale-105' : 
            isToday ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-gray-50'}`}
          onClick={() => handleDayClick(d)}
        >
          <span 
            className={`${isToday ? 'font-bold text-emerald-600' : ''} 
                       ${isSelected ? 'font-semibold text-green-700' : ''}`}
          >
            {d}
          </span>
          {hasEvents && (
            <div className="flex justify-center space-x-1 mt-1">
              {[...Array(Math.min(3, events[dateKey].length))].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${
                  isSelected ? 'bg-green-600' : 'bg-teal-500'
                }`}></div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return [...blanks, ...days];
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Calendar header with gradient background */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div className="text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 px-4 py-3 bg-green-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-green-800 font-medium text-sm">{day}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 p-4 bg-white">
        {renderCalendarDays()}
      </div>
      
      {/* Event management section - slide in from bottom when a date is selected */}
      <div className={`transition-all duration-300 overflow-hidden ${
        showEventForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 border-t border-gray-200 bg-green-50">
          {selectedDate && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-green-800">
                  Events for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h3>
                <button 
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Add new event */}
              <div className="flex mb-4">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add new event"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                />
                <button 
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-r-lg hover:from-green-700 hover:to-emerald-600 transition-colors"
                  onClick={addEvent}
                >
                  Add
                </button>
              </div>
              
              {/* Event list */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {events[selectedDate] && events[selectedDate].length > 0 ? (
                  events[selectedDate].map((event, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500 group hover:shadow-md transition-shadow"
                    >
                      <span className="text-gray-800">{event}</span>
                      <button 
                        className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                        onClick={() => removeEvent(selectedDate, index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-green-200 mb-2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p className="text-center italic">No events scheduled for this date.</p>
                    <p className="text-sm text-center">Add an event to get started!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreenCalendar;