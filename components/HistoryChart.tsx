"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Checkin } from "@/lib/types";
import { formatShortDate } from "@/lib/date";

type Props = {
  data: Checkin[];
  height?: number;
};

export function HistoryChart({ data, height = 320 }: Props) {
  const chartData = data.map((d) => ({
    date: formatShortDate(d.date),
    Mood: d.mood,
    Anxiety: d.anxiety,
    Sleep: d.sleep,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
        >
          <CartesianGrid
            stroke="#5a7d6b"
            strokeOpacity={0.08}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#2c3e35"
            tick={{ fill: "#2c3e35", fontSize: 11, opacity: 0.6 }}
            axisLine={{ stroke: "#5a7d6b", strokeOpacity: 0.15 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            stroke="#2c3e35"
            tick={{ fill: "#2c3e35", fontSize: 11, opacity: 0.6 }}
            axisLine={{ stroke: "#5a7d6b", strokeOpacity: 0.15 }}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid rgba(90,125,107,0.15)",
              boxShadow: "0 4px 20px rgba(44,62,53,0.06)",
              fontSize: 12,
              color: "#2c3e35",
            }}
            labelStyle={{ color: "#5a7d6b", fontWeight: 500 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#2c3e35", paddingTop: 10 }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="Mood"
            stroke="#5a7d6b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#5a7d6b" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Anxiety"
            stroke="#c58a6a"
            strokeWidth={2}
            dot={{ r: 3, fill: "#c58a6a" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Sleep"
            stroke="#7b9a88"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#7b9a88" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
