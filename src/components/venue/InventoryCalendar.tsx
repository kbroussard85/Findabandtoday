'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export function InventoryCalendar() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDayClick = (day: Date) => {
    const dateExists = selectedDates.some(d => d.getTime() === day.getTime());
    let newDates;
    if (dateExists) {
      newDates = selectedDates.filter(d => d.getTime() !== day.getTime());
    } else {
      newDates = [...selectedDates, day];
    }
    setSelectedDates(newDates);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-black">
      <h3 className="text-xl font-bold mb-4 w-full text-left">Your Open Dates</h3>
      <p className="text-sm text-gray-500 mb-4 w-full text-left">Click dates to toggle your venue's availability.</p>
      <DayPicker 
        mode="multiple"
        selected={selectedDates}
        onDayClick={handleDayClick}
        className="text-black"
      />
    </div>
  );
}
