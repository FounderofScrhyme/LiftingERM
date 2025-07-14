import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  // const { userId } = await auth();

  // if (!userId) {
  //   return null;
  // }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8">
          {/* 取引先数 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">取引先数</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{/* {clientCount} */}2</div>
              <p className="text-xs text-muted-foreground">登録済み取引先</p>
            </CardContent>
          </Card>

          {/* 今月の売り上げ */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の売上</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* <div className="text-2xl font-bold">
                ¥{formatCurrency(currentMonthAmount)}
              </div>
              <p className={`text-xs ${getSalesChangeColor()}`}>
                {getSalesChangeText()}
              </p> */}
              ¥300,000
            </CardContent>
          </Card>

          {/* 今月の現場数 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">進行中現場</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                現場管理機能は今後実装予定
              </p>
            </CardContent>
          </Card>

          {/* 従業員数 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">従業員数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{/* {employeeCount} */}</div>
              <p className="text-xs text-muted-foreground">登録済み従業員</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>今週の予定</CardTitle>
              <CardDescription>重要な予定と締切を確認</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">システム機能確認</p>
                    <p className="text-xs text-gray-500">随時</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">データバックアップ</p>
                    <p className="text-xs text-gray-500">定期的に</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">機能拡張計画</p>
                    <p className="text-xs text-gray-500">継続中</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
