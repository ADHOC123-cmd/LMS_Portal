import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Toaster } from "sonner";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import RefundPolicy from "./components/RefundPolicy";
import { Footer } from "./components/layout/Footer";
import { BottomNav } from "./components/layout/BottomNav";
import Home from "./pages/public/Home";
import { ChatbotWidget } from "./components/chatbot/ChatbotWidget";
import { api } from "./services/api";
import { authStore } from "./utils/authStore";

// Lazy Pages
const Catalog = React.lazy(() => import("./pages/public/Catalog"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const ForgotPassword = React.lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/auth/ResetPassword"));
const CourseDetail = React.lazy(() => import("./pages/public/CourseDetail"));
const NotFound = React.lazy(() => import("./pages/public/NotFound"));
const Unauthorized = React.lazy(() => import("./pages/public/Unauthorized"));
const Dashboard = React.lazy(() => import("./pages/student/Dashboard"));
const Profile = React.lazy(() => import("./pages/student/Profile"));
const CoursePlayer = React.lazy(() => import("./pages/student/CoursePlayer"));
const AllDeadlines = React.lazy(() => import("./pages/student/AllDeadlines"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const MyCourses = React.lazy(() => import("./pages/student/MyCourses"));
const Certificates = React.lazy(() => import("./pages/student/Certificates"));
const MyDoubts = React.lazy(() => import("./pages/student/MyDoubts"));
// const Settings = React.lazy(() => import('./pages/student/Settings'))
const Referral = React.lazy(() => import("./pages/student/Referral"));
const AdminCourses = React.lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseManager = React.lazy(
  () => import("./pages/admin/AdminCourseManager"),
);
const AdminDoubts = React.lazy(() => import("./pages/admin/AdminDoubts"));
const VerifyCertificate = React.lazy(
  () => import("./pages/public/VerifyCertificate"),
);
const BlogList = React.lazy(() => import("./pages/public/BlogList"));
const BlogPost = React.lazy(() => import("./pages/public/BlogPost"));
const AdminBlogs = React.lazy(() => import("./pages/admin/AdminBlogs"));
const AdminFeedbacks = React.lazy(() => import("./pages/admin/AdminFeedbacks"));
const AdminDevices = React.lazy(() => import("./pages/admin/AdminDevices"));
const StudentFeedback = React.lazy(
  () => import("./pages/student/StudentFeedback"),
);
const AboutUs = React.lazy(() => import("./components/AboutUs"));
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function App() {
  React.useEffect(() => {
    const checkSession = async () => {
      const state = authStore.getState();
      if (state.isAuthenticated) {
        try {
          await api.auth.getMe();
        } catch (err) {
          // 401 response is handled by api.js interceptor automatically
          console.warn("Session auto-validation failed:", err.message);
        }
      }
    };

    // Initial check on mount
    checkSession();

    // Check periodically every 30 seconds
    const interval = setInterval(checkSession, 30000);

    // Check when window gains focus
    const handleFocus = () => {
      checkSession();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col w-full overflow-x-hidden">
          <Header />
          <main className="flex-grow pt-20 pb-20 md:pb-8 w-full max-w-[1920px] mx-auto min-w-0 min-h-[85vh]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/catalog"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <Catalog />
                  </React.Suspense>
                }
              />
              <Route
                path="/course/:id"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <CourseDetail />
                  </React.Suspense>
                }
              />
              <Route
                path="/verify-certificate"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <VerifyCertificate />
                  </React.Suspense>
                }
              />
              <Route
                path="/verify-certificate/:code"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <VerifyCertificate />
                  </React.Suspense>
                }
              />
              <Route
                path="/blog"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <BlogList />
                  </React.Suspense>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <BlogPost />
                  </React.Suspense>
                }
              />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route
                path="/login"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <Login />
                  </React.Suspense>
                }
              />
              <Route
                path="/register"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <Register />
                  </React.Suspense>
                }
              />
              <Route
                path="/auth/register"
                element={<Navigate to="/register" replace />}
              />
              <Route
                path="/forgot-password"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <ForgotPassword />
                  </React.Suspense>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <ResetPassword />
                  </React.Suspense>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <Dashboard />
                  </React.Suspense>
                }
              />
              <Route path="/student/deadlines" element={<AllDeadlines />} />
              <Route path="/student/course/:id" element={<CoursePlayer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/my-doubts" element={<MyDoubts />} />
              {/* <Route path="/settings" element={<Settings />} /> */}
              <Route path="/referral" element={<Referral />} />
              <Route path="/feedback" element={<StudentFeedback />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route
                path="/admin/courses/:id"
                element={<AdminCourseManager />}
              />
              <Route path="/admin/doubts" element={<AdminDoubts />} />
              <Route path="/admin/blogs" element={<AdminBlogs />} />
              <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
              <Route
                path="/admin/devices"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    <AdminDevices />
                  </React.Suspense>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/RefundPolicy" element={<RefundPolicy />} />
              <Route path="/about-us" element={<AboutUs />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
          <ChatbotWidget />
          <Toaster
            position="top-right"
            richColors
            duration={5000}
            closeButton
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
