import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, Building2, ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Room } from "@/data/mockRooms";
import api from "@/lib/api";

const allAmenities = ["WiFi", "AC", "Fan", "Attached Bathroom", "Common Bathroom", "Study Table", "Wardrobe", "Balcony", "Mini Fridge", "Laundry"];

const emptyRoom = {
  hostelName: "",
  roomNumber: "",
  roomType: "Single" as Room["roomType"],
  price: 0,
  capacity: 1,
  amenities: [] as string[],
  description: "",
  imagePreviews: [] as string[],
};

const OwnerRooms = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState(emptyRoom);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch rooms from backend on mount
  useEffect(() => {
    api.get("/rooms")
      .then((res) => {
        const backendRooms = (res.data.rooms || []).map((r: any) => ({
          id: String(r.id),
          hostelName: "",
          roomNumber: r.room_number,
          roomType: r.room_type as Room["roomType"],
          price: r.rate,
          capacity: r.capacity,
          amenities: [],
          description: "",
          images: ["/placeholder.svg"],
          available: r.status === "available",
        }));
        setRooms(backendRooms);
      })
      .catch(() => {
        // Fallback: show empty state
      });
  }, []);

  const handleAmenityToggle = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 5MB per image", variant: "destructive" });
        return;
      }
      newPreviews.push(URL.createObjectURL(file));
    });
    setForm((prev) => ({ ...prev, imagePreviews: [...prev.imagePreviews, ...newPreviews].slice(0, 5) }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, imagePreviews: prev.imagePreviews.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomNumber || !form.price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const response = await api.post("/rooms", {
        room_number: form.roomNumber,
        room_type: form.roomType,
        capacity: form.capacity,
        rate: form.price,
      });

      const r = response.data.room;
      const newRoom: Room = {
        id: String(r.id),
        hostelName: form.hostelName || "",
        roomNumber: r.room_number,
        roomType: r.room_type as Room["roomType"],
        price: r.rate,
        capacity: r.capacity,
        amenities: form.amenities,
        description: form.description,
        images: form.imagePreviews.length > 0 ? form.imagePreviews : ["/placeholder.svg"],
        available: true,
      };
      setRooms((prev) => [newRoom, ...prev]);
      setForm(emptyRoom);
      setShowForm(false);
      toast({ title: "Room added successfully!" });
    } catch {
      toast({ title: "Failed to add room", variant: "destructive" });
    }
  };

  const handleDelete = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Room removed" });
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Room Management</h1>
            <p className="text-muted-foreground mt-1">Add and manage hostel rooms</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="font-body">
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Add New Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hostelName">Hostel Name *</Label>
                  <Input id="hostelName" placeholder="e.g. Sunrise Boys Hostel" value={form.hostelName} onChange={(e) => setForm({ ...form, hostelName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input id="roomNumber" placeholder="e.g. A-101" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={form.roomType} onValueChange={(v) => setForm({ ...form, roomType: v as Room["roomType"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Triple">Triple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (₹) *</Label>
                  <Input id="price" type="number" placeholder="e.g. 5000" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" min={1} max={6} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the room..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                {/* Image Upload */}
                <div className="space-y-3 md:col-span-2">
                  <Label>Room Photos (max 5)</Label>
                  <div className="flex flex-wrap gap-3">
                    {form.imagePreviews.map((src, i) => (
                      <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border group">
                        <img src={src} alt={`Room photo ${i + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {form.imagePreviews.length < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-xs">Upload</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB each</p>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label>Amenities</Label>
                  <div className="flex flex-wrap gap-4">
                    {allAmenities.map((a) => (
                      <label key={a} className="flex items-center gap-2 cursor-pointer text-sm">
                        <Checkbox checked={form.amenities.includes(a)} onCheckedChange={() => handleAmenityToggle(a)} />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" className="font-body">Add Room</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="font-body">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Room List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="group hover:shadow-[var(--shadow-soft)] transition-all overflow-hidden">
              <div className="h-40 bg-secondary overflow-hidden">
                <img src={room.images[0]} alt={`${room.roomNumber} photo`} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{room.roomNumber}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {room.hostelName}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${room.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {room.available ? "Available" : "Booked"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{room.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {room.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{room.amenities.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-bold text-primary">₹{room.price.toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(room.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No rooms added yet</p>
            <p className="text-sm">Click "Add Room" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerRooms;
