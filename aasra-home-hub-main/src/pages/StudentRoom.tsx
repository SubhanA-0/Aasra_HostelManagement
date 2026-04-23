import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Building2, Users, Wifi, Wind, Bath, BookOpen, DoorOpen, Home } from "lucide-react";
import api from "@/lib/api";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  AC: Wind,
  "Attached Bathroom": Bath,
  "Study Table": BookOpen,
};

const StudentRoom = () => {
  const navigate = useNavigate();
  const [myRoom, setMyRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/rooms/my-room')
      .then(res => {
        setMyRoom(res.data.room);
      })
      .catch(() => {
        setMyRoom(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-body">
        <Navbar />
        <div className="flex items-center justify-center py-20">Loading...</div>
      </div>
    );
  }

  if (!myRoom) {
    return (
      <div className="min-h-screen bg-background font-body">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <Card className="max-w-md mx-auto text-center py-12 px-6">
            <Home className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="font-display text-2xl font-bold mb-2">No Room Assigned</h2>
            <p className="text-muted-foreground mb-8">You haven't booked a room yet. Browse available hostels to find your perfect stay.</p>
            <Button onClick={() => navigate('/hostels')} size="lg" className="w-full sm:w-auto font-body">
              Browse Hostels
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Simulated amenities for dynamically fetched room
  const amenities = ["WiFi", "Study Table"];

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Room</h1>
          <p className="text-muted-foreground mt-1">Your room details and information</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Room Info */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BedDouble className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Room {myRoom.room_number}</h2>
                  <p className="text-sm text-muted-foreground">{myRoom.room_type} Room</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Hostel:</span>
                  <span className="font-medium text-foreground">{myRoom.hostel_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Room Type:</span>
                  <span className="font-medium text-foreground">{myRoom.room_type}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Roommates:</span>
                  <span className="font-medium text-foreground">None (Single Room)</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Check-in Date</p>
                <p className="font-medium text-foreground">{new Date(myRoom.updated_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="font-display text-2xl font-bold text-primary">₹{myRoom.rate.toLocaleString()}<span className="text-sm text-muted-foreground font-normal">/month</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Room Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || BedDouble;
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{amenity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                  <span className="text-sm text-green-700 font-medium">Your room is currently assigned</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentRoom;
