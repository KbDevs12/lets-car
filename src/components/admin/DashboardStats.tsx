import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Users, Calendar, DollarSign } from "lucide-react";
import { fetchDashboardStats } from "@/actions/dashboard-actions";

export async function DashboardStats() {
  const stats = await fetchDashboardStats();

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      description: "All-time bookings",
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "Registered users",
      icon: Users,
      trend: "up",
    },
    {
      title: "Available Cars",
      value: stats.availableCars.toLocaleString(),
      description: "Currently available",
      icon: Car,
      trend: "up",
    },
    {
      title: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      description: "Total from all payments",
      icon: DollarSign,
      trend: "up",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
