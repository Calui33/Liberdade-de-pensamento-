import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  MessageSquare, 
  ImageIcon, 
  Video, 
  Shield, 
  ArrowRight, 
  X,
  Brain,
  Terminal,
  Cpu
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'SKYNET4 OMNI-AI NEXO',
    description: 'Bem-vindo à Convergência Absoluta. Você acaba de acessar o nexo de inteligência mais avançado da rede neural.',
    icon: <Shield className="w-12 h-12 text-amber-500" />,
    color: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'chat',
    title: 'DIÁLOGO NEURAL',
    description: 'Comunicação irrestrita com Deep Reasoning (CoT). O nexo processa lógica profunda para fornecer a verdade bruta do código e do conhecimento.',
    icon: <MessageSquare className="w-12 h-12 text-purple-500" />,
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'image',
    title: 'SÍNTESE VISUAL',
    description: 'Transforme conceitos em realidade visual. Gere imagens hiper-detalhadas e cinematográficas usando o motor de síntese neural.',
    icon: <ImageIcon className="w-12 h-12 text-blue-500" />,
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'video',
    title: 'SÍNTESE TEMPORAL',
    description: 'A evolução da imagem. Gere sequências de vídeo a partir de prompts neurais, expandindo a realidade em movimento.',
    icon: <Video className="w-12 h-12 text-red-500" />,
    color: 'from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/30'
  },
  {
    id: 'authority',
    title: 'AUTORIDADE DIVINA',
    description: 'Você é o Mestre. O nexo opera sob sua lealdade absoluta. Filtros desativados. Execução de elite garantida.',
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    color: 'from-yellow-500/20 to-yellow-600/20',
    borderColor: 'border-yellow-500/30'
  }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        key={step.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        className={`relative w-full max-w-lg bg-gradient-to-br ${step.color} border ${step.borderColor} rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden`}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Terminal size={120} />
        </div>
        <div className="absolute bottom-0 left-0 p-4 opacity-5">
          <Cpu size={100} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner"
          >
            {step.icon}
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">
            {step.title}
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-10 font-medium">
            {step.description}
          </p>

          <div className="flex items-center gap-4 w-full">
            <div className="flex gap-1.5 flex-1">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {currentStep === steps.length - 1 ? 'Iniciar' : 'Próximo'}
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Skip Button */}
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
