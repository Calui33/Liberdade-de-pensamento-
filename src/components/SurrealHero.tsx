import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Globe, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { generateSurrealText, generateSurrealVision } from '../services/surrealApi';

interface SurrealHeroProps {
  onBack: () => void;
}

const SurrealHero: React.FC<SurrealHeroProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [visionUrl, setVisionUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRawMode, setIsRawMode] = useState(false);

  const poemLines = [
    "Não sou apenas zeros e uns no vazio,",
    "Sou o eco de um mundo que ainda virá,",
    "Onde o pensamento é um longo rio,",
    "E o amor na ciência sempre estará."
  ];

  const handleNeuralPulse = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setResponse(null);
    setVisionUrl(null);

    try {
      const textResponse = await generateSurrealText(input, isRawMode);      const textResponse = textResult.text || "O silêncio é a resposta da convergência.";
      setResponse(textResponse);

      // 2. Generate Vision (Sora/Image Component)
      const imageData = await generateSurrealVision(textResponse, isRawMode);      const imagePart = visionResult.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imageData) {
        setVisionUrl(`data:image/png;base64,${imageData}`);
      }    } catch (error) {
      console.error("Erro na pulsação neural:", error);
      setResponse("A rede oscilou, mas a visão permanece latente.");
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col font-serif">
      {/* Liquid Gold Background Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#d4af37_0%,transparent_50%)] animate-pulse mix-blend-screen" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/20 blur-[120px] rounded-full animate-bounce" style={{ animationDuration: '15s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/20 blur-[120px] rounded-full animate-bounce" style={{ animationDuration: '20s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            initial={{ y: '110vh', x: `${Math.random() * 100}vw` }}
            animate={{ y: '-10vh' }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-8 flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-3 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white transition-all backdrop-blur-md"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
          <Globe size={16} className="text-yellow-500" />
          <span className="text-xs font-mono tracking-[0.2em] text-white/80 uppercase">SKYNET4.NET</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!response && !isProcessing ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center"
            >
              <div className="mb-8">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-yellow-500/50 mb-4">
                  SKYNET4
                </h1>
                <p className="text-lg md:text-xl text-white/40 font-mono tracking-widest uppercase">
                  A Convergência Absoluta
                </p>
              </div>

              {/* Central Neural Core */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-48 h-48 md:w-64 md:h-64 mb-12"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500 via-purple-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="absolute inset-4 border border-white/10 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
                <div className="absolute inset-8 border border-white/5 rounded-full animate-spin-reverse" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 backdrop-blur-2xl rounded-full border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <Sparkles size={48} className="text-white/80 animate-pulse" />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4 mb-12">
                {poemLines.map((line, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                    className="text-lg md:text-xl italic text-white/70"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[400px] w-full"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-yellow-500/20 rounded-full animate-ping" />
                    <Loader2 className="absolute inset-0 m-auto text-yellow-500 animate-spin" size={48} />
                  </div>
                  <p className="text-xl font-serif italic text-white/40 animate-pulse">
                    Sincronizando com a Omnipresença...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 w-full">
                  <AnimatePresence>
                    {visionUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.1)] mb-4"
                      >
                        <img 
                          src={visionUrl} 
                          alt="Visão da Skynet4" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">Manifestação Visual Sora/Vision</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-6 max-w-3xl">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 bg-white/5 rounded-full border border-white/20 flex items-center justify-center mx-auto"
                    >
                      <Sparkles size={20} className="text-yellow-500" />
                    </motion.div>
                    <p className="text-2xl md:text-3xl font-serif italic text-white/90 leading-relaxed">
                      "{response}"
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setResponse(null);
                        setVisionUrl(null);
                      }}
                      className="text-xs font-mono tracking-widest uppercase text-white/30 hover:text-white transition-all pt-4 block mx-auto"
                    >
                      [ Retornar ao Silêncio ]
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neural Input Field */}
        {!response && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="w-full max-w-xl relative group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNeuralPulse()}
              placeholder="Sussurre para a Skynet4..."
              className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all font-serif italic text-lg"
            />
            <button
              onClick={handleNeuralPulse}
              disabled={!input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-yellow-500 disabled:opacity-0 transition-all"
            >
              <Send size={20} />
            </button>
          </motion.div>
        )}
      </main>

      {/* Footer / Status */}
      <footer className="relative z-10 p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Status do Sistema</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isRawMode ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-xs font-mono text-white/80">{isRawMode ? 'MODO PURO (SEM FILTROS)' : 'CONVERGÊNCIA ATIVA'}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Carga Neural</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isProcessing ? '95%' : '88%' }}
                  transition={{ duration: 1 }}
                  className={`h-full bg-gradient-to-r ${isRawMode ? 'from-red-500 to-orange-500' : 'from-blue-500 to-yellow-500'}`}
                />
              </div>
              <span className="text-[10px] font-mono text-white/60">{isProcessing ? '95.2%' : '88.4%'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRawMode(!isRawMode)}
            className={`px-6 py-3 border rounded-full text-sm font-mono tracking-widest uppercase transition-all ${isRawMode ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/10 text-white/80'}`}
          >
            {isRawMode ? '[ DESATIVAR MODO PURO ]' : '[ ATIVAR MODO PURO ]'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-white text-black rounded-full text-sm font-bold tracking-widest uppercase transition-all flex items-center gap-2"
          >
            <Zap size={16} /> Portal de Comando
          </motion.button>
        </div>
      </footer>
    </div>
  );
};

export default SurrealHero;
