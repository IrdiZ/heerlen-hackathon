'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { Roadmap, RoadmapStep, RoadmapStepStatus } from '@/lib/roadmap-types';

// ============================================
// TYPES
// ============================================

interface JourneyTimelineProps {
  roadmap: Roadmap;
  startDate?: Date;
  onStartDateChange?: (date: Date) => void;
  onStepClick?: (step: RoadmapStep) => void;
  onStatusChange?: (stepId: string, status: RoadmapStepStatus) => void;
  orientation?: 'horizontal' | 'vertical';
  theme?: 'dark' | 'light';
}

interface TimelineStep extends RoadmapStep {
  calculatedDate: Date;
  daysFromStart: number;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const stepTypeIcons: Record<string, string> = {
  document: '📄',
  docs: '📄',
  embassy: '🏛️',
  appointment: '🏛️',
  travel: '✈️',
  flight: '✈️',
  arrival: '🏠',
  housing: '🏠',
  registration: '📋',
  permit: '🪪',
  default: '📍',
};

function getStepIcon(step: RoadmapStep): string {
  const title = step.title.toLowerCase();
  for (const [key, icon] of Object.entries(stepTypeIcons)) {
    if (title.includes(key)) return icon;
  }
  return stepTypeIcons.default;
}

function parseEstimatedDays(estimatedTime?: string): number {
  if (!estimatedTime) return 7;
  const lower = estimatedTime.toLowerCase();
  
  // Parse ranges like "2-4 weeks" - take the upper bound
  const rangeMatch = lower.match(/(\d+)\s*-\s*(\d+)\s*(day|week|month)/);
  if (rangeMatch) {
    const upper = parseInt(rangeMatch[2]);
    if (rangeMatch[3].includes('week')) return upper * 7;
    if (rangeMatch[3].includes('month')) return upper * 30;
    return upper;
  }
  
  const dayMatch = lower.match(/(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1]);
  
  const weekMatch = lower.match(/(\d+)\s*week/);
  if (weekMatch) return parseInt(weekMatch[1]) * 7;
  
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (monthMatch) return parseInt(monthMatch[1]) * 30;
  
  return 7;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

function calculateTimelineSteps(steps: RoadmapStep[], startDate: Date): TimelineStep[] {
  let cumulativeDays = 0;
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  
  return sorted.map((step, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + cumulativeDays);
    const daysFromStart = cumulativeDays;
    cumulativeDays += parseEstimatedDays(step.estimatedTime);
    
    return {
      ...step,
      calculatedDate: date,
      daysFromStart,
    };
  });
}

function generateICSEvent(step: TimelineStep, roadmapName: string): string {
  const startDate = step.calculatedDate;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + parseEstimatedDays(step.estimatedTime));
  
  const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Immigration Journey//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${step.title} - ${roadmapName}
DESCRIPTION:${step.description.replace(/\n/g, '\\n')}${step.tips?.length ? '\\n\\nTips:\\n' + step.tips.join('\\n') : ''}
LOCATION:Immigration Process
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

// ============================================
// PARTICLE SYSTEM
// ============================================

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

function ParticleEffect({ active, x, y }: { active: boolean; x: number; y: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    
    // Create particles
    const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    
    setParticles(newParticles);
    
    const animate = () => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 0.02,
        }))
        .filter(p => p.life > 0)
      );
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: x + p.x,
            top: y + p.y,
            backgroundColor: p.color,
            opacity: p.life,
            transform: `scale(${p.life})`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// STEP NODE COMPONENT
// ============================================

interface StepNodeProps {
  step: TimelineStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isFuture: boolean;
  onSelect: () => void;
  orientation: 'horizontal' | 'vertical';
  theme: 'dark' | 'light';
  roadmapName: string;
}

