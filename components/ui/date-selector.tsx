"use client";

import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "./button";

interface DateSelectorProps {
  value: Date[];
  onChange: (dates: Date[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function DateSelector({
  value,
  onChange,
  placeholder = "現場日を選択...",
  disabled = false,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // カレンダーの日付を生成
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    // 前月の日付
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    // 当月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    // 次月の日付（6週分になるように）
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

    const dateString = date.toDateString();
    const isSelected = value.some((d) => d.toDateString() === dateString);

    if (isSelected) {
      // 選択解除
      onChange(value.filter((d) => d.toDateString() !== dateString));
    } else {
      // 選択追加
      onChange([...value, date]);
    }
  };

  const handleRemoveDate = (dateToRemove: Date) => {
    onChange(
      value.filter((d) => d.toDateString() !== dateToRemove.toDateString())
    );
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
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  const isDateSelected = (date: Date) => {
    return value.some((d) => d.toDateString() === date.toDateString());
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
          {value.length > 0 ? `${value.length}日選択済み` : placeholder}
        </Button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-80 bg-white border border-slate-200 rounded-md shadow-lg p-4">
            {/* カレンダーヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
              >
                ←
              </Button>
              <h3 className="font-medium">
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
              >
                →
              </Button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-slate-500 p-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  disabled={!day.isCurrentMonth || disabled}
                  className={`
                    p-2 text-sm rounded-md transition-colors
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
                    }
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* 選択された日付の表示 */}
            {value.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  選択された日付:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {value.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{formatDate(date)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(date)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={disabled}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* クリックアウトで閉じる */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
