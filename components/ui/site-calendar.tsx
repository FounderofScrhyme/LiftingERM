"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useRouter } from "next/navigation";

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
    siteDateEmployees?: Array<{
      id: string;
      employee: {
        id: string;
        name: string;
      };
    }>;
  }>;
}

interface SiteCalendarProps {
  sites: Site[];
  selectedDate?: Date | null;
  setSelectedDate?: (date: Date | null) => void;
}

export default function SiteCalendar({
  sites,
  selectedDate,
  setSelectedDate,
}: SiteCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sitesForSelectedDate, setSitesForSelectedDate] = useState<Site[]>([]);
  const router = useRouter();

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
    // ローカル日付（年/月/日）で比較
    const target =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0");
    return sites
      .filter((site) =>
        site.siteDates.some((siteDate) => {
          const d = new Date(siteDate.date);
          const dstr =
            d.getFullYear() +
            "-" +
            (d.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            d.getDate().toString().padStart(2, "0");
          return dstr === target;
        })
      )
      .map((site) => ({
        ...site,
        siteDates: site.siteDates.filter((siteDate) => {
          const d = new Date(siteDate.date);
          const dstr =
            d.getFullYear() +
            "-" +
            (d.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            d.getDate().toString().padStart(2, "0");
          return dstr === target;
        }),
      }));
  };

  // 日付に現場があるかチェック
  const hasSitesOnDate = (date: Date) => {
    return getSitesForDate(date).length > 0;
  };

  // 日付クリック時の処理
  const handleDateClick = (date: Date) => {
    if (setSelectedDate) setSelectedDate(date);
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

  useEffect(() => {
    if (selectedDate) {
      const sitesForDate = getSitesForDate(selectedDate);
      setSitesForSelectedDate(sitesForDate);
    } else {
      setSitesForSelectedDate([]);
    }
  }, [selectedDate, sites]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左側: カレンダー */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
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
                <h3 className="font-medium text-base">
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
                    className="text-center text-xs font-medium text-slate-500 p-1"
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
                      p-1 text-xs rounded-md transition-colors min-h-[40px] flex flex-col items-center justify-center
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
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-0.5"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右側: 現場リスト */}
      <div className="lg:col-span-2">
        {selectedDate ? (
          sitesForSelectedDate.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {formatDate(selectedDate)} の現場 (
                  {sitesForSelectedDate.length}件)
                </CardTitle>
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
                          <h4 className="font-semibold text-lg text-slate-900 mb-3">
                            {site.name}
                          </h4>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span className="font-medium">
                                発注者: {site.client}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">
                                担当者: {site.contactPerson}
                              </span>
                            </div>
                            {site.siteDates.length > 0 &&
                              site.siteDates[0].startTime && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">
                                    開始時間:{" "}
                                    {new Date(
                                      site.siteDates[0].startTime
                                    ).toLocaleTimeString("ja-JP", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              )}
                            {site.siteDates[0]?.siteDateEmployees &&
                              site.siteDates[0].siteDateEmployees.length >
                                0 && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="font-medium text-blue-800 mb-2">
                                    スタッフ:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {site.siteDates[0].siteDateEmployees.map(
                                      (siteDateEmployee) => (
                                        <span
                                          key={siteDateEmployee.id}
                                          className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                          {siteDateEmployee.employee.name}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                              <MapPin className="w-4 h-4" />
                              {site.address}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/sites/${site.id}`, "_blank")
                            }
                          >
                            詳細
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/sites/${site.id}/edit`, "_blank")
                            }
                          >
                            編集
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {formatDate(selectedDate)} の現場
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">
                    この日付に予定されている現場はありません
                  </p>
                  <p className="text-sm mt-2">他の日付を選択してください</p>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">現場スケジュール</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">日付を選択してください</p>
                <p className="text-sm mt-2">
                  左側のカレンダーから日付をクリックして現場を確認できます
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
