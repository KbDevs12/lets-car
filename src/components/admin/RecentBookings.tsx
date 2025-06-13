import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchRecentBookings } from "@/actions/dashboard-actions";

export async function RecentBookings() {
  const recentBookings = await fetchRecentBookings();

  const getStatusColor = (status: string | null | undefined) => {
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
