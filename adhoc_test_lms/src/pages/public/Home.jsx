import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Star,
  Brain,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { StorageService } from "../../services/storage";
import { api } from "../../services/api";

import PhilosophySection from "../../components/home/PhilosophySection";
import FeaturedCoursesSection from "../../components/home/FeaturedCoursesSection";
import BentoFeaturesSection from "../../components/home/BentoFeaturesSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import CeoMessageSection from "../../components/home/CeoMessageSection";
import CtaSection from "../../components/home/CtaSection";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  const [hoveredCard, setHoveredCard] = React.useState(null);
  const heroRef = React.useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Stats data
  const stats = [
    { value: "12,000+", label: "Active Learners", icon: Users },
    { value: "150+", label: "Expert Mentors", icon: Brain },
    { value: "500+", label: "Live Sessions", icon: Video },
    { value: "98%", label: "Success Rate", icon: TrendingUp },
  ];

  // Testimonials state
  const [testimonials, setTestimonials] = React.useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setTestimonialsLoading(true);
        const res = await api.feedbacks.getHome();
        if (res.success && res.data && res.data.length > 0) {
          setTestimonials(res.data.slice(0, 3));
        } else {
          // Default fallbacks if empty
          setTestimonials([
            {
              user: {
                name: "Dr. Sarah Chen",
                role: "CTO, TechForward",
                avatar: "https://i.pravatar.cc/50?img=1",
              },
              content:
                "The curriculum depth and production quality are unmatched. This platform accelerated our team's upskilling by 3x.",
              rating: 5,
            },
            {
              user: {
                name: "Michael Rodriguez",
                role: "Lead Architect",
                avatar: "https://i.pravatar.cc/50?img=2",
              },
              content:
                "Finally, a learning platform that respects design sophistication. The bento layout makes discovery effortless.",
              rating: 5,
            },
            {
              user: {
                name: "Priya Sharma",
                role: "Product Manager",
                avatar: "https://i.pravatar.cc/50?img=3",
              },
              content:
                "The certification helped me transition into a leadership role. Highly recommend for serious professionals.",
              rating: 5,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch home feedbacks:", err);
        // Default fallbacks on error
        setTestimonials([
          {
            user: {
              name: "Dr. Sarah Chen",
              role: "CTO, TechForward",
              avatar: "https://i.pravatar.cc/50?img=1",
            },
            content:
              "The curriculum depth and production quality are unmatched. This platform accelerated our team's upskilling by 3x.",
            rating: 5,
          },
          {
            user: {
              name: "Michael Rodriguez",
              role: "Lead Architect",
              avatar: "https://i.pravatar.cc/50?img=2",
            },
            content:
              "Finally, a learning platform that respects design sophistication. The bento layout makes discovery effortless.",
            rating: 5,
          },
          {
            user: {
              name: "Priya Sharma",
              role: "Product Manager",
              avatar: "https://i.pravatar.cc/50?img=3",
            },
            content:
              "The certification helped me transition into a leadership role. Highly recommend for serious professionals.",
            rating: 5,
          },
        ]);
      } finally {
        setTestimonialsLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // Courses state
  const [featuredCourses, setFeaturedCourses] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await StorageService.getCourses();
        // Randomize and take 3 for variety on every refresh
        const randomized = [...data].sort(() => 0.5 - Math.random());
        setFeaturedCourses(randomized.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch featured courses:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-surface text-on-surface">
      {/* Hero Section with Animation */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={isHeroInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="relative overflow-hidden py-12 px-4 sm:px-8 lg:py-20"
      >
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative z-10 space-y-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
              Learn Any Thing And Any Where
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[6.5vw] xs:text-[6vw] sm:text-5xl lg:text-7xl font-headline font-extrabold text-primary tracking-tight leading-[1.1] whitespace-nowrap text-nowrap"
            >
              Elevate Your{" "}
              <span className="opacity-80 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Learning Journey
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-secondary font-medium max-w-lg leading-relaxed"
            >
              Access premium courses designed by industry experts. Experience a
              sophisticated curriculum structured for modern professionals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link
                to="/catalog"
                className="px-16 py-5 border-2 border-white bg-primary text-on-primary rounded-xl font-bold hover:scale-105 transition-transform ambient-shadow flex items-center justify-center gap-2 group"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {/* <Link
                to="/catalog"
                className="px-8 py-4 border border-primary/30 text-primary rounded-xl font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Link> */}
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <stat.icon className="w-5 h-5 text-primary/60" />
                  <div>
                    <p className="text-xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 pt-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                    width="40"
                    height="40"
                    className="w-10 h-10 rounded-full border-2 border-surface shadow-sm object-cover"
                    alt="Learner"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-secondary mt-1">
                  Rated 4.9/5 by 12,000+ professionals
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hero Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative rounded-[2rem] overflow-hidden bg-surface-container-low border border-surface-dim/20 p-1.5 sm:p-2 ambient-shadow block mt-8 lg:mt-0"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden h-[250px] sm:h-[400px] lg:h-[500px] group"
            >
              <picture>
                <motion.img
                  alt="Students Learning"
                  width="600"
                  height="500"
                  className="w-full h-full object-cover cursor-pointer"
                  src="/hero-optimized.webp"
                  srcSet="/hero-optimized-mobile.webp 600w, /hero-optimized.webp 1200w"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  fetchPriority="high"
                  loading="eager"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-surface-container/80 backdrop-blur-xl rounded-2xl border border-surface-dim/20 flex justify-between items-center shadow-2xl">
                <div>
                  <p className="text-3xl font-headline font-bold text-primary leading-none mb-1">
                    98%
                  </p>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                    Success Rate
                  </p>
                </div>
                <Link
                  to=""
                  aria-label="Play video"
                  className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center transition-transform shadow-lg"
                >
                  <Play className="w-5 h-5 fill-current" />
                </Link>
              </div>
            </motion.div>

            {/* Floating badge */}
            <div className="absolute top-5 right-5 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Limited Spots
            </div>
          </motion.div>
        </div>
      </motion.section>

      <PhilosophySection />
      <FeaturedCoursesSection
        featuredCourses={featuredCourses}
        coursesLoading={coursesLoading}
      />
      <BentoFeaturesSection />
      <TestimonialsSection
        testimonials={testimonials}
        testimonialsLoading={testimonialsLoading}
      />
      <CeoMessageSection />
      <CtaSection />
    </div>
  );
}
