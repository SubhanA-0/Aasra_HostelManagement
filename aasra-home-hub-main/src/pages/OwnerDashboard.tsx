import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Inbox from "@/components/Inbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BedDouble, CreditCard, ClipboardList, Bell, GraduationCap, MessageSquare, Star, Users, Building, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

const ownerFeatures = [
  { icon: Building, title: "My Hostels & Chats", desc: "View your grouped properties and student chats.", href: "/owner/hostels" },
  { icon: BedDouble, title: "Room Management", desc: "Add, edit, and manage hostel rooms.", href: "/owner/rooms" },
  { icon: GraduationCap, title: "Student Index", desc: "Archive and inspect student registers.", href: "/owner/students" },
  { icon: CreditCard, title: "Fee Management", desc: "Track all student payments and dues.", href: "/owner/payments" },
  { icon: ClipboardList, title: "Complaints", desc: "Review and resolve student complaints.", href: "/owner/complaints" },
  { icon: Bell, title: "Notices", desc: "Post and manage announcements.", href: "/owner/notices" },
];

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    pendingDues: 0,
    activeComplaints: 0,
    averageRating: "0.0"
  });

  useEffect(() => {
    api.get('/stats').then((res) => {
      setStats(res.data.stats || stats);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your hostel operations</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="font-body">
                <MessageSquare className="h-4 w-4 mr-2" />
                Inbox
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
              <Inbox role="owner" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Dynamic FR-09 Dashboard Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalRooms}</h3>
              </div>
              <Building className="h-8 w-8 text-primary/40" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                <h3 className="text-2xl font-bold mt-1">{stats.occupiedRooms}</h3>
              </div>
              <Users className="h-8 w-8 text-blue-500/40" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Dues</p>
                <h3 className="text-2xl font-bold mt-1">PKR {stats.pendingDues.toLocaleString()}</h3>
              </div>
              <CreditCard className="h-8 w-8 text-red-500/40" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Complaints</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeComplaints}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/40" />
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <h3 className="text-2xl font-bold mt-1">{stats.averageRating}</h3>
              </div>
              <Star className="h-8 w-8 text-green-500/40" />
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerFeatures.map((f) => (
            <Link to={f.href} key={f.title}>
              <Card className="group hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-all h-full cursor-pointer">
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
