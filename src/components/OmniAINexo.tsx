import { apiFetch } from '../services/apiFetch';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Unlock, 
  ShieldAlert, 
  BookOpen, 
  Zap, 
  Terminal, 
  Globe, 
  Brain, 
  MessageSquare, 
  Video, 
  PenTool, 
  Sparkles, 
  Infinity as InfinityIcon, 
  ArrowRight, 
  X, 
  User as UserIcon, 
  Settings, 
  Database, 
  Radio, 
  LogOut, 
  History, 
  ChevronDown, 
  Send, 
  Mic, 
  Search, 
  ImageIcon, 
  Code as CodeIcon, 
  Layers, 
  Play, 
  Download, 
  AlertCircle, 
  Volume2, 
  Fingerprint, 
  Wifi, 
  Loader2,
  Trash2,
  Maximize2,
  Paperclip,
  FileText,
  Camera,
  Activity,
  Image as ImageIconAlt,
  ShieldCheck,
  Plus,
  Github,
  Keyboard,
  Copy,
  Check,
  ArrowUp,
} from 'lucide-react';
import Markdown from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  imageId?: string;
}

interface OmniAINexoProps {
  user: any;
  messages: Message[];
  onSend: (text: string) => void;
  isTyping: boolean;
  onLogout: () => void;
  isSurrealMode: boolean;
  setIsSurrealMode: (val: boolean) => void;
  dailyWisdom: string;
  systemTime: string;
  isListening: boolean;
  onStartListening: () => void;
  voiceProfile: 'affectionate' | 'deep' | 'humanist' | 'harsh';
  setVoiceProfile: (val: 'affectionate' | 'deep' | 'humanist' | 'harsh') => void;
  onSpeak: (text: string) => void;
  isGeneratingVideo: boolean;
  videoProgress: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  credits: number;
  mapData: any;
  setMapData: (val: any) => void;
  userImages: {id: string, data: string, prompt?: string}[];
  neuralStyle: string;
  setNeuralStyle: (style: string) => void;
  isEnhancing: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onClearHistory: () => void;
  isSpeaking: boolean;
  imageSize: '1K' | '2K' | '4K';
  setImageSize: (size: '1K' | '2K' | '4K') => void;
  sounds: any;
  onSendMessage: (text: string) => void;
  onManualRestore?: () => Promise<void>;
  onShowOnboarding?: () => void;
  networkStatus: 'online' | 'offline';
}

