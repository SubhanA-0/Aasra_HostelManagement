import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Wifi, Wind, Bath, MapPin, CreditCard, Building, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

type Room = {
  id: string;
  hostelName: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  price: number;
  amenities: string[];
  description: string;
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  AC: <Wind className="h-3.5 w-3.5" />,
  "Attached Bathroom": <Bath className="h-3.5 w-3.5" />,
};

const Hostels = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // Booking State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Rooms
    api.get('/rooms').then((res) => {
      // Filter for available rooms out of backend ones
      const backendRooms = (res.data.rooms || []).filter((r: any) => r.status === 'available').map((r: any) => ({
        id: String(r.id),
        hostelName: r.hostel_name || "Hostel",
        roomNumber: r.room_number,
        roomType: r.room_type,
        capacity: r.capacity,
        price: r.rate,
        amenities: ["WiFi", "Study Table"], // Simulated amenities for dummy data
        description: `Spacious ${r.room_type} room located in ${r.hostel_name}.`
      }));
      setRooms(backendRooms);
    }).catch(() => {});

    // Fetch global reviews for aggregate calculations
    api.get('/reviews').then((res) => {
      setReviews(res.data.reviews || []);
    }).catch(() => {});
  }, []);

  const filtered = rooms.filter((room) => {
    const matchesSearch =
      room.hostelName.toLowerCase().includes(search.toLowerCase()) ||
      room.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || room.roomType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleBook = async () => {
    if (!selectedRoom) return;
    setIsProcessing(true);
    
    try {
      await api.post('/payments/book', {
        roomId: parseInt(selectedRoom.id),
        amount: selectedRoom.price,
        paymentMethod
      });
      
      toast({ title: "Booking Successful!", description: `Room ${selectedRoom.roomNumber} is now assigned to you.` });
      navigate('/student/room');
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.response?.data?.message || "An error occurred", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Browse Hostels</h1>
          <p className="text-muted-foreground mt-1">Find and book your perfect room</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hostel name or room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Double">Double</SelectItem>
              <SelectItem value="Triple">Triple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((room) => (
            <Card key={room.id} className="group hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-all cursor-pointer">
              <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="h-40 bg-secondary rounded-t-xl flex items-center justify-center relative">
                  <Building2 className="h-10 w-10 text-muted-foreground/30" />
                  
                  {/* Rating Badge Overlay */}
                  {(() => {
                    const hostelReviews = reviews.filter(rev => rev.hostel_name === room.hostelName);
                    if (hostelReviews.length > 0) {
                      const avg = hostelReviews.reduce((sum, rev) => sum + rev.rating, 0) / hostelReviews.length;
                      return (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur pb-0 pt-0.5 px-2 rounded-full flex items-center gap-1 shadow-sm border border-border">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mb-0.5" />
                          <span className="text-xs font-bold text-slate-800">{avg.toFixed(1)}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{room.hostelName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Room {room.roomNumber}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-body text-xs">
                      {room.roomType}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{room.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.amenities.map((a) => (
                      <span key={a} className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {amenityIcons[a] || null}
                        {a}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Users className="h-3.5 w-3.5" />
                    Capacity: {room.capacity} {room.capacity === 1 ? "person" : "people"}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-display text-2xl font-bold text-primary">
                      ₹{room.price.toLocaleString()}
                      <span className="text-xs text-muted-foreground font-normal">/mo</span>
                    </p>

                    <Dialog onOpenChange={(open) => { if (!open) setBookingStep(1) }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="font-body" onClick={() => setSelectedRoom(room)}>
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="font-display text-xl">Confirm & Pay</DialogTitle>
                        </DialogHeader>
                        {selectedRoom && (
                          <div className="space-y-4">
                            {bookingStep === 1 && (
                              <>
                                <div className="rounded-lg bg-secondary p-4 space-y-2">
                                  <p className="font-semibold text-foreground">{selectedRoom.hostelName}</p>
                                  <p className="text-sm text-muted-foreground">Room {selectedRoom.roomNumber} · {selectedRoom.roomType}</p>
                                  <p className="font-display text-2xl font-bold text-primary">₹{selectedRoom.price.toLocaleString()}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                                </div>
                                <Button className="w-full font-body" onClick={() => setBookingStep(2)}>
                                  Proceed to Payment
                                </Button>
                              </>
                            )}

                            {bookingStep === 2 && (
                               <div className="space-y-4">
                               <p className="text-sm text-muted-foreground mb-4">Choose a payment method to complete your booking.</p>
                               
                               <div className="grid gap-3">
                                 <button 
                                   onClick={() => setPaymentMethod('card')}
                                   className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                 >
                                   <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                                   <div>
                                     <p className="font-medium text-foreground">Credit/Debit Card</p>
                                     <p className="text-xs text-muted-foreground">Pay instantly online</p>
                                   </div>
                                 </button>
                                 <button 
                                   onClick={() => setPaymentMethod('challan')}
                                   className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors ${paymentMethod === 'challan' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                 >
                                   <Building className={`h-5 w-5 ${paymentMethod === 'challan' ? 'text-primary' : 'text-muted-foreground'}`} />
                                   <div>
                                     <p className="font-medium text-foreground">Bank Challan</p>
                                     <p className="text-xs text-muted-foreground">Generate challan to pay at bank</p>
                                   </div>
                                 </button>
                               </div>

                               <div className="flex gap-2 pt-2">
                                 <Button variant="outline" className="flex-1" onClick={() => setBookingStep(1)}>Back</Button>
                                 <Button className="flex-1" onClick={handleBook} disabled={isProcessing}>
                                   {isProcessing ? 'Processing...' : `Pay ₹${selectedRoom.price}`}
                                 </Button>
                               </div>
                             </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No rooms found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hostels;
