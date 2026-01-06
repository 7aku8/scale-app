"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, Thermometer } from "lucide-react";

// Tymczasowy fetcher (później podmienisz na realny URL)
const fetchMeasurements = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/measurements`);
    if (!res.ok) throw new Error("Network error");
    return res.json();
  } catch (e) {
    console.error(e);
    return []; // Zwróć pustą tablicę przy błędzie, żeby nie wywaliło apki
  }
};

export default function Home() {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["measurements"],
    queryFn: fetchMeasurements,
    refetchInterval: 5000,
  });

  const chartData = rawData?.map((item: any) => ({
    ...item,
    // Formatujemy godzinę dla osi X
    timeFormatted: format(new Date(item.time), "HH:mm"),
  })).reverse() || [];

  const currentWeight = rawData?.[0]?.weight ?? 0;
  // Oblicz zmianę (prosty mock, w przyszłości policzysz to na backendzie)
  const previousWeight = rawData?.[1]?.weight ?? currentWeight;
  const trend = currentWeight - previousWeight;

  return (
    <DashboardLayout>
      {/* KARTY KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średnia Waga</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeight} kg</div>
            <p className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(2)} kg od ostatniego pomiaru
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5°C</div>
            <p className="text-xs text-muted-foreground">W normie</p>
          </CardContent>
        </Card>
      </div>

      {/* GŁÓWNY WYKRES */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card className="col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Przyrost dobowy</CardTitle>
            <CardDescription>
              Wizualizacja trendu wagi w ciągu ostatnich godzin.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Ładowanie danych...
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Brak danych z wagi. Podłącz urządzenie.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="timeFormatted"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}kg`}
                      domain={['auto', 'auto']} // Skalowanie auto
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#0f172a"
                      fillOpacity={1}
                      fill="url(#colorWeight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
