"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import SiteCalendar from "./site-calendar";
import { Card, CardContent } from "./card";
import { Loader } from "./loader";

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

export interface SiteCalendarWrapperProps {
  selectedDate?: Date | null;
  setSelectedDate?: (date: Date | null) => void;
}

export default function SiteCalendarWrapper({
  selectedDate,
  setSelectedDate,
}: SiteCalendarWrapperProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get("/api/sites");
        setSites(response.data.sites || []);
      } catch (error: any) {
        console.error("Error fetching sites for calendar:", error);
        setError(
          error.response?.data?.message || "現場情報の取得に失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <Loader className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              再試行
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <SiteCalendar
      sites={sites}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
  );
}
