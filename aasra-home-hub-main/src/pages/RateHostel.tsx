import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

const categories = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "food", label: "Food Quality" },
  { key: "staff", label: "Staff Behavior" },
  { key: "facilities", label: "Facilities" },
  { key: "security", label: "Security" },
];

const RateHostel = () => {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hovering, setHovering] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [hostelName, setHostelName] = useState("Sunrise Boys Hostel");
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (category: string, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(ratings).length < categories.length || !hostelName) {
      toast({ title: "Please fill hostel name and rate all categories", variant: "destructive" });
      return;
    }

    const calculatedAvg = Number((Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1));

    try {
      await api.post("/reviews", {
        hostelName,
        rating: calculatedAvg,
        reviewText: feedback
      });
      setSubmitted(true);
      toast({ title: "Thank you for your feedback!", description: "Your rating has been submitted to the global database." });
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    }
  };

  const avgRating = Object.values(ratings).length > 0
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)
    : "0.0";

  if (submitted) {
    return (
      <div className="min-h-screen bg-background font-body">
        <Navbar />
        <div className="container mx-auto px-6 py-8 max-w-lg">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600 fill-green-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-4">Your average rating: <span className="font-bold text-primary">{avgRating}/5</span></p>
              <p className="text-sm text-muted-foreground">Your feedback helps us improve the hostel experience.</p>
              <Button className="mt-6 font-body" onClick={() => { setSubmitted(false); setRatings({}); setFeedback(""); }}>
                Rate Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-lg">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Rate Your Hostel</h1>
          <p className="text-muted-foreground mt-1">Share your experience to help us improve</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Hostel Name</Label>
              <Input placeholder="Which hostel are you reviewing?" value={hostelName} onChange={(e) => setHostelName(e.target.value)} />
            </div>

            {categories.map((cat) => (
              <div key={cat.key}>
                <Label className="text-sm font-medium text-foreground mb-2 block">{cat.label}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovering((prev) => ({ ...prev, [cat.key]: star }))}
                      onMouseLeave={() => setHovering((prev) => ({ ...prev, [cat.key]: 0 }))}
                      onClick={() => handleRate(cat.key, star)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hovering[cat.key] || ratings[cat.key] || 0)
                            ? "text-accent fill-accent"
                            : "text-border"
                        }`}
                      />
                    </button>
                  ))}
                  {ratings[cat.key] && (
                    <span className="ml-2 text-sm text-muted-foreground self-center">{ratings[cat.key]}/5</span>
                  )}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label>Additional Feedback (Optional)</Label>
              <Textarea placeholder="Tell us more about your experience..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="min-h-[100px]" />
            </div>

            <Button className="w-full font-body" onClick={handleSubmit}>Submit Rating</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RateHostel;
