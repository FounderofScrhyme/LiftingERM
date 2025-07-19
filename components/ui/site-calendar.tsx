"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface Site {
  id: string;
  name: string;
  client: string;
  contactPerson: string;
  address: string;
  employeeNames?: string;
  siteDates: Array<{
    id: string;
    date: string;
    startTime?: string;
    endTime?: string;
  }>;
}

interface SiteCalendarProps {
  sites: Site[];
}

export default function SiteCalendar({ sites }: SiteCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sitesForSelectedDate, setSitesForSelectedDate] = useState<Site[]>([]);

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

  // 指定された日付の現場を取得
  const getSitesForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return sites.filter((site) =>
      site.siteDates.some((siteDate) => siteDate.date.startsWith(dateString))
    );
  };

  // 日付に現場があるかチェック
  const hasSitesOnDate = (date: Date) => {
    return getSitesForDate(date).length > 0;
  };

  // 日付クリック時の処理
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const sitesForDate = getSitesForDate(date);
    setSitesForSelectedDate(sitesForDate);
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* カレンダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            現場スケジュール
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* カレンダーヘッダー */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-medium text-lg">
                {currentMonth.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                })}
              </h3>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-slate-500 p-2"
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
                  disabled={!day.isCurrentMonth}
                  className={`
                    p-2 text-sm rounded-md transition-colors min-h-[60px] flex flex-col items-center justify-center
                    ${
                      day.isCurrentMonth
                        ? isSelected(day.date)
                          ? "bg-blue-500 text-white"
                          : isToday(day.date)
                          ? "bg-blue-100 text-blue-800"
                          : hasSitesOnDate(day.date)
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "hover:bg-slate-100 text-slate-900"
                        : "text-slate-300"
                    }
                    ${
                      !day.isCurrentMonth
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <span>{day.date.getDate()}</span>
                  {day.isCurrentMonth && hasSitesOnDate(day.date) && (
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-1"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 選択された日付の現場詳細 */}
      {selectedDate && sitesForSelectedDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{formatDate(selectedDate)} の現場</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sitesForSelectedDate.map((site) => (
                <div
                  key={site.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-slate-900 mb-2">
                        {site.name}
                      </h4>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{site.client}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            担当者: {site.contactPerson}
                            {site.employeeNames && (
                              <span className="ml-2">
                                (派遣: {site.employeeNames})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {site.address}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/sites/${site.id}`, "_blank")}
                    >
                      詳細
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 選択された日付に現場がない場合 */}
      {selectedDate && sitesForSelectedDate.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{formatDate(selectedDate)} の現場</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              この日付に予定されている現場はありません
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
