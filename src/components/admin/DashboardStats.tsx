import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Users, Calendar, DollarSign } from "lucide-react";

export async function DashboardStats() {
  // In a real app, these would be fetched from your database
  const stats = {
    totalBookings: 245,
    totalUsers: 89,
    availableCars: 15,
    totalRevenue: 125000,
    bookingsChange: "+12%",
    usersChange: "+5%",
    carsChange: "-2",
    revenueChange: "+18%",
  };

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      description: `${stats.bookingsChange} from last month`,
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: `${stats.usersChange} from last month`,
      icon: Users,
      trend: "up",
    },
    {
      title: "Available Cars",
      value: stats.availableCars.toLocaleString(),
      description: `${stats.carsChange} from last week`,
      icon: Car,
      trend: "down",
    },
    {
      title: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      description: `${stats.revenueChange} from last month`,
      icon: DollarSign,
      trend: "up",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
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
