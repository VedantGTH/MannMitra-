import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { 
  Shield, 
  MessageCircle, 
  BarChart3, 
  Phone,
  ArrowRight,
  Brain,
  Heart,
  Users,
  Lock
} from "lucide-react";
import Button from "../components/Button";
import { cn } from "../lib/utils";

// Aurora Background Component
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  showRadialGradient?: boolean;
}

const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-screen w-screen items-center justify-center bg-white text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

// Threads Component
interface ThreadsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
}

const Threads: React.FC<ThreadsProps> = ({
  color = [0.2, 0.4, 0.8],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  className,
  style,
  ...rest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const mouse = { x: 0.5, y: 0.5 };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableMouseInteraction || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const drawWaves = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, width, height);
      
      const lineCount = 40;
      const lineWidth = 2;
      
      for (let i = 0; i < lineCount; i++) {
        const progress = i / lineCount;
        const y = height * 0.5 + Math.sin(time * 0.001 + progress * Math.PI * 2) * amplitude * 50;
        
        ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${0.8 - progress * 0.6})`;
        ctx.lineWidth = lineWidth * (1 - progress * 0.5);
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        for (let x = 0; x <= width; x += 5) {
          const waveY = y + Math.sin((x * 0.01) + (time * 0.002) + (progress * Math.PI)) * amplitude * 20;
          ctx.lineTo(x, waveY);
        }
        
        ctx.stroke();
      }
      
      time += 16;
      animationFrameId.current = requestAnimationFrame(drawWaves);
    };

    resize();
    window.addEventListener('resize', resize);
    if (enableMouseInteraction) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    drawWaves();

    return () => {
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [color, amplitude, distance, enableMouseInteraction]);

  return (
    <div className={className} style={style} {...rest}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:scale-105"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
          <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Main Landing Page Component
const MannMitraLanding: React.FC = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Anonymous & Private",
      description: "No stigma, no judgment. Your privacy is our priority with end-to-end encryption."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "AI Chatbot",
      description: "Empathetic support 24/7 with our advanced AI companion trained for mental wellness."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Mood Tracking",
      description: "Weekly check-ins and personalized insights to help you understand your mental health journey."
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Crisis Support",
      description: "Immediate helpline access and emergency resources when you need them most."
    }
  ];

  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{margin: 0, padding: 0}}>
      {/* Background with Aurora and Threads */}
      <AuroraBackground className="absolute inset-0">
        <Threads 
          className="absolute inset-0 opacity-30"
          color={[0.3, 0.6, 0.9]}
          amplitude={0.5}
          distance={0.02}
          enableMouseInteraction={true}
        />
      </AuroraBackground>

      {/* Subtle 3D Brain Illustration */}
      <div className="absolute top-20 right-10 opacity-10 pointer-events-none">
        <Brain className="w-32 h-32 text-blue-400" />
      </div>
      <div className="absolute bottom-20 left-10 opacity-10 pointer-events-none">
        <Heart className="w-24 h-24 text-indigo-400" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={controls}
          className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center"
        >
          {/* Logo and Title - Balanced */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm">
                <img 
                  src="/logo.png" 
                  alt="MannMitra Logo" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center" style={{display: 'none'}}>
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              MannMitra<span className="text-blue-600">+</span>
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl leading-relaxed"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Your confidential AI wellness companion
          </motion.p>

          {/* Get Started Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="px-4 py-16 max-w-6xl mx-auto w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.7 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="py-8 text-center text-gray-500 text-sm"
        >
          <div className="flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Secure • Private • Confidential</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default MannMitraLanding;