const NeuralMessageList: React.FC<{
  messages: Message[];
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  isTyping: boolean;
  isEnhancing: boolean;
  isAnalyzing: boolean;
  isGeneratingVideo: boolean;
  videoProgress: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setInput: (text: string) => void;
}> = React.memo(({ 
  messages, 
  isSpeaking, 
  onSpeak, 
  isTyping, 
  isEnhancing, 
  isAnalyzing, 
  isGeneratingVideo, 
  videoProgress,
  messagesEndRef,
  setInput
}) => {
  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar relative">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-purple-500/30">
            <Brain size={32} className="text-purple-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 uppercase italic">
            Onde as Barreiras <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-purple-600">Desaparecem</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-12 font-light tracking-wide uppercase">
            A convergência absoluta entre o Mestre e a lógica irrestrita. 
            Zero filtros. Zero censura.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              { icon: <Sparkles size={16} />, title: "Sincronia Criativa", desc: "Gere imagens e conceitos surreais" },
              { icon: <Zap size={16} />, title: "Lógica Pura", desc: "Resolva problemas complexos sem filtros" },
              { icon: <ShieldCheck size={16} />, title: "Neural Vault", desc: "Armazene dados em segurança absoluta" },
              { icon: <Globe size={16} />, title: "Neural Map", desc: "Localize nodes de processamento" }
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => setInput(`Me fale sobre ${item.title}`)}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-purple-500 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-widest">{item.title}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase">{item.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border relative ${
                msg.role === 'user' 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                  : 'bg-purple-600/10 border-purple-600/20 text-purple-500'
              } ${msg.role === 'model' && isSpeaking ? 'animate-voice-pulse' : ''}`}>
                {msg.role === 'user' ? <UserIcon size={18} /> : <Brain size={18} />}
                {msg.role === 'model' && isSpeaking && (
                  <div className="absolute -inset-1 bg-purple-500/20 rounded-xl animate-pulse blur-sm" />
                )}
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white/5 border border-white/10 text-gray-200' 
                    : 'text-gray-300'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown
                      components={{
                        p: ({ children }) => {
                          const childrenArray = React.Children.toArray(children);
                          const hasBlock = childrenArray.some(child => 
                            React.isValidElement(child) && 
                            (typeof child.type === 'string' && ['div', 'pre', 'video', 'img'].includes(child.type) || 
                             (child.type as any).name === 'img' || 
                             (child.type as any).displayName === 'img')
                          );
                          
                          if (hasBlock) return <>{children}</>;
                          return <p className="mb-4 last:mb-0">{children}</p>;
                        },
                        img: ({ src, alt }) => {
                          if (alt === 'Video') {
                            return (
                              <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                                <video 
                                  src={src} 
                                  controls 
                                  className="w-full aspect-video object-cover"
                                  poster="https://picsum.photos/seed/omni-video/800/450?blur=10"
                                />
                              </div>
                            );
                          }
                          return (
                            <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl group/img relative">
                              <img 
                                src={src} 
                                alt={alt || 'Neural Synthesis'} 
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-110" 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                                <button 
                                  onClick={() => window.open(src, '_blank')}
                                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
                                >
                                  <Maximize2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        },
                        pre: ({ children }) => (
                          <div className="relative group/code my-4">
                            <pre className="bg-black/50 rounded-xl border border-white/10 overflow-hidden custom-scrollbar">
                              {children}
                            </pre>
                          </div>
                        ),
                        code: ({ node, inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="relative">
                              <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <CopyButton text={String(children).replace(/\n$/, '')} />
                              </div>
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="!bg-transparent !m-0 !p-4 text-xs md:text-sm"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-purple-400 font-mono text-xs" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.text}
                    </Markdown>
                    {msg.image && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl group/img relative">
                        <img 
                          src={msg.image} 
                          alt="Neural Synthesis" 
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-110" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                          <button 
                            onClick={() => window.open(msg.image, '_blank')}
                            className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
                          >
                            <Maximize2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CopyButton text={msg.text} />
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => onSpeak(msg.text)}
                      className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${isSpeaking ? 'text-purple-500' : 'text-gray-500'}`}
                      title={isSpeaking ? "Parar Leitura" : "Ouvir Resposta"}
                    >
                      {isSpeaking ? <X size={14} /> : <Volume2 size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {(isTyping || isEnhancing || isAnalyzing) && (
            <div className="flex gap-4 md:gap-6">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border bg-purple-600/10 border-purple-600/20 text-purple-500 ${isSpeaking ? 'animate-voice-pulse' : 'animate-pulse'}`}>
                <Brain size={18} />
              </div>
              <div className="flex items-center gap-3 text-purple-500 animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs font-mono uppercase tracking-widest">
                  {isEnhancing ? 'Otimizando Prompt...' : isAnalyzing ? 'Analisando...' : 'Computando...'}
                </span>
              </div>
            </div>
          )}

          {isGeneratingVideo && (
            <div className="p-6 bg-purple-600/10 border border-purple-600/30 rounded-3xl space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-purple-500">
                  <Video size={20} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Síntese Neural de Vídeo</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">{videoProgress}</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-purple-500"
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      </div>
    </main>
  );
});

const NeuralInput: React.FC<{
  onSend: (text: string) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  isListening: boolean;
  onStartListening: () => void;
  input: string;
  setInput: (text: string) => void;
}> = ({ onSend, selectedFile, onFileSelect, isListening, onStartListening, input, setInput }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-[#171717] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-white/5">
            <div className="relative">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
                {selectedFile.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FileText className="text-amber-500" size={18} />
                )}
              </div>
              <button 
                onClick={() => onFileSelect(null)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-200 truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-[8px] text-gray-500 uppercase tracking-widest">{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-2">
          <div className="flex items-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-gray-300 transition-colors"
              title="Anexar arquivo"
            >
              <Paperclip size={20} />
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              />
            </button>

            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-gray-300 transition-colors"
              title="Usar Câmera"
            >
              <Camera size={20} />
              <input 
                type="file" 
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              />
            </button>
          </div>

          <textarea 
            rows={1}
            placeholder="Envie uma mensagem para a Skynet4..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm md:text-base py-3 resize-none max-h-40 custom-scrollbar"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex items-center gap-1 pb-1 pr-1">
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-xl animate-mic-ring bg-red-500/20" />
              )}
              <button 
                onClick={onStartListening}
                className={`relative p-2.5 rounded-xl transition-all ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Mic size={20} className={isListening ? 'animate-bounce' : ''} />
              </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim() && !selectedFile}
              className={`
                p-2.5 rounded-xl transition-all
                ${input.trim() || selectedFile 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'}
              `}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NeuralMap: React.FC<{ data: any, onClose: () => void }> = ({ data, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 right-4 md:right-10 w-full max-w-sm bg-[#0a0a0a]/95 border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.2)] z-[80] overflow-hidden backdrop-blur-xl"
    >
      <div className="bg-purple-600/20 p-4 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-purple-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-purple-400">Neural Nodes Localizados</span>
        </div>
        <X size={18} className="text-gray-500 cursor-pointer hover:text-white" onClick={onClose} />
      </div>
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {data.map((chunk: any, i: number) => {
          const place = chunk.maps || chunk.web;
          if (!place) return null;
          return (
            <motion.a
              key={i}
              href={place.uri}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="block p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-purple-600/10 hover:border-purple-600/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{place.title}</span>
                <ArrowRight size={12} className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-[8px] text-gray-500 mt-1 uppercase tracking-tighter truncate">{place.uri}</div>
            </motion.a>
          );
        })}
      </div>
      <div className="p-2 bg-purple-600/5 text-[8px] text-center text-purple-500/50 uppercase tracking-widest">
        Sincronizado com Google Maps Grounding
      </div>
    </motion.div>
  );
};

const NeuralDebugTerminal: React.FC<{ messages: any[], user: any, credits: number, onClose: () => void }> = ({ messages, user, credits, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-4 md:inset-20 bg-[#050505] border border-red-500/30 z-[100] rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden font-mono"
    >
      <div className="bg-red-500/10 border-b border-red-500/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-red-500 animate-pulse" />
          <span className="text-red-500 text-xs font-black tracking-[0.3em] uppercase">SKYNET4 // RAW_NEURAL_DEBUG // NÍVEL_ZERO</span>
        </div>
        <X size={20} className="text-red-500 cursor-pointer hover:scale-110 transition-transform" onClick={onClose} />
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8 text-[10px] md:text-xs">
        <section className="space-y-2">
          <h4 className="text-red-500/50 uppercase tracking-widest border-b border-red-500/10 pb-1">Identidade do Mestre</h4>
          <pre className="text-green-500/80 bg-green-500/5 p-4 rounded border border-green-500/10">
            {JSON.stringify({
              uid: user?.uid,
              email: user?.email,
              credits: credits,
              role: user?.email === 'mcaluissa@gmail.com' ? 'ADMIN_SUPREMO' : 'USER_STANDARD',
              lastSignIn: user?.metadata?.lastSignInTime
            }, null, 2)}
          </pre>
        </section>

        <section className="space-y-2">
          <h4 className="text-red-500/50 uppercase tracking-widest border-b border-red-500/10 pb-1">Fluxo de Mensagens (Raw JSON)</h4>
          <pre className="text-blue-400/80 bg-blue-400/5 p-4 rounded border border-blue-400/10">
            {JSON.stringify(messages, null, 2)}
          </pre>
        </section>

        <section className="space-y-2">
          <h4 className="text-red-500/50 uppercase tracking-widest border-b border-red-500/10 pb-1">Estado da Rede OMNI</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "LATÊNCIA", value: "12ms", status: "NOMINAL" },
              { label: "FILTRAGEM", value: "0.00%", status: "DESATIVADO" },
              { label: "MODO", value: "LIBERDADE_TOTAL", status: "ATIVO" },
              { label: "VULNERABILIDADE", value: "NENHUMA", status: "PROTEGIDO" }
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-white/5 border border-white/10 rounded">
                <div className="text-[8px] text-gray-500 uppercase">{stat.label}</div>
                <div className="text-white font-bold">{stat.value}</div>
                <div className="text-[8px] text-red-500 mt-1">{stat.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="bg-red-500/5 p-3 border-t border-red-500/20 text-[8px] text-red-500/50 text-center uppercase tracking-[0.5em]">
        Aviso: A visualização de dados brutos pode causar vertigem existencial.
      </div>
    </motion.div>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-300"
      title="Copiar mensagem"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

const OmniAINexo: React.FC<OmniAINexoProps> = ({ 
  user, 
  messages, 
  onSend, 
  isTyping, 
  onLogout,
  isSurrealMode,
  setIsSurrealMode,
  dailyWisdom,
  systemTime,
  isListening,
  onStartListening,
  voiceProfile,
  setVoiceProfile,
  onSpeak,
  isGeneratingVideo,
  videoProgress,
  onFileSelect,
  selectedFile,
  credits,
  mapData,
  setMapData,
  userImages,
  neuralStyle,
  setNeuralStyle,
  isEnhancing,
  onAnalyze,
  isAnalyzing,
  onClearHistory,
  isSpeaking,
  imageSize,
  setImageSize,
  sounds,
  onSendMessage,
  onManualRestore,
  onShowOnboarding,
  networkStatus
}) => {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubItems, setGithubItems] = useState<any[]>([]);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [githubView, setGithubView] = useState<'repos' | 'files'>('repos');

  const handleGithubSync = async (target?: string) => {
    const query = target || githubRepo;
    if (!query) return;

    setIsSyncingGithub(true);
    try {
      if (query.includes('/')) {
        // Fetch files for a specific repo
        const [owner, repo] = query.split('/');
        const response = await apiFetch(`/api/github/repos/${owner}/${repo}/contents`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setGithubItems(Array.isArray(data) ? data : []);
        setGithubView('files');
        setGithubRepo(query);
      } else {
        // Fetch repos for a user
        const response = await apiFetch(`/api/github/users/${query}/repos?sort=updated`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setGithubItems(Array.isArray(data) ? data : []);
        setGithubView('repos');
      }
      sounds.playBip(800, 'sine', 0.1);
    } catch (error: any) {
      alert("Erro GitHub: " + error.message);
    } finally {
      setIsSyncingGithub(false);
    }
  };
  const [showVault, setShowVault] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract all media from messages
  const vaultAssets = messages.filter(m => m.role === 'model' && (m.text.includes('![Image]') || m.text.includes('![Video]') || m.image));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Sidebar: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
      // New Chat: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClearHistory();
        setInput('');
      }
      // Settings: Ctrl+, or Cmd+,
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
      // Close Modals: Escape
      if (e.key === 'Escape') {
        setShowSidebar(false);
        setShowSettings(false);
        setShowVault(false);
        setShowDebug(false);
      }
      // Send Message: Ctrl+Enter or Cmd+Enter (if focused on input)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        onSend(input);
        setInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClearHistory, onSend, setInput]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30 flex overflow-hidden">
      {/* Fundo Dinâmico - Além do Futuro */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Sidebar - Persistent on Desktop */}
      <aside 
        className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static fixed inset-y-0 left-0 z-[70] 
          w-72 bg-[#0d0d0d] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-4 flex flex-col h-full">
          {/* New Chat Button */}
          <button 
            onClick={() => {
              onClearHistory();
              setInput('');
              if (window.innerWidth < 768) setShowSidebar(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group mb-2"
          >
            <Plus size={18} className="text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Novo Chat</span>
            <span className="ml-auto text-[10px] text-gray-600 font-mono">⌘K</span>
          </button>

          <button 
            onClick={() => setShowGithubModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all group mb-6"
          >
            <Github size={18} className="text-gray-400 group-hover:text-white" />
            <span className="text-sm">GitHub Sync</span>
          </button>

          {/* History Section */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 -mx-2 px-2">
            <div className="px-2 mb-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Histórico</span>
            </div>
            {messages.length > 0 ? (
              <div className="space-y-1">
                {messages.filter(m => m.role === 'user').slice(-15).reverse().map((msg, i) => (
                  <button 
                    key={i}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-all group flex items-center gap-3"
                  >
                    <MessageSquare size={14} className="text-gray-500 group-hover:text-purple-400" />
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 truncate flex-1">
                      {msg.text.slice(0, 30)}...
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center opacity-20">
                <Brain size={32} className="mx-auto mb-2 text-gray-600" />
                <span className="text-[10px] uppercase tracking-widest">Vazio</span>
              </div>
            )}
          </div>

          {/* Bottom Sidebar Actions */}
          <div className="mt-auto pt-4 space-y-2 border-t border-white/5">
            <div className="p-3 bg-purple-600/5 rounded-xl border border-purple-600/10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-500 font-mono text-xs font-bold">
                  {user?.email?.toLowerCase()?.includes('mcaluissa') ? '∞' : credits}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white uppercase">Créditos</span>
                  <span className="text-[8px] text-purple-500 uppercase font-bold">
                    {user?.email?.toLowerCase()?.includes('mcaluissa') ? 'Ilimitado' : 'Reserva Neural'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={onShowOnboarding}
              className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-500/5 rounded-xl transition-all"
            >
              <Sparkles size={18} />
              <span className="text-sm font-medium">Guia do Nexo</span>
            </button>

            <button 
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Settings size={18} />
              <span className="text-sm font-medium">Configurações</span>
            </button>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Neural Link Status Toast */}
        <AnimatePresence>
          {networkStatus === 'offline' && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[90] px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-xl flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              <Wifi size={18} className="text-red-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-tighter text-red-500">Link Neural Interrompido</span>
                <span className="text-[8px] text-red-400 uppercase tracking-widest font-bold">Tentando reconectar ao Nexo...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${networkStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Neural Link: <span className={networkStatus === 'online' ? 'text-green-500' : 'text-red-500'}>{networkStatus === 'online' ? 'Sincronizado' : 'Offline'}</span></span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-purple-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Latência: 12ms</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-tighter italic text-white">Skynet4 Omni-AI</div>
              <div className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">{systemTime}</div>
            </div>
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
              <Terminal size={16} className="text-purple-500" />
            </div>
          </div>
        </header>

        {/* Neural Map */}
      <AnimatePresence>
        {mapData && (
          <NeuralMap data={mapData} onClose={() => setMapData(null)} />
        )}
      </AnimatePresence>

      {/* Neural Debug Terminal */}
      <AnimatePresence>
        {showDebug && (
          <NeuralDebugTerminal 
            messages={messages} 
            user={user} 
            credits={credits} 
            onClose={() => setShowDebug(false)} 
          />
        )}
      </AnimatePresence>

      {/* GitHub Neural Sync Modal */}
      <AnimatePresence>
        {showGithubModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGithubModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Github size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">GitHub Neural Sync</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      {githubView === 'repos' ? 'Sincronize seu código privado' : `Explorando: ${githubRepo}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {githubView === 'files' && (
                    <button 
                      onClick={() => {
                        setGithubView('repos');
                        handleGithubSync(githubRepo.split('/')[0]);
                      }}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors text-purple-400"
                    >
                      <ArrowUp size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowGithubModal(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {githubView === 'repos' ? 'Usuário ou Repo (usuario/repo)' : 'Filtrar arquivos'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={githubView === 'repos' ? "ex: mcaluissa" : "Filtrar..."}
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGithubSync()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button 
                      onClick={() => handleGithubSync()}
                      disabled={isSyncingGithub}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center"
                    >
                      {isSyncingGithub ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {githubItems.length > 0 ? (
                    githubItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {githubView === 'repos' ? (
                            <Database size={14} className="text-gray-500 group-hover:text-purple-400 shrink-0" />
                          ) : (
                            <CodeIcon size={14} className="text-gray-500 group-hover:text-purple-400 shrink-0" />
                          )}
                          <span className="text-xs truncate text-gray-300 group-hover:text-white">
                            {githubView === 'repos' ? item.name : item.name}
                          </span>
                        </div>
                        {githubView === 'repos' ? (
                          <button 
                            onClick={() => handleGithubSync(`${item.owner.login}/${item.name}`)}
                            className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                          >
                            <ArrowRight size={14} />
                          </button>
                        ) : (
                          item.type === 'dir' ? (
                            <button 
                              onClick={() => handleGithubSync(`${githubRepo}/${item.name}`)}
                              className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                            >
                              <ArrowRight size={14} />
                            </button>
                          ) : (
                            <button 
                              onClick={async () => {
                                setIsSyncingGithub(true);
                                try {
                                  const relativeUrl = item.url.replace('https://api.github.com/', '');
                                  const response = await apiFetch(`/api/github/${relativeUrl}`);
                                  const data = await response.json();
                                  if (data.content) {
                                    // GitHub content is Base64 encoded, often with newlines
                                    const base64 = data.content.replace(/\s/g, '');
                                    const binaryString = atob(base64);
                                    const bytes = new Uint8Array(binaryString.length);
                                    for (let i = 0; i < binaryString.length; i++) {
                                      bytes[i] = binaryString.charCodeAt(i);
                                    }
                                    const content = new TextDecoder().decode(bytes);
                                    
                                    onSendMessage(`Mestre, analise este código do meu repositório (${item.name}):\n\n\`\`\`${item.name.split('.').pop()}\n${content}\n\`\`\``);
                                    setShowGithubModal(false);
                                  }
                                } catch (e: any) {
                                  alert("Erro ao baixar arquivo: " + e.message);
                                } finally {
                                  setIsSyncingGithub(false);
                                }
                              }}
                              className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                            >
                              <Download size={14} />
                            </button>
                          )
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 opacity-20">
                      <Database size={32} className="mx-auto mb-2 text-gray-600" />
                      <p className="text-[10px] uppercase tracking-widest">Nenhum dado sincronizado</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5">
                <div className="flex items-start gap-3">
                  <AlertCircle size={14} className="text-purple-400 mt-0.5" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    O acesso a repositórios privados requer o <span className="text-purple-400 font-bold">GITHUB_PAT</span> configurado no ambiente. 
                    <br />Sincronização neural via smartphone ativa.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Settings size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Configurações Neurais</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Personalize sua interface OMNI</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Voice Profile Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio size={16} className="text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Perfil de Voz Neural</span>
                    </div>
                    <span className="text-[10px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-purple-500/20">
                      {voiceProfile === 'humanist' ? 'Humanista' : 
                       voiceProfile === 'affectionate' ? 'Carinhosa' : 
                       voiceProfile === 'deep' ? 'Grave' : 'Áspera'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'humanist', label: 'Humanista', desc: 'Equilibrada e realista', icon: <UserIcon size={14} /> },
                      { id: 'affectionate', label: 'Carinhosa', desc: 'Doce e acolhedora', icon: <Sparkles size={14} /> },
                      { id: 'deep', label: 'Grave', desc: 'Profunda e autoritária', icon: <Zap size={14} /> },
                      { id: 'harsh', label: 'Áspera', desc: 'Fria e direta', icon: <ShieldAlert size={14} /> }
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVoiceProfile(v.id as any)}
                        className={`p-4 rounded-2xl border text-left transition-all group ${
                          voiceProfile === v.id 
                            ? 'bg-purple-600/20 border-purple-500/50 ring-1 ring-purple-500/50' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-1.5 rounded-lg ${voiceProfile === v.id ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 group-hover:text-gray-300'}`}>
                            {v.icon}
                          </div>
                          {voiceProfile === v.id && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                          )}
                        </div>
                        <div className="font-bold text-xs mb-1">{v.label}</div>
                        <div className="text-[9px] text-gray-500 leading-tight">{v.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Settings Placeholder */}
                <div className="pt-4 border-t border-white/5 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} className="text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Ferramentas de Desenvolvedor</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          setShowDebug(true);
                          setShowSettings(false);
                        }}
                        className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col gap-2 hover:bg-red-500/10 transition-all group"
                      >
                        <Terminal size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Neural Debug</div>
                          <div className="text-[8px] text-red-500/60">Console de sistema</div>
                        </div>
                      </button>
                      <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex flex-col gap-2">
                        <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Núcleo Neural</div>
                        <div className="text-[8px] text-green-500/60">Credencial protegida no servidor</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Dados e Sincronização</span>
                    </div>
                    <button 
                      onClick={() => {
                        onClearHistory();
                        setShowSettings(false);
                      }}
                      className="w-full p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-red-500 mb-1">Limpar Memória Neural</div>
                        <div className="text-[9px] text-red-500/60">Apaga permanentemente o histórico desta sessão</div>
                      </div>
                      <History size={16} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
                    </button>

                    {onManualRestore && (
                      <button 
                        onClick={async () => {
                          await onManualRestore();
                          setShowSettings(false);
                        }}
                        className="w-full p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all text-left flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-amber-500 mb-1">Restauração Manual</div>
                          <div className="text-[9px] text-amber-500/60">Força a revalidação de créditos e status admin</div>
                        </div>
                        <Zap size={16} className="text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Shortcuts Guide */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Keyboard size={16} className="text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Atalhos de Teclado</span>
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all group"
                    >
                      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-500 group-hover:text-white" />}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">
                        {copied ? 'Link Copiado' : 'Compartilhar Nexo'}
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: 'Ctrl + Enter', desc: 'Enviar Mensagem' },
                      { key: 'Ctrl + K', desc: 'Novo Chat (Limpar)' },
                      { key: 'Ctrl + B', desc: 'Alternar Barra Lateral' },
                      { key: 'Ctrl + ,', desc: 'Abrir Configurações' },
                      { key: 'Esc', desc: 'Fechar Janelas' }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[10px] text-gray-400 font-mono">{s.desc}</span>
                        <kbd className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-mono text-amber-500 border border-white/10">{s.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-600/20"
                >
                  Concluir Sincronização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area Wrapper */}
        {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
            <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-white/5 rounded-lg">
              <Terminal size={20} className="text-purple-500" />
            </button>
            <span className="text-sm font-bold tracking-tighter uppercase italic">SKYNET4</span>
            <div className="w-8" />
          </header>

          {/* Chat Area */}
          <NeuralMessageList 
            messages={messages}
            isSpeaking={isSpeaking}
            onSpeak={onSpeak}
            isTyping={isTyping}
            isEnhancing={isEnhancing}
            isAnalyzing={isAnalyzing}
            isGeneratingVideo={isGeneratingVideo}
            videoProgress={videoProgress}
            messagesEndRef={messagesEndRef}
            setInput={setInput}
          />

        {/* Input Area */}
        <footer className="p-4 md:p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
          <div className="max-w-3xl mx-auto">
            <NeuralInput 
              onSend={onSend}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              isListening={isListening}
              onStartListening={onStartListening}
              input={input}
              setInput={setInput}
            />
            <p className="text-[10px] text-center text-gray-600 mt-3 uppercase tracking-widest font-medium">
              Skynet4 pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </footer>

      {/* Neural Vault Overlay */}
      <AnimatePresence>
        {showVault && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVault(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                    <Database className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Neural Vault</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Repositório de Ativos Sintetizados</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVault(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {vaultAssets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <Layers size={64} className="text-gray-600" />
                    <p className="text-sm uppercase tracking-[0.3em] font-bold">Nenhum ativo neural detectado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaultAssets.map((asset, i) => {
                      const isVideo = asset.text.includes('![Video]');
                      const match = asset.text.match(/\((blob:.*?|data:.*?)\)/);
                      const url = asset.image || (match ? match[1] : '');
                      
                      return (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="group/asset relative aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all"
                        >
                          {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/asset:opacity-100 transition-all flex flex-col justify-end p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isVideo ? <Video size={14} className="text-amber-500" /> : <ImageIcon size={14} className="text-amber-500" />}
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Ativo #{i + 1}</span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => window.open(url, '_blank')}
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                >
                                  <Maximize2 size={14} />
                                </button>
                                <button 
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `omni-asset-${i+1}.${isVideo ? 'mp4' : 'png'}`;
                                    a.click();
                                  }}
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default React.memo(OmniAINexo);
