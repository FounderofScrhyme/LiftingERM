"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, X, Users } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import EmployeeSelect from "./employee-select";

interface Employee {
  id: string;
  name: string;
  unitPay: number | null;
  hourlyOvertimePay: number | null;
}

interface DateTimeSelectorProps {
  selectedDate: Date | null;
  dateStartTime: string;
  dateEmployees: Employee[];
  onSelectedDateChange: (date: Date | null) => void;
  onDateStartTimeChange: (time: string) => void;
  onDateEmployeesChange: (employees: Employee[]) => void;
  disabled?: boolean;
}

export default function DateTimeSelector({
  selectedDate,
  dateStartTime,
  dateEmployees,
  onSelectedDateChange,
  onDateStartTimeChange,
  onDateEmployeesChange,
  disabled = false,
}: DateTimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // カレンダーの日付生成
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    return days;
  };
  const days = getDaysInMonth(currentMonth);

  const handleDateClick = (date: Date) => {
    if (disabled) return;
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      onSelectedDateChange(null);
      onDateStartTimeChange("");
      onDateEmployeesChange([]);
    } else {
      onSelectedDateChange(date);
      onDateStartTimeChange("08:30");
      onDateEmployeesChange([]);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  };
  const isDateSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full justify-start"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {selectedDate
            ? `${formatDate(selectedDate)} 選択済み`
            : "現場日と開始時間を選択..."}
        </Button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                disabled={disabled}
              >
                ←
              </Button>
              <h3 className="text-lg font-medium">
                {currentMonth.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                })}
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                disabled={disabled}
              >
                →
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-slate-500"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  disabled={!day.isCurrentMonth || disabled}
                  className={`p-2 text-sm rounded-md transition-colors relative
                    ${
                      day.isCurrentMonth
                        ? isDateSelected(day.date)
                          ? "bg-blue-500 text-white"
                          : isToday(day.date)
                          ? "bg-blue-100 text-blue-800"
                          : "hover:bg-slate-100 text-slate-900"
                        : "text-slate-300"
                    }
                    ${
                      disabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                >
                  {day.date.getDate()}
                  {isDateSelected(day.date) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            {selectedDate && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  選択された現場日と開始時間:
                </Label>
                <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">
                        {formatDate(selectedDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <Input
                        type="time"
                        value={dateStartTime}
                        onChange={(e) => onDateStartTimeChange(e.target.value)}
                        disabled={disabled}
                        className="w-32"
                      />
                    </div>
                    <div className="text-sm text-slate-600">
                      {dateEmployees.length > 0
                        ? `${dateEmployees.length}名のスタッフ`
                        : "スタッフ未選択"}
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white border rounded-lg">
                    <Label className="text-sm font-medium">スタッフ:</Label>
                    <EmployeeSelect
                      value={dateEmployees}
                      onChange={onDateEmployeesChange}
                      placeholder="スタッフを選択..."
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
