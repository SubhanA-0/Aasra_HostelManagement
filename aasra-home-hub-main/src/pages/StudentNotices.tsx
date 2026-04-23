import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Megaphone } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: "general" | "maintenance" | "event" | "urgent";
  createdAt: string;
}

const categoryColor = {
  general: "bg-secondary text-secondary-foreground",
  maintenance: "bg-yellow-100 text-yellow-700",
  event: "bg-blue-100 text-blue-700",
  urgent: "bg-red-100 text-red-700",
};

const mockNotices: Notice[] = [
  { id: "1", title: "Water supply interruption", content: "Water supply will be interrupted on March 10th from 10am to 2pm due to tank cleaning. Please store water in advance.", category: "maintenance", createdAt: "2026-03-07" },
  { id: "2", title: "Monthly hostel meeting", content: "All residents are requested to attend the monthly hostel meeting on March 15th at 6pm in the common hall.", category: "event", createdAt: "2026-03-06" },
  { id: "3", title: "New hostel rules effective April", content: "Updated hostel rules regarding visitor timings and noise policy will be effective from April 1st. Details will be shared soon.", category: "general", createdAt: "2026-03-05" },
  { id: "4", title: "Emergency: Fire drill scheduled", content: "A mandatory fire drill is scheduled for March 12th at 3pm. All residents must participate.", category: "urgent", createdAt: "2026-03-04" },
];

const StudentNotices = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Notices & Announcements</h1>
          <p className="text-muted-foreground mt-1">Stay updated with hostel announcements</p>
        </div>

        <div className="space-y-4">
          {mockNotices.map((notice) => (
            <Card key={notice.id} className="hover:shadow-[var(--shadow-soft)] transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Megaphone className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground">{notice.title}</h3>
                      <Badge className={`text-xs border-0 capitalize ${categoryColor[notice.category]}`}>{notice.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notice.content}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockNotices.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No notices yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
