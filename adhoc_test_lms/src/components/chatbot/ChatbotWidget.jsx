import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { api } from "../../services/api";
import { StorageService } from "../../services/storage";

export function ChatbotWidget() {
  const dragControls = useDragControls();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isLeft, setIsLeft] = useState(false);

  // Dynamic drag constraints to prevent button and window from going off-screen
  const getDragConstraints = () => {
    const buttonWidth = 56;
    const margin = 24;
    const chatWidth = windowSize.width > 640 ? 400 : windowSize.width * 0.9;
    
    const minLeft = -windowSize.width + margin + buttonWidth; // keeps button on screen at left
    const maxRight = 0; // keeps button on screen at right (initial position is right-6)
    const minTop = -windowSize.height + margin + buttonWidth; // keeps button on screen at top
    const maxBottom = 0; // keeps button on screen at bottom (initial position is bottom-6)

    if (!isOpen) {
      return { left: minLeft, right: maxRight, top: minTop, bottom: maxBottom };
    }

    // When open, limit top/bottom to keep 550px panel on-screen
    const openMinTop = -windowSize.height + 550 + (2 * margin) + buttonWidth;

    if (isLeft) {
      // Chat window is on the right of the button
      const limitRight = buttonWidth - chatWidth;
      return {
        left: minLeft,
        right: Math.min(0, limitRight),
        top: Math.max(minTop, openMinTop),
        bottom: maxBottom
      };
    } else {
      // Chat window is on the left of the button
      const limitLeft = -windowSize.width + (2 * margin) + chatWidth;
      return {
        left: Math.max(minLeft, limitLeft),
        right: maxRight,
        top: Math.max(minTop, openMinTop),
        bottom: maxBottom
      };
    }
  };

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "model",
      text: "Hello! 👋 I'm your AI Academic Advisor. \n\nTo help you find the best courses, could you tell me about your graduation background (e.g. B.Tech CS, BCA, B.Com, MBA) and what subjects or career paths you are interested in?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  
  const chatEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load courses for recommendation lookup
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await StorageService.getCourses();
        setCourses(data || []);
      } catch (err) {
        console.error("Failed to load courses for chatbot", err);
      }
    };
    loadCourses();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // Hide chatbot on admin routes and active course player to prevent distraction
  const isAdmin = location.pathname.startsWith("/admin");
  const isCoursePlayer = location.pathname.includes("/student/course/");
  if (isAdmin || isCoursePlayer) return null;

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Format history
      const historyPayload = messages.map((msg) => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await api.chatbot.chat(userText, historyPayload);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: response.reply,
            recommendedCourseIds: response.recommendedCourseIds || []
          }
        ]);
      } else {
        throw new Error("Chatbot API response failure");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "I'm sorry, I encountered a connection issue. Please make sure the backend server is running and the Gemini API Key is configured."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={getDragConstraints()}
      onDrag={(event, info) => {
        setIsLeft(info.point.x < windowSize.width / 2);
      }}
      className="fixed bottom-6 right-6 z-[999]"
      style={{
        width: 56,
        height: 56,
      }}
    >
      <AnimatePresence>
        {/* Chat Widget Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`absolute bottom-[72px] ${isLeft ? "left-0" : "right-0"} w-[90vw] sm:w-[400px] h-[550px] bg-surface-container-lowest/95 backdrop-blur-md rounded-[2.5rem] border border-surface-dim/30 shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div 
              onPointerDown={(e) => {
                if (!e.target.closest('button')) {
                  dragControls.start(e);
                }
              }}
              style={{ touchAction: "none" }}
              className="signature-gradient p-5 text-white flex justify-between items-center relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base tracking-wide flex items-center gap-1.5">
                    Adhoc AI Advisor
                  </h3>
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping inline-block" />
                    Online & Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-surface/50">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div key={msg.id} className="space-y-3">
                    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${isUser ? "bg-primary text-on-primary" : "bg-surface-container-high text-secondary"}`}>
                        {isUser ? "ME" : "AI"}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-primary text-on-primary rounded-tr-none" : "bg-surface-container-lowest text-on-surface border border-surface-dim/20 rounded-tl-none shadow-sm"}`}>
                        {msg.text}
                      </div>
                    </div>

                    {/* Interactive Recommended Course Cards */}
                    {msg.recommendedCourseIds && msg.recommendedCourseIds.length > 0 && (
                      <div className="pl-10 pr-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
                          <Sparkle className="w-3 h-3 text-amber-400 fill-amber-400" /> Matches Found for You:
                        </p>
                        <div className="space-y-2.5">
                          {msg.recommendedCourseIds.map((courseId) => {
                            const course = courses.find((c) => c.id === courseId);
                            if (!course) return null;
                            return (
                              <div
                                key={courseId}
                                className="bg-surface-container-lowest border border-surface-dim/20 hover:border-primary/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-3 p-3 group"
                              >
                                {course.image && (
                                  <div className="w-full sm:w-20 h-16 bg-surface-container rounded-lg overflow-hidden shrink-0">
                                    <img
                                      src={course.image}
                                      alt={course.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span className="text-[8px] font-bold text-secondary uppercase tracking-wider bg-surface-container-high px-1.5 py-0.5 rounded">
                                      {course.category}
                                    </span>
                                    <span className="text-[8px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-1.5 py-0.5 rounded">
                                      {course.duration}h
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                                    {course.title}
                                  </h4>
                                  <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                                    {course.description}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/course/${courseId}`);
                                  }}
                                  className="self-end sm:self-center px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 cursor-pointer"
                                >
                                  Explore <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                    AI
                  </div>
                  <div className="bg-surface-container-lowest border border-surface-dim/20 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-surface-container-lowest border-t border-surface-dim/20 flex gap-2.5 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder="Ask about courses, interests..."
                className="flex-grow px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-primary text-on-primary disabled:opacity-30 disabled:scale-100 hover:scale-105 active:scale-95 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        style={{ touchAction: "none" }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 signature-gradient rounded-full flex items-center justify-center text-white shadow-2xl relative cursor-pointer group"
      >
        <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isOpen ? (
          <X className="w-6 h-6 rotate-90 transition-transform duration-300" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-primary text-[8px] font-black text-primary">
              <Sparkles className="w-2 h-2 text-white fill-white" />
            </span>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}
