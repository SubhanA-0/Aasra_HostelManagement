import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, IndianRupee, CalendarDays, AlertTriangle, CheckCircle2, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Payment {
  id: string;
  studentName: string;
  hostelName: string;
  roomNumber: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "challan_generated";
  month: string;
  receiptId?: string;
}

const statusConfig: Record<string, { icon: any, color: string, label: string }> = {
  paid: { icon: CheckCircle2, color: "bg-green-100 text-green-700", label: "Paid" },
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Pending" },
  overdue: { icon: AlertTriangle, color: "bg-red-100 text-red-700", label: "Overdue" },
  challan_generated: { icon: Clock, color: "bg-blue-100 text-blue-700", label: "Challan Gen." },
};

const PaymentTracking = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState<"card" | "challan" | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch student's own payments from backend (TC-09: server filters by JWT)
  useEffect(() => {
    api.get("/payments")
      .then((res) => {
        const rows = (res.data.payments || []).map((p: any) => ({
          id: String(p.id),
          studentName: p.student_name || `Student #${p.student_id}`,
          hostelName: "",
          roomNumber: "",
          amount: p.amount,
          dueDate: p.date,
          status: p.status as Payment["status"],
          month: p.month || "",
          receiptId: p.receipt_id,
        }));
        setPayments(rows);
      })
      .catch(() => {});
  }, []);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.hostelName.toLowerCase().includes(search.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDue = payments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
  const totalCollected = payments.filter((p) => p.status === "paid" || p.status === "challan_generated").reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  const handlePaymentSubmit = async (id: string) => {
    if (!selectedMethod) return;
    setProcessingId(id);
    try {
      const res = await api.put(`/payments/${id}/pay`, { paymentMethod: selectedMethod });
      setPayments(prev => prev.map(p => 
        p.id === id ? { ...p, status: res.data.status, receiptId: res.data.receipt_id || p.receiptId } : p
      ));
      toast({ 
        title: selectedMethod === 'card' ? "Payment Successful" : "Bank Challan Generated", 
        description: selectedMethod === "card" ? "Your fee has been securely processed natively." : "Please download and deposit the challan at the bank branch." 
      });
      setSelectedMethod(null);
    } catch (err) {
      toast({ title: "Request Failed", description: "Could not process fee update via Database.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Payments</h1>
          <p className="text-muted-foreground mt-1">View your fee payments, dues, and receipts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="font-display text-2xl font-bold text-foreground">₹{totalCollected.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Dues</p>
                <p className="font-display text-2xl font-bold text-foreground">₹{totalDue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="font-display text-2xl font-bold text-foreground">{overdueCount} payments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, hostel, or room..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {filtered.map((payment) => {
            const config = statusConfig[payment.status];
            const StatusIcon = config.icon;
            return (
              <Card key={payment.id} className="hover:shadow-[var(--shadow-soft)] transition-all">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{payment.studentName}</p>
                      <p className="text-sm text-muted-foreground">{payment.hostelName} · Room {payment.roomNumber}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{payment.month} · Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-foreground">₹{payment.amount.toLocaleString()}</p>
                      <Badge className={`text-xs ${config.color} border-0`}>{config.label}</Badge>
                    </div>

                    {payment.status === "paid" ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="font-body">
                            <Download className="h-3.5 w-3.5 mr-1" /> Receipt
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-display">Payment Receipt</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Receipt ID</span><span className="font-medium">{payment.receiptId}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{payment.studentName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Month</span><span className="font-medium">{payment.month || payment.dueDate}</span></div>
                            <hr className="border-border" />
                            <div className="flex justify-between text-base"><span className="font-semibold">Amount Paid</span><span className="font-display font-bold text-primary">₹{payment.amount.toLocaleString()}</span></div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : payment.status === "challan_generated" ? (
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none border-0 ring-0 text-xs py-0.5 whitespace-nowrap">Payment Processing</Badge>
                        <span className="text-[10px] text-muted-foreground w-28 text-right leading-tight block">Deposit challan at any partner branch</span>
                      </div>
                    ) : (
                      <Dialog onOpenChange={(open) => !open && setSelectedMethod(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="font-body transition-all hover:bg-primary/90">
                            Pay Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-card border-border/40">
                          <DialogHeader className="mb-2">
                            <DialogTitle className="font-display text-2xl text-foreground">Clear Fee</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1.5">Select a method to pay your outstanding fee of ₹{payment.amount}</p>
                          </DialogHeader>
                          
                          <div className="grid grid-cols-2 gap-4 mt-2 mb-6">
                            <button
                              onClick={() => setSelectedMethod("card")}
                              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-center justify-center gap-2 ${
                                selectedMethod === "card"
                                  ? "border-primary bg-primary/5 shadow-[var(--shadow-warm)]"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              <div className={`p-2 rounded-full ${selectedMethod === 'card' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                <IndianRupee className="h-5 w-5" />
                              </div>
                              <p className="font-semibold text-sm">Credit Card</p>
                            </button>
                            
                            <button
                              onClick={() => setSelectedMethod("challan")}
                              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col items-center justify-center gap-2 ${
                                selectedMethod === "challan"
                                  ? "border-primary bg-primary/5 shadow-[var(--shadow-warm)]"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              <div className={`p-2 rounded-full ${selectedMethod === 'challan' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                <Download className="h-5 w-5" />
                              </div>
                              <p className="font-semibold text-sm">Bank Challan</p>
                            </button>
                          </div>

                          {selectedMethod === "card" && (
                            <div className="space-y-4 mb-6 animate-fade-in">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Card Information</label>
                                <Input placeholder="1234 5678 9101 1121" maxLength={19} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Expiry</label>
                                  <Input placeholder="MM/YY" maxLength={5} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">CVV</label>
                                  <Input type="password" placeholder="•••" maxLength={3} />
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedMethod === "challan" && (
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 rounded-lg mb-6 animate-fade-in text-sm text-blue-800 dark:text-blue-200">
                              A fee voucher will be generated. You can print it down and submit the cash directly at any allied partner bank branches within 5 working days to avoid overdue fees.
                            </div>
                          )}

                          <Button 
                            className="w-full font-body font-semibold py-6 shadow-[var(--shadow-warm)]" 
                            disabled={!selectedMethod || processingId === payment.id}
                            onClick={() => handlePaymentSubmit(payment.id)}
                          >
                            {processingId === payment.id ? "Processing..." : selectedMethod === "card" ? `Pay ₹${payment.amount}` : selectedMethod === "challan" ? "Generate Challan" : "Select Payment Method"}
                          </Button>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No payments found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking;
