"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { X, Search, User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  phone: string;
  unitPay: number;
  hourlyOvertimePay: number;
}

interface SelectedEmployee {
  id: string;
  name: string;
  unitPay: number;
  hourlyOvertimePay: number;
}

interface EmployeeSelectProps {
  value: SelectedEmployee[];
  onChange: (value: SelectedEmployee[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function EmployeeSelect({
  value,
  onChange,
  placeholder = "スタッフを検索...",
  disabled = false,
}: EmployeeSelectProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // スタッフ一覧を取得
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data.employees || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // 検索フィルタリング
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees([]);
      return;
    }

    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !value.some((selected) => selected.id === employee.id)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees, value]);

  // クリックアウトでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEmployee = (employee: Employee) => {
    if (!value.some((selected) => selected.id === employee.id)) {
      const selectedEmployee: SelectedEmployee = {
        id: employee.id,
        name: employee.name,
        unitPay: employee.unitPay,
        hourlyOvertimePay: employee.hourlyOvertimePay,
      };
      onChange([...value, selectedEmployee]);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    onChange(value.filter((employee) => employee.id !== employeeId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <div className="relative">
        <div className="flex items-center gap-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="pl-10"
          />
        </div>

        {/* ドロップダウン */}
        {isOpen && filteredEmployees.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => handleSelectEmployee(employee)}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <div className="font-medium">{employee.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ローディング状態 */}
        {isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-4 text-center text-slate-500">
            読み込み中...
          </div>
        )}
      </div>

      {/* 選択されたスタッフの表示 */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">
            選択されたスタッフ:
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <User className="w-4 h-4" />
                <span>{employee.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmployee(employee.id)}
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
  );
}