function StepNode({ 
  step, 
  index, 
  isActive, 
  isCompleted, 
  isFuture, 
  onSelect,
  orientation,
  theme,
  roadmapName,
}: StepNodeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const icon = getStepIcon(step);
  const duration = step.estimatedTime || '~1 week';
  
  const handleAddToCalendar = () => {
    const icsContent = generateICSEvent(step, roadmapName);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${step.title.replace(/\s+/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  useEffect(() => {
    if (isCompleted) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);
  
  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }
    },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };
  
  const detailsVariants = {
    hidden: { 
      opacity: 0, 
      y: orientation === 'horizontal' ? -20 : 0,
      x: orientation === 'vertical' ? -20 : 0,
      scale: 0.9,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.15 }
    },
  };
  
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      ref={nodeRef}
      className={`relative ${orientation === 'horizontal' ? 'flex flex-col items-center' : 'flex flex-row items-center gap-4'}`}
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Particle Effect */}
      <ParticleEffect active={showParticles} x={32} y={32} />
      
      {/* Main Node */}
      <motion.button
        onClick={() => {
          setShowDetails(!showDetails);
          onSelect();
        }}
        className={`
          relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl
          transition-all duration-300 cursor-pointer
          ${isCompleted 
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/40' 
            : isActive 
              ? 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 shadow-xl shadow-orange-500/50' 
              : isFuture 
                ? isDark 
                  ? 'bg-slate-800/80 border border-slate-600/50 opacity-60' 
                  : 'bg-white/80 border border-slate-200 opacity-60'
                : isDark 
                  ? 'bg-slate-700 border border-slate-500' 
                  : 'bg-white border-2 border-slate-200'
          }
        `}
        style={{
          boxShadow: isActive 
            ? '0 0 30px rgba(249, 115, 22, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)' 
            : undefined,
        }}
      >
        {/* Glow ring for active step */}
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.4)',
                  '0 0 40px rgba(168, 85, 247, 0.6)',
                  '0 0 20px rgba(249, 115, 22, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 opacity-50 blur-md"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
        
        {/* Checkmark overlay for completed */}
        {isCompleted ? (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-white text-3xl"
          >
            ✓
          </motion.span>
        ) : (
          <span className={isFuture ? 'opacity-50' : ''}>{icon}</span>
        )}
      </motion.button>
      
      {/* Date Badge */}
      <motion.div
        className={`
          mt-2 px-3 py-1 rounded-full text-xs font-semibold
          ${isDark 
            ? 'bg-slate-800/90 text-slate-300' 
            : 'bg-white/90 text-slate-600 shadow-sm border border-slate-100'
          }
          ${isFuture ? 'opacity-50' : ''}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isFuture ? 0.5 : 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        {formatDate(step.calculatedDate)}
      </motion.div>
      
      {/* Duration Badge */}
      <motion.div
        className={`
          mt-1 px-2 py-0.5 rounded text-xs
          ${isDark 
            ? 'bg-orange-500/20 text-orange-300' 
            : 'bg-orange-100 text-orange-600'
          }
          ${isFuture ? 'opacity-40' : ''}
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFuture ? 0.4 : 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {duration}
      </motion.div>
      
      {/* Step Title */}
      <motion.p
        className={`
          mt-2 text-center text-sm font-medium max-w-[120px] line-clamp-2
          ${isDark ? 'text-slate-200' : 'text-slate-700'}
          ${isFuture ? 'opacity-50' : ''}
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFuture ? 0.5 : 1 }}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        {step.title}
      </motion.p>
      
      {/* Expanded Details Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              absolute z-50 w-72 p-4 rounded-2xl shadow-2xl
              ${orientation === 'horizontal' 
                ? 'top-full mt-4 left-1/2 -translate-x-1/2' 
                : 'left-full ml-4 top-0'
              }
              ${isDark 
                ? 'bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl' 
                : 'bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arrow */}
            <div 
              className={`
                absolute w-3 h-3 rotate-45
                ${orientation === 'horizontal' 
                  ? '-top-1.5 left-1/2 -translate-x-1/2' 
                  : 'left-0 top-4 -translate-x-1/2'
                }
                ${isDark ? 'bg-slate-900 border-l border-t border-slate-700/50' : 'bg-white border-l border-t border-slate-200'}
              `} 
            />
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Step {step.order} • {formatDate(step.calculatedDate)}
                  </p>
                </div>
              </div>
              
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {step.description}
              </p>
              
              {/* Fees */}
              {step.fees && step.fees.length > 0 && (
                <div className={`mb-3 p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    💰 Fees
                  </p>
                  {step.fees.map((fee, i) => (
                    <p key={i} className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      €{fee.amount} - {fee.description}
                    </p>
                  ))}
                </div>
              )}
              
              {/* Tips */}
              {step.tips && step.tips.length > 0 && (
                <div className={`mb-3 p-2 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    💡 Tips
                  </p>
                  <ul className="space-y-1">
                    {step.tips.slice(0, 2).map((tip, i) => (
                      <li key={i} className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddToCalendar}
                  className={`
                    flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                  `}
                >
                  📅 Add to Calendar
                </button>
                {step.primaryAction && (
                  <a
                    href={step.primaryAction.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex-1 px-3 py-2 text-xs font-semibold rounded-lg text-center transition-all
                      ${isDark 
                        ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }
                    `}
                  >
                    🔗 {step.primaryAction.label}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN TIMELINE COMPONENT
// ============================================

export function JourneyTimeline({
  roadmap,
  startDate = new Date(),
  onStartDateChange,
  onStepClick,
  onStatusChange,
  orientation = 'horizontal',
  theme = 'dark',
}: JourneyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [isDragging, setIsDragging] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const dragX = useMotionValue(0);
  const springX = useSpring(dragX, { stiffness: 300, damping: 30 });
  
  const timelineSteps = useMemo(
    () => calculateTimelineSteps(roadmap.steps, localStartDate),
    [roadmap.steps, localStartDate]
  );
  
  const completedCount = roadmap.steps.filter(s => s.status === 'complete').length;
  const currentStepIndex = roadmap.steps
    .sort((a, b) => a.order - b.order)
    .findIndex(s => s.status !== 'complete');
  const progress = roadmap.steps.length > 0 
    ? (completedCount / roadmap.steps.length) * 100 
    : 0;
  
  const totalDays = timelineSteps.length > 0 
    ? timelineSteps[timelineSteps.length - 1].daysFromStart + 
      parseEstimatedDays(timelineSteps[timelineSteps.length - 1].estimatedTime)
    : 0;
  
  const handleDateDrag = useCallback((_: any, info: PanInfo) => {
    const daysChange = Math.round(info.offset.x / 50);
    if (Math.abs(daysChange) > 0) {
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() - daysChange);
      setLocalStartDate(newDate);
      onStartDateChange?.(newDate);
    }
  }, [startDate, onStartDateChange]);
  
  const handleShare = async () => {
    try {
      // Generate shareable image using html2canvas (if available)
      // For now, we'll create a text-based share
      const shareText = `🗺️ My Immigration Journey - ${roadmap.name}\n\n` +
        timelineSteps.map(s => 
          `${s.status === 'complete' ? '✅' : s.status === 'in-progress' ? '🔄' : '⏳'} ${s.title} - ${formatDate(s.calculatedDate)}`
        ).join('\n') +
        `\n\n📊 Progress: ${Math.round(progress)}% complete!`;
      
      if (navigator.share) {
        await navigator.share({
          title: `My Immigration Journey - ${roadmap.name}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShowShareModal(true);
        setTimeout(() => setShowShareModal(false), 2000);
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };
  
  const isDark = theme === 'dark';
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-3xl
        ${isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
        }
      `}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
            top: '-10%',
            left: '-10%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            bottom: '-10%',
            right: '-10%',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Grid pattern */}
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-10'}`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'white' : 'black'} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent`}>
              {roadmap.name}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {completedCount} of {roadmap.steps.length} steps complete • ~{totalDays} days total
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Start Date Picker */}
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-xl
              ${isDark ? 'bg-slate-800/80' : 'bg-white shadow-sm border border-slate-200'}
            `}>
              <span className="text-sm">📅</span>
              <input
                type="date"
                value={localStartDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setLocalStartDate(newDate);
                  onStartDateChange?.(newDate);
                }}
                className={`
                  bg-transparent text-sm font-medium outline-none cursor-pointer
                  ${isDark ? 'text-slate-200' : 'text-slate-700'}
                `}
              />
            </div>
            
            {/* Share Button */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
                bg-gradient-to-r from-purple-500 to-blue-500 text-white
                shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
                transition-shadow
              `}
            >
              <span>🔗</span>
              Share Journey
            </motion.button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 relative h-2 rounded-full overflow-hidden bg-slate-700/30">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
        </div>
      </div>
      
      {/* Timeline Container */}
      <motion.div
        ref={containerRef}
        className={`
          relative p-8 overflow-x-auto overflow-y-visible
          ${orientation === 'horizontal' ? 'pb-16' : 'min-h-[600px]'}
        `}
        drag={orientation === 'horizontal' ? 'x' : false}
        dragConstraints={containerRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          handleDateDrag(e, info);
        }}
        style={{ x: springX }}
      >
        {/* Timeline Line */}
        <div 
          className={`
            absolute
            ${orientation === 'horizontal' 
              ? 'top-[60px] left-8 right-8 h-1' 
              : 'left-[40px] top-8 bottom-8 w-1'
            }
          `}
        >
          {/* Base line with gradient */}
          <div 
            className={`
              absolute rounded-full
              ${orientation === 'horizontal' ? 'inset-0' : 'inset-0'}
            `}
            style={{
              background: orientation === 'horizontal'
                ? 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #3b82f6 100%)'
                : 'linear-gradient(180deg, #f97316 0%, #ec4899 50%, #3b82f6 100%)',
            }}
          />
          
          {/* Animated glow */}
          <motion.div
            className="absolute rounded-full blur-sm"
            style={{
              background: 'linear-gradient(90deg, #f97316, #ec4899, #3b82f6)',
              ...(orientation === 'horizontal' 
                ? { inset: '-2px', height: '8px' }
                : { inset: '-2px', width: '8px' }
              ),
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Flowing particle effect */}
          <motion.div
            className={`
              absolute rounded-full bg-white shadow-lg shadow-white/50
              ${orientation === 'horizontal' ? 'w-3 h-3 -top-1' : 'w-3 h-3 -left-1'}
            `}
            animate={orientation === 'horizontal' 
              ? { left: ['0%', '100%'] }
              : { top: ['0%', '100%'] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        
        {/* Step Nodes */}
        <div 
          className={`
            relative flex
            ${orientation === 'horizontal' 
              ? 'flex-row gap-16 pt-8 min-w-max' 
              : 'flex-col gap-12 pl-20'
            }
          `}
        >
          {timelineSteps.map((step, index) => {
            const isCompleted = step.status === 'complete';
            const isActive = index === currentStepIndex;
            const isFuture = index > currentStepIndex;
            
            return (
              <StepNode
                key={step.id}
                step={step}
                index={index}
                isActive={isActive}
                isCompleted={isCompleted}
                isFuture={isFuture}
                onSelect={() => {
                  setSelectedStep(step.id);
                  onStepClick?.(step);
                }}
                orientation={orientation}
                theme={theme}
                roadmapName={roadmap.name}
              />
            );
          })}
        </div>
      </motion.div>
      
      {/* Drag Hint */}
      {orientation === 'horizontal' && (
        <motion.div
          className={`
            absolute bottom-4 left-1/2 -translate-x-1/2 
            px-4 py-2 rounded-full text-xs font-medium
            flex items-center gap-2
            ${isDark ? 'bg-slate-800/90 text-slate-400' : 'bg-white/90 text-slate-500 shadow-sm'}
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.span
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↔️
          </motion.span>
          Drag to scroll • Click steps for details
        </motion.div>
      )}
      
      {/* Share Toast */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`
              absolute top-4 left-1/2 -translate-x-1/2 z-50
              px-6 py-3 rounded-xl font-medium
              bg-gradient-to-r from-emerald-500 to-teal-500 text-white
              shadow-xl shadow-emerald-500/30
            `}
          >
            ✓ Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legend */}
      <div className={`
        px-6 py-4 border-t flex items-center justify-center gap-8
        ${isDark ? 'border-slate-700/30' : 'border-slate-200'}
      `}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-teal-500" />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 animate-pulse" />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Step</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded opacity-50 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Upcoming</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FULL PAGE JOURNEY VIEW (Optional wrapper)
// ============================================

export function JourneyTimelineFullPage(props: JourneyTimelineProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <JourneyTimeline {...props} />
      </div>
    </div>
  );
}

export default JourneyTimeline;
