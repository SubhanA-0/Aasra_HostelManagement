import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Hostels from "./pages/Hostels";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerRooms from "./pages/OwnerRooms";
import OwnerStudents from "./pages/OwnerStudents";
import OwnerPayments from "./pages/OwnerPayments";
import OwnerComplaints from "./pages/OwnerComplaints";
import OwnerNotices from "./pages/OwnerNotices";
import PaymentTracking from "./pages/PaymentTracking";
import StudentDashboard from "./pages/StudentDashboard";
import StudentComplaints from "./pages/StudentComplaints";
import StudentNotices from "./pages/StudentNotices";
import StudentRoom from "./pages/StudentRoom";
import StudentProfile from "./pages/StudentProfile";
import RateHostel from "./pages/RateHostel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/hostels" element={<Hostels />} />
          {/* Owner routes */}
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/rooms" element={<OwnerRooms />} />
          <Route path="/owner/students" element={<OwnerStudents />} />
          <Route path="/owner/payments" element={<OwnerPayments />} />
          <Route path="/owner/complaints" element={<OwnerComplaints />} />
          <Route path="/owner/notices" element={<OwnerNotices />} />
          {/* Student routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/room" element={<StudentRoom />} />
          <Route path="/student/complaints" element={<StudentComplaints />} />
          <Route path="/student/notices" element={<StudentNotices />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/rate" element={<RateHostel />} />
          <Route path="/payments" element={<PaymentTracking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
