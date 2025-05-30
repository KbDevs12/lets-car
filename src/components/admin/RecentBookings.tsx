import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export async function RecentBookings() {
  // In a real app, this would be fetched from your database
  const recentBookings = [
    {
      id: 1,
      userName: "John Doe",
      carModel: "Toyota Avanza",
      status: "confirmed",
      date: "2024-01-15",
      amount: 350000,
    },
    {
      id: 2,
      userName: "Jane Smith",
      carModel: "Honda Civic",
      status: "pending",
      date: "2024-01-14",
      amount: 500000,
    },
    {
      id: 3,
      userName: "Bob Johnson",
      carModel: "Suzuki Ertiga",
      status: "completed",
      date: "2024-01-13",
      amount: 400000,
    },
    {
      id: 4,
      userName: "Alice Brown",
      carModel: "Toyota Innova",
      status: "cancelled",
      date: "2024-01-12",
      amount: 600000,
    },
    {
      id: 5,
      userName: "Charlie Wilson",
      carModel: "Daihatsu Xenia",
      status: "confirmed",
      date: "2024-01-11",
      amount: 320000,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {recentBookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {booking.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{booking.userName}</p>
              <p className="text-xs text-muted-foreground">
                {booking.carModel}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="secondary"
              className={getStatusColor(booking.status)}
            >
              {booking.status}
            </Badge>
            <p className="text-sm font-medium mt-1">
              Rp {booking.amount.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
