"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SiteList from "@/components/tables/SiteList";
import SiteCalendarWrapper from "@/components/ui/site-calendar-wrapper";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SitesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">現場管理</h2>
            <p className="text-slate-500 text-sm mt-2">
              現場一覧を管理・作成できます。
            </p>
          </div>
          <Button
            onClick={() => {
              if (selectedDate) {
                const y = selectedDate.getFullYear();
                const m = (selectedDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const d = selectedDate.getDate().toString().padStart(2, "0");
                window.location.href = `/sites/new?date=${y}-${m}-${d}`;
              } else {
                window.location.href = "/sites/new";
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            新規現場登録
          </Button>
        </div>

        {/* タブ切り替え */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-2 ${
                  activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setActiveTab("list")}
              >
                <List className="w-4 h-4" />
                月次一覧表示
              </button>
              <button
                className={`border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-2 ${
                  activeTab === "calendar"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="w-4 h-4" />
                カレンダー表示
              </button>
            </nav>
          </div>
        </div>

        {/* 一覧表示 */}
        {activeTab === "list" && (
          <div>
            <SiteList />
          </div>
        )}

        {/* カレンダー表示 */}
        {activeTab === "calendar" && (
          <div className="max-w-6xl mx-auto">
            <SiteCalendarWrapper
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
