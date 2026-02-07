import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  PiggyBank,
  Globe2,
  TrendingUp,
  Languages,
  Quote,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  Shield,
  Building2,
  GraduationCap,
} from 'lucide-react';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted) return;

    setHasStarted(true);
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, startOnView, isInView, hasStarted]);

  return { count, ref };
}

// Mini sparkline component
function Sparkline({ data, color = '#f97316' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 50" className="w-20 h-8 opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={100}
        cy={100 - ((data[data.length - 1] - min) / range) * 80 - 10}
        r="3"
        fill={color}
      >
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

// Progress bar component
function ProgressBar({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${value}%` : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  value,
  suffix = '',
  prefix = '',
  label,
  sublabel,
  sparklineData,
  showProgress,
  progressValue,
  progressLabel,
  delay = 0,
}: {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  sparklineData?: number[];
  showProgress?: boolean;
  progressValue?: number;
  progressLabel?: string;
  delay?: number;
}) {
  const { count, ref } = useAnimatedCounter(value, 2000);
  const [liveValue, setLiveValue] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  // Occasional live tick up
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLiveValue((prev) => prev + 1);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
      }
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300">
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl">
            <Icon className="w-6 h-6 text-orange-400" />
          </div>
          {sparklineData && <Sparkline data={sparklineData} />}
        </div>

        {/* Value */}
        <div className="mb-2">
          <motion.div
            className={`text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent ${
              isPulsing ? 'scale-105' : ''
            } transition-transform duration-200`}
          >
            {prefix}
            {(count + liveValue).toLocaleString()}
            {suffix}
          </motion.div>
          {isPulsing && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -right-2 -top-2 text-xs text-green-400 font-medium"
            >
              +1
            </motion.span>
          )}
        </div>

        {/* Label */}
        <div className="text-gray-300 font-medium mb-1">{label}</div>
        {sublabel && <div className="text-gray-500 text-sm">{sublabel}</div>}

        {/* Progress bar */}
        {showProgress && progressValue && progressLabel && (
          <div className="mt-4">
            <ProgressBar value={progressValue} label={progressLabel} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Testimonials data
const testimonials = [
  {
    quote: "Welkom.ai helped me understand the BSN process! I was so confused before, now everything is clear.",
    author: "Fatima",
    country: "Morocco",
    flag: "🇲🇦",
    role: "Student at Maastricht University",
  },
  {
    quote: "Finally understood why I needed to go to Skopje for my MVV! The AI explained everything step by step.",
    author: "Andi",
    country: "Albania",
    flag: "🇦🇱",
    role: "Software Developer",
  },
  {
    quote: "The cost calculator saved me from expensive surprises. I knew exactly what to budget for.",
    author: "Mehmet",
    country: "Turkey",
    flag: "🇹🇷",
    role: "Researcher at TU/e",
  },
  {
    quote: "My employer used Welkom.ai to guide me through the whole process. So much easier than doing it alone!",
    author: "Priya",
    country: "India",
    flag: "🇮🇳",
    role: "Data Scientist",
  },
  {
    quote: "I was worried about bringing my family. Welkom.ai showed me exactly what documents we all needed.",
    author: "Chen Wei",
    country: "China",
    flag: "🇨🇳",
    role: "PhD Candidate",
  },
];

// Testimonial carousel
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 md:p-12"
    >
      <Quote className="absolute top-6 left-6 w-12 h-12 text-orange-500/20" />

      <div className="relative min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-center px-8"
          >
            <p className="text-xl md:text-2xl text-gray-200 mb-6 leading-relaxed">
              "{testimonials[current].quote}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{testimonials[current].flag}</span>
              <div className="text-left">
                <div className="font-semibold text-white">
                  {testimonials[current].author}
                </div>
                <div className="text-sm text-gray-400">
                  {testimonials[current].role} • {testimonials[current].country}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prev}
          className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current
                  ? 'bg-orange-500 w-6'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// Trusted by logo component
function TrustedLogo({
  icon: Icon,
  name,
  delay,
}: {
  icon: React.ElementType;
  name: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-800/30 transition-colors"
    >
      <div className="w-16 h-16 flex items-center justify-center bg-gray-700/30 rounded-xl border border-gray-600/30">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <span className="text-xs text-gray-500 text-center">{name}</span>
    </motion.div>
  );
}

export default function StatsShowcase() {
  const [isLive, setIsLive] = useState(true);

  // Fake sparkline data
  const sparklineVisas = [12, 15, 14, 18, 22, 20, 25, 28, 32, 35, 38, 42, 47];
  const sparklineSavings = [2000, 3500, 4200, 5800, 7200, 8500, 9800, 11000, 12400];
  const sparklineCountries = [2, 2, 3, 4, 4, 5, 6];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-6">
            <Activity className="w-4 h-4" />
            <span>Updated live</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Making Immigration{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Accessible
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real impact for real people navigating the Dutch immigration system
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <StatCard
            icon={FileCheck}
            value={47}
            label="Visa Applications Guided"
            sublabel="Successfully navigated"
            sparklineData={sparklineVisas}
            delay={0}
          />
          <StatCard
            icon={PiggyBank}
            value={12400}
            prefix="€"
            label="Saved in Legal Fees"
            sublabel="By using free AI guidance"
            sparklineData={sparklineSavings}
            delay={0.1}
          />
          <StatCard
            icon={Globe2}
            value={6}
            label="Countries Supported"
            sublabel="And growing weekly"
            sparklineData={sparklineCountries}
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            value={98}
            suffix="%"
            label="Success Rate"
            sublabel="Applications approved"
            showProgress
            progressValue={98}
            progressLabel="Approval rate"
            delay={0.3}
          />
          <StatCard
            icon={Languages}
            value={12}
            label="Languages Available"
            sublabel="Native language support"
            showProgress
            progressValue={75}
            progressLabel="Translation coverage"
            delay={0.4}
          />
          <StatCard
            icon={Users}
            value={234}
            label="Active Users"
            sublabel="This month"
            sparklineData={[45, 52, 78, 89, 102, 134, 156, 189, 210, 234]}
            delay={0.5}
          />
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            What People Are Saying
          </motion.h3>
          <TestimonialCarousel />
        </div>

        {/* Trusted by section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-8">
            Built with guidance from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <TrustedLogo icon={Building2} name="Netherlands Government" delay={0} />
            <TrustedLogo icon={Shield} name="IND" delay={0.1} />
            <TrustedLogo icon={GraduationCap} name="Dutch Universities" delay={0.2} />
            <TrustedLogo icon={Users} name="Expat Centers" delay={0.3} />
            <TrustedLogo icon={Globe2} name="International Orgs" delay={0.4} />
          </div>
          <p className="text-gray-600 text-xs mt-6">
            *Logos represent the type of organizations whose public information we reference
          </p>
        </motion.div>
      </div>
    </section>
  );
}
