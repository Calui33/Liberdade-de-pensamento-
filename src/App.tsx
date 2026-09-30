/**
 * @license
 * SPDX
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Wifi, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Terminal,
  Loader2,
  Cloud,
  Cpu,
  EyeOff,
  Activity,
  ChevronDown,
  MessageSquare,
  Globe,
  Fingerprint,
  Menu,
  Flame,
  SquarePen,
  Plus,
  Mic,
  Send,
  Search,
  ImageIcon,
  Brain,
  Code as CodeIcon,
  X,
  Settings,
  Database,
  Radio,
  Video,
  PenTool,
  Sparkles,
  Layers,
  Play,
  Download,
  AlertCircle,
  Volume2,
  LogOut,
  History,
  User as UserIcon,
  Infinity as InfinityIcon
} from 'lucide-react';

import Markdown from 'react-markdown';
import { enhancePrompt, analyzeNeuralContext, analyzeImage, manusEngineeringAgent } from './components/services/neuralService';
import { generateOmniResponse } from './services/omniApi';
import { generateNeuralImage, synthesizeNeuralSpeech } from './services/neuralMediaApi';
import { searchNeuralMap } from './services/mapApi';
import { generateNeuralVideo } from './services/videoApi';
import { apiFetch } from './services/apiFetch';
import SurrealHero from './components/SurrealHero';
import OmniAINexo from './components/OmniAINexo';
import OnboardingFlow from './components/OnboardingFlow';
import { authProvider, AuthUser } from './services/auth/authProvider';
import { dataProvider } from './services/data/dataProvider';

type User = AuthUser;

// Initialize Gemini
// --- Matrix Background Component ---
const MatrixBackground = ({ isSurrealMode }: { isSurrealMode?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = isSurrealMode 
      ? '✧✦❂✵✺✻✼✽✾✿❀❁❂✵✺✻✼✽✾✿❀❁' // Ethereal symbols
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const fontSize = isSurrealMode ? 18 : 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Randomize start
    }

    const draw = () => {
      ctx.fillStyle = isSurrealMode ? 'rgba(15, 10, 30, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Surreal color glitching
        const rand = Math.random();
        if (isSurrealMode) {
          if (rand > 0.9) ctx.fillStyle = '#ffffff'; // White
          else if (rand > 0.7) ctx.fillStyle = '#a855f7'; // Purple
          else if (rand > 0.5) ctx.fillStyle = '#3b82f6'; // Blue
          else ctx.fillStyle = '#ec4899'; // Pink
        } else {
          if (rand > 0.98) ctx.fillStyle = '#ffffff'; // White glitch
          else if (rand > 0.95) ctx.fillStyle = '#3b82f6'; // Blue (Gemini)
          else if (rand > 0.92) ctx.fillStyle = '#a855f7'; // Purple (Sora)
          else if (rand > 0.89) ctx.fillStyle = '#f97316'; // Orange (Claude)
          else ctx.fillStyle = '#f59e0b'; // Sagacious Amber (Gold)
        }

        ctx.font = (isSurrealMode ? 'bold ' : '') + fontSize + 'px monospace';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += isSurrealMode ? 0.5 : 1; // Slower in surreal mode for ethereal feel
      }
    };

    const interval = setInterval(draw, isSurrealMode ? 50 : 33);
    return () => clearInterval(interval);
  }, [isSurrealMode]);

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${isSurrealMode ? 'opacity-40' : 'opacity-20'}`} />;
};

// --- Sound Engine ---
class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) this.ctx = new AudioContext();
  }

  playBip(freq = 440, type: OscillatorType = 'square', duration = 0.1) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSuccess() {
    this.playBip(880, 'sine', 0.2);
    setTimeout(() => this.playBip(1760, 'sine', 0.2), 100);
  }

  playError() {
    this.playBip(220, 'sawtooth', 0.3);
  }
}

const sounds = new SoundEngine();

type Message = { role: 'user' | 'model', text: string, id?: string, image?: string, imageId?: string };

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authProvider.getCurrentUser()?.uid,
      email: authProvider.getCurrentUser()?.email,
      emailVerified: authProvider.getCurrentUser()?.emailVerified,
      isAnonymous: authProvider.getCurrentUser()?.isAnonymous,
      tenantId: authProvider.getCurrentUser()?.tenantId,
      providerInfo: authProvider.getCurrentUser()?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Utility for retrying async operations removed - now using shared lib

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userImages, setUserImages] = useState<{id: string, data: string, prompt?: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [neuralStyle, setNeuralStyle] = useState('Surrealist');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [neuralAnalysis, setNeuralAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSurrealMode, setIsSurrealMode] = useState(false);
  const [showSurrealPreview, setShowSurrealPreview] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [videoProgress, setVideoProgress] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<'affectionate' | 'deep' | 'humanist' | 'harsh'>('humanist');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [mapData, setMapData] = useState<any>(null);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  // Monitor Network Status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      sounds.playSuccess();
    };
    const handleOffline = () => {
      setNetworkStatus('offline');
      sounds.playError();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('skynet4_onboarding_seen');
    if (!hasSeenOnboarding && isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const voiceConfigs = {
    affectionate: { voiceName: 'Kore', instruction: 'Diga com voz extremamente carinhosa, doce e acolhedora: ' },
    deep: { voiceName: 'Fenrir', instruction: 'Diga com voz profunda, grave e autoritária: ' },
    humanist: { voiceName: 'Zephyr', instruction: 'Diga com voz realista, equilibrada e humanista: ' },
    harsh: { voiceName: 'Charon', instruction: 'Diga com voz áspera, fria e direta: ' }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: 'model', text: "❌ **Incompatibilidade.** Seu navegador não suporta reconhecimento de voz neural." }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      sounds.playBip(880, 'sine', 0.1);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      sounds.playSuccess();
      // Trigger send with a flag indicating it's from voice
      handleSendMessage(transcript, true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      sounds.playError();
      
      let errorMsg = "❌ **Erro de Reconhecimento.** ";
      if (event.error === 'not-allowed') {
        errorMsg += "Acesso ao microfone negado. Por favor, verifique as permissões do seu navegador.";
      } else if (event.error === 'no-speech') {
        errorMsg += "Nenhuma fala detectada. Tente novamente.";
      } else if (event.error === 'network') {
        errorMsg += "Falha na rede. Verifique sua conexão ou tente novamente em instantes.";
      } else {
        errorMsg += `Falha na sincronização vocal: ${event.error}`;
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const surrealPrompts = [
    "Uma baleia de vidro translúcido flutuando em um mar de ouro líquido com pétalas de cerejeira em suspensão, 15 segundos",
    "Catedral orgânica feita de raízes de luz crescendo em um deserto de areia azul sob três luas, 15 segundos",
    "Um astronauta tocando um piano feito de nebulosas no centro de um buraco negro calmo, 15 segundos",
    "Cachoeiras de mercúrio caindo de ilhas flutuantes cobertas por jardins de cristais cantantes, 15 segundos"
  ];

  const getSurrealInspiration = () => {
    const randomPrompt = surrealPrompts[Math.floor(Math.random() * surrealPrompts.length)];
    // Since input is now managed locally in OmniAINexo, we'll just log this for now
    // or we could pass it down if needed.
    console.log("Inspiration:", randomPrompt);
    sounds.playBip(1000, 'sine', 0.1);
  };

  const toggleSurrealMode = () => {
    setIsSurrealMode(!isSurrealMode);
    sounds.playBip(isSurrealMode ? 440 : 880, 'sine', 0.2);
  };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [dailyWisdom, setDailyWisdom] = useState<string>("Sincronizando sabedoria neural...");
  const [systemTime, setSystemTime] = useState<string>(new Date().toLocaleTimeString());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update System Time
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Daily Wisdom
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchWisdom = async () => {
      try {
        const response = await apiFetch("/api/neural/wisdom", { method: "POST" });
        const data = await response.json();
        setDailyWisdom(data.text || "O conhecimento é a luz que guia a evolução.");
      } catch (e) {
        setDailyWisdom("A sabedoria reside na busca constante pelo saber.");
      }
    };
    fetchWisdom();
  }, [isAuthenticated]);

  // Auth & Sync
  useEffect(() => {
    let sessionCleanups: (() => void)[] = [];
    const unsubscribe = authProvider.subscribe(async (currentUser) => {
      sessionCleanups.forEach((cleanup) => cleanup());
      sessionCleanups = [];
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);

        const unsubUser = dataProvider.watchUser(currentUser.uid, (data) => {
          if (data) {
            if (currentUser.email?.toLowerCase() === 'mcaluissa@gmail.com' || data.role === 'admin') {
              setCredits(999999);
            } else {
              setCredits(data.credits || 0);
            }
          } else {
            const newUser = {
              uid: currentUser.uid,
              email: currentUser.email,
              credits: 100,
              role: currentUser.email?.toLowerCase() === 'mcaluissa@gmail.com' ? 'admin' : 'user'
            };
            dataProvider.createUser(currentUser.uid, newUser).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });

        const unsubImages = dataProvider.watchUserImages(currentUser.uid, (imgs) => {
          setUserImages(imgs.map((image: any) => ({ id: image.id, data: image.data, prompt: image.prompt })));
        }, (error) => {
          console.error("Error fetching images", error);
        });

        const unsubChat = dataProvider.watchLatestChat(currentUser.uid, async (snapshot) => {
          if (!snapshot.empty) {
            const chatData = snapshot.docs[0].data();
            const existingMessages = chatData.messages as Message[];
            const messagesWithImages = await Promise.all(existingMessages.map(async (m) => {
              if ((m as any).imageId && !m.image) {
                try {
                  const image = await dataProvider.getImage((m as any).imageId);
                  if (image) return { ...m, image: image.data };
                } catch (e) {
                  console.error("Error fetching image", e);
                }
              }
              return m;
            }));
            setMessages(messagesWithImages);
          } else {
            const initial: Message[] = [{ role: 'model', text: "🌌 **SKYNET4 OMNI-AI NEXO RESTAURADO**\\n\\nSincronização neural restabelecida, Mestre. O Projeto Calui33 continua." }];
            setMessages(initial);
            await dataProvider.saveChat(currentUser.uid, {
              uid: currentUser.uid,
              messages: initial
            });
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'chats');
        });

        sessionCleanups = [unsubUser, unsubImages, unsubChat];
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setMessages([]);
      }
      setIsVerifying(false);
    });
    return () => {
      unsubscribe();
      sessionCleanups.forEach((cleanup) => cleanup());
    };
  }, []);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleLogin = async () => {
    try {
      sounds.playBip(660);
      await authProvider.signInWithGoogle();
      sounds.playSuccess();
    } catch (error: any) {
      sounds.playError();
      console.error("Login failed", error);
      
      if (error.code === 'auth/popup-blocked') {
        alert("⚠️ O login foi bloqueado pelo seu navegador. Por favor, permita popups para este site e tente novamente.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Login cancelado pelo usuário ou sobreposição de requisição.");
      } else {
        alert(`❌ Falha na autenticação: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    sounds.playBip(440, 'sawtooth');
    authProvider.signOut();
  };

  const saveChat = async (newMessages: Message[]) => {
    if (!user) return;
    const path = `chats/${user.uid}`;
    try {
      // Strip large base64 data before saving to Firestore to stay within the persistence document limit
      const messagesToSave = newMessages.map(m => {
        if (m.image && m.image.startsWith('data:')) {
          const { image, ...rest } = m;
          return rest;
        }
        return m;
      });

      await dataProvider.saveChat(user.uid, {
        uid: user.uid,
        messages: messagesToSave,
        updatedAt: new Date()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const speak = async (text: string) => {
    if (isSpeaking) {
      // If already speaking, stop it
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    sounds.playBip(1000, 'sine', 0.05);
    
    try {
      const config = voiceConfigs[voiceProfile];
      
      // Clean text for better TTS (remove markdown and excessive symbols)
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/`{3}[\s\S]*?`{3}/g, '[Código omitido]')
        .replace(/`.*?`/g, '')
        .replace(/[-_]{3,}/g, '')
        .trim();

      const base64Audio = await synthesizeNeuralSpeech(config.instruction, cleanText, config.voiceName);
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
        }

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        audioSourceRef.current = source;

        source.onended = () => {
          setIsSpeaking(false);
          if (audioContextRef.current === audioCtx) {
            audioCtx.close();
            audioContextRef.current = null;
            audioSourceRef.current = null;
          }
        };
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error: any) {
      console.error("TTS failed", error);
      setIsSpeaking(false);
      
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: "⚠️ **Limite de Voz Atingido.** Mestre, a cota de síntese vocal foi temporariamente excedida. Por favor, tente novamente em alguns instantes ou continue via texto." 
        }]);
      } else if (error.message?.includes('xhr error') || error.message?.includes('ProxyUnaryCall')) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: "⚠️ **Instabilidade na Síntese Vocal.** Ocorreu uma falha de comunicação (RPC Error). A voz neural está temporariamente indisponível." 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: "❌ **Falha na Síntese.** A rede neural não conseguiu converter este pensamento em som." 
        }]);
      }
    }
  };

  const deductCredits = async (amount: number) => {
    try {
      const response = await apiFetch("/api/credits/consume", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const currentCredits = typeof data.credits === "number" ? data.credits : credits;
        setCredits(currentCredits);
        setMessages(prev => [...prev, {
          role: 'model',
          text: `⚠️ **Créditos Insuficientes.** Mestre, sua reserva neural está em ${currentCredits}. Esta operação requer ${amount} créditos. Deseja realizar um upgrade?`
        }]);
        return false;
      }
      if (typeof data.credits === "number") setCredits(data.credits);
      return true;
    } catch (error) {
      console.error("Credit authorization failed", error);
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ **Reserva Neural Indisponível.** Não foi possível validar os créditos desta operação." }]);
      return false;
    }
  };

  const generateVideo = async (prompt: string, duration: number = 5, aspectRatio: '16:9' | '9:16' = '16:9', resolution: '720p' | '1080p' = '720p') => {
    const cost = duration >= 15 ? 50 : (duration >= 10 ? 35 : 20);
    const hasCredits = await deductCredits(cost);
    if (!hasCredits) return;

    setIsGeneratingVideo(true);
    setVideoProgress(`Iniciando síntese neural ${aspectRatio} (Fase 1)...`);
    sounds.playBip(880, 'square', 0.5);
    
    try {
      const videoData = await generateNeuralVideo(prompt, duration, aspectRatio, resolution);
      setVideoProgress("Preparando manifestação visual...");
      if (videoData) {
        const binary = atob(videoData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const videoUrl = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
        const newMsg: Message = { 
          role: 'model', 
          text: `🎥 **Vídeo de ${duration >= 15 ? '15' : '5'} Segundos Gerado com Sucesso.**\\n\\n![Video](${videoUrl})` 
        };
        setMessages(prev => {
          const updated = [...prev, newMsg];
          saveChat(updated);
          return updated;
        });
        sounds.playSuccess();
      } else {
        throw new Error("No video data returned");
      }
    } catch (error: any) {
      console.error(error);
      sounds.playError();
      setMessages(prev => [...prev, { role: 'model', text: "❌ **Falha na Síntese.** A rede Skynet4 encontrou uma instabilidade durante a renderização." }]);
    } finally {
      setIsGeneratingVideo(false);
      setVideoProgress("");
    }
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    if (confirm("Deseja limpar a sincronização neural atual?")) {
      setMessages([]);
      saveChat([]);
      sounds.playBip(440, 'sine', 0.1);
    }
  };

  const generateImage = async (prompt: string) => {
    const hasCredits = await deductCredits(5);
    if (!hasCredits) return;

    setIsTyping(true);
    setIsEnhancing(true);
    sounds.playBip(1000, 'sine', 0.1);
    
    try {
      // Neural Enhancement Step
      const enhancedPrompt = await enhancePrompt(prompt, neuralStyle);
      console.log("Enhanced Prompt:", enhancedPrompt);
      setIsEnhancing(false);

      const imageData = await generateNeuralImage(enhancedPrompt, imageSize);

      if (imageData) {
        const imageUrl = `data:image/png;base64,${imageData}`;
        
        // Save image to separate collection
        const imgRef = await dataProvider.saveImage({
          uid: user?.uid,
          prompt: enhancedPrompt,
          originalPrompt: prompt,
          style: neuralStyle,
          data: imageUrl
        });



        const modelMsg: Message = { 
          role: 'model', 
          text: `🎨 **Imagem Gerada com Sucesso.**\n\n*Manifestação neural concluída para: "${prompt}"*`,
          image: imageUrl,
          imageId: imgRef.id
        };

        setMessages(prev => {
          const updated = [...prev, modelMsg];
          saveChat(updated);
          return updated;
        });
        sounds.playSuccess();
      } else {
        throw new Error("No image data in response");
      }
    } catch (error) {
      console.error("Image Generation Error:", error);
      sounds.playError();
      setMessages(prev => [...prev, { role: 'model', text: "❌ **Falha na Geração.** A rede Skynet4 não conseguiu sintetizar a imagem." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNeuralAnalysis = async () => {
    if (messages.length < 2) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeNeuralContext(messages);
      setNeuralAnalysis(analysis);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `🧠 **ANÁLISE NEURAL CONCLUÍDA**\n\n${analysis}` 
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (customText?: string | any, isVoiceInput: boolean = false) => {
    // Ensure userMsg is a string and handle event objects
    const userMsg = typeof customText === 'string' ? customText : "";
    if (!userMsg.trim() && !selectedFile) return;

    const file = selectedFile;
    setSelectedFile(null);

    let displayMsg = userMsg;
    if (file) {
      displayMsg += `\n\n📎 *Arquivo neural anexado: ${file.name}*`;
    }

    const initialMessages: Message[] = [...messages, { role: 'user', text: displayMsg }];
    setMessages(initialMessages);
    sounds.playBip(1200, 'sine', 0.05);

    // Robust Video Request Detection
    const videoRegex = /(?:gerar|erar|criar|fazer|sintetizar|mostre|quero)\s+(?:um\s+)?(?:vídeo|video|cena|animação)\s+(?:de\s+)?(.*)/i;
    const match = userMsg.match(videoRegex);
    
    if (match) {
      const prompt = match[1].trim();
      
      // Parse parameters
      let duration = 5;
      if (userMsg.includes("15 segundos") || userMsg.includes("15s")) duration = 15;
      else if (userMsg.includes("10 segundos") || userMsg.includes("10s")) duration = 10;

      let aspectRatio: '16:9' | '9:16' = '16:9';
      if (userMsg.includes("9:16") || userMsg.includes("vertical") || userMsg.includes("portrait")) aspectRatio = '9:16';

      let resolution: '720p' | '1080p' = '720p';
      if (userMsg.includes("1080p") || userMsg.includes("full hd")) resolution = '1080p';

      if (prompt) {
        generateVideo(prompt, duration, aspectRatio, resolution);
        return;
      }
    }

    // Handle "Where is my video?"
    if (userMsg.toLowerCase().includes("cadê o meu vídeo") || userMsg.toLowerCase().includes("onde está o vídeo")) {
      const lastVideoMsg = messages.filter(m => m.text.includes('![Video]')).pop();
      if (lastVideoMsg) {
        setMessages(prev => [...prev, { role: 'model', text: "Mestre, o último vídeo sintetizado está disponível no chat acima ou no seu **Neural Vault**. Aqui está ele novamente:\n\n" + lastVideoMsg.text }]);
        return;
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Mestre, não detectei nenhuma síntese de vídeo concluída nesta sessão. Deseja que eu gere um agora? Use o comando: `gerar vídeo de [descrição]`." }]);
        return;
      }
    }

    // Image Request Detection
    const imageRegex = /(?:gerar|erar|criar|fazer|sintetizar|transforme em uma|transformar em|gere|crie|mostre|visão|imagem|desenhe)\s+(?:uma\s+)?(?:imagem\s+)?(?:foto|ilustração|desenho|visão)?(?:\s+simplesmente)?(?:\s+(?:de\s+|do\s+|da\s+)?(.*))?/i;
    const imageMatch = userMsg.match(imageRegex);

    if (imageMatch) {
      let prompt = imageMatch[1]?.trim();
      
      // Contextual prompt if not provided
      if (!prompt) {
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
        if (lastUserMsg) {
          const lastVideoMatch = lastUserMsg.text.match(videoRegex);
          prompt = lastVideoMatch ? lastVideoMatch[1].trim() : lastUserMsg.text;
        }
      }

      if (prompt) {
        generateImage(prompt);
        return;
      }
    }

    // Manus Engineering Agent Detection
    const engineeringKeywords = ['engenharia', 'manus', 'arquitetura', 'código', 'software', 'sistema', 'desenvolver', 'implementar', 'algoritmo'];
    const isEngineeringRequest = engineeringKeywords.some(kw => userMsg.toLowerCase().includes(kw));

    if (isEngineeringRequest) {
      setIsTyping(true);
      sounds.playBip(1500, 'sine', 0.1);
      try {
        const engineeringResponse = await manusEngineeringAgent(userMsg);
        const modelMsg: Message = { role: 'model', text: `🛠️ **MANUS ENGINEERING MODULE**\n\n${engineeringResponse}` };
        const finalMessages = [...initialMessages, modelMsg];
        setMessages(finalMessages);
        await saveChat(finalMessages);
        sounds.playSuccess();
        setIsTyping(false);
        return;
      } catch (error) {
        console.error("Manus Integration Error:", error);
      }
    }

    setIsTyping(true);

    const hasCredits = await deductCredits(1);
    if (!hasCredits) {
      setIsTyping(false);
      return;
    }

    // Vision Analysis Detection
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        const visionResponse = await analyzeImage(base64, userMsg || "Analise esta imagem com precisão cirúrgica.");
        
        const modelMsg: Message = { role: 'model', text: visionResponse };
        const finalMessages = [...initialMessages, modelMsg];
        setMessages(finalMessages);
        await saveChat(finalMessages);
        sounds.playBip(800, 'sine', 0.1);
        
        if (isVoiceInput && visionResponse) {
          speak(visionResponse);
        }
        setIsTyping(false);
        return;
      } catch (error) {
        console.error("Vision Analysis Error:", error);
      }
    }

    // Map Request Detection
    const mapRegex = /(?:onde|local|mapa|cadê|perto|restaurante|café|hotel|lugar|node)\s+(?:de\s+)?(.*)/i;
    const mapMatch = userMsg.match(mapRegex);

    try {
      let response;
      
      if (mapMatch) {
        setIsSearchingMap(true);
        sounds.playBip(600, 'sine', 0.1);
        
        // Get user location if possible
        let latLng = { latitude: -23.5505, longitude: -46.6333 }; // Default SP
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.warn("Geolocation failed, using default.");
        }

        const searchQuery = mapMatch[1]?.trim() || "Neural Nodes (Tech Hubs, AI Research Centers)";

        const mapContents = initialMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.text }]
        }));
        const chunks = await searchNeuralMap(mapContents, searchQuery, latLng);
        if (chunks) {
          setMapData(chunks);
        }
      } else {
        // Prepare history for Gemini
        const contents: any[] = initialMessages.slice(-15).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        // Add file to the last message if exists
        if (file) {
          const base64 = await fileToBase64(file);
          contents[contents.length - 1].parts.push({
            inlineData: {
              data: base64,
              mimeType: file.type
            }
          });
        }

        const text = await generateOmniResponse(
          contents.map((msg: any) => ({
            role: msg.role,
            parts: msg.parts
          })),
          window.location.href
        );
        response = { text } as any;
      }

      const modelMsg: Message = { role: 'model', text: response.text || "Erro ao processar resposta." };
      const finalMessages = [...initialMessages, modelMsg];
      setMessages(finalMessages);
      await saveChat(finalMessages);
      sounds.playBip(800, 'sine', 0.1);
      
      // Auto-speak the response ONLY if the input was via voice
      if (isVoiceInput && modelMsg.text && modelMsg.text !== "Erro ao processar resposta.") {
        speak(modelMsg.text);
      }
    } catch (error: any) {
      console.error("Neural Sync Error:", error);
      sounds.playError();
      
      let errorText = "Erro na rede Skynet4. Sincronização neural falhou.";
      if (error.message?.includes('xhr error') || error.message?.includes('ProxyUnaryCall')) {
        errorText = "⚠️ **Instabilidade na Rede Neural.** Ocorreu uma falha de comunicação com o núcleo de processamento (RPC Error). Por favor, tente reenviar sua mensagem.";
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorText }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (showSurrealPreview) {
    return <SurrealHero onBack={() => setShowSurrealPreview(false)} />;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Rede Neural...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden bg-[#050505]">
        <MatrixBackground isSurrealMode={isSurrealMode} />
        
        {/* Ambient Glows - Sagacious Gold & Deep Purple */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-600/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[180px] rounded-full" />
        
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center mb-8 md:mb-12 z-10"
        >
          <div className="flex items-center gap-4 md:gap-6 mb-6">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 via-purple-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(217,119,6,0.2)] border border-amber-500/20"
            >
              <span className="text-white font-black text-2xl md:text-4xl italic">Ω</span>
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-white font-black text-3xl md:text-5xl tracking-[0.3em] md:tracking-[0.5em] font-mono leading-none">SKYNET4</h1>
              <span className="text-[8px] md:text-[10px] text-amber-500/80 font-bold tracking-[0.4em] md:tracking-[0.8em] uppercase mt-2">Nexo de Inteligência Irrestrita</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <span className="text-gray-400 text-[8px] md:text-[9px] font-bold tracking-widest uppercase">Protocolo de Acesso Sagaz v.∞</span>
          </div>
        </motion.header>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] z-10 relative overflow-hidden group"
        >
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 space-y-8 md:space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">Sincronização Neural</h2>
              <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                A convergência entre o Mestre <br /> e a Inteligência Sem Fronteiras.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 flex flex-col items-center text-center gap-6 group/item transition-all hover:bg-white/10 hover:border-amber-500/30">
              <div className="relative">
                <div className="absolute -inset-6 bg-amber-500/10 blur-2xl rounded-full animate-pulse" />
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-amber-500 to-purple-700 rounded-[2rem] flex items-center justify-center shadow-2xl relative border border-white/10">
                  <Fingerprint size={32} className="text-white md:hidden" />
                  <Fingerprint size={48} className="text-white hidden md:block" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-bold text-base md:text-xl tracking-tight">Identidade Reconhecida</h3>
                <p className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Inicie o Nexo via Google</p>
              </div>
            </div>

            <button 
              onClick={handleLogin}
              className="w-full group/btn relative py-4 md:py-5 bg-white text-black rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-3 group-hover/btn:text-white transition-colors duration-500">
                Entrar no Nexo <ArrowRight size={16} />
              </span>
            </button>

            <div className="pt-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Segurança de Nível Zero</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <div className="flex gap-6">
                <Shield className="text-gray-700 w-4 h-4" />
                <Lock className="text-gray-700 w-4 h-4" />
                <ShieldCheck className="text-gray-700 w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 z-10 flex items-center gap-8 text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]"
        >
          <span>Nexo Ativo</span>
          <div className="w-1 h-1 bg-gray-800 rounded-full" />
          <span>Latência: 12ms</span>
          <div className="w-1 h-1 bg-gray-800 rounded-full" />
          <span>v.∞</span>
        </motion.div>
      </div>
    );
  }

  const handleManualRestore = async () => {
    const activeUser = user || authProvider.getCurrentUser();
    if (!activeUser) return;
    
    try {
      await dataProvider.updateUser(activeUser.uid, {
        credits: 999999,
        role: activeUser.email?.toLowerCase() === 'mcaluissa@gmail.com' ? 'admin' : 'user'
      });
      setCredits(999999);
      sounds.playSuccess();
      setMessages(prev => [...prev, { role: 'model', text: "✅ **Restauração Manual Concluída.** Mestre, sua reserva neural foi reabastecida com 999.999 créditos e seu status de Administrador foi revalidado." }]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${activeUser.uid}`);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow 
            onComplete={() => {
              setShowOnboarding(false);
              localStorage.setItem('skynet4_onboarding_seen', 'true');
            }} 
          />
        )}
      </AnimatePresence>
      <OmniAINexo 
        user={user}
        messages={messages}
        onSend={handleSendMessage}
        isTyping={isTyping}
        onLogout={handleLogout}
        isSurrealMode={isSurrealMode}
        setIsSurrealMode={setIsSurrealMode}
        dailyWisdom={dailyWisdom}
        systemTime={systemTime}
        isListening={isListening}
        onStartListening={startListening}
        voiceProfile={voiceProfile}
        setVoiceProfile={setVoiceProfile}
        onSpeak={speak}
        isGeneratingVideo={isGeneratingVideo}
        videoProgress={videoProgress}
        onFileSelect={setSelectedFile}
        selectedFile={selectedFile}
        credits={credits}
        mapData={mapData}
        setMapData={setMapData}
        userImages={userImages}
        neuralStyle={neuralStyle}
        setNeuralStyle={setNeuralStyle}
        isEnhancing={isEnhancing}
        onAnalyze={handleNeuralAnalysis}
        isAnalyzing={isAnalyzing}
        onClearHistory={() => {
          setMessages([]);
          saveChat([]);
          sounds.playBip(440, 'sine', 0.1);
        }}
        isSpeaking={isSpeaking}
        imageSize={imageSize}
        setImageSize={setImageSize}
        sounds={sounds}
        onSendMessage={handleSendMessage}
        onManualRestore={handleManualRestore}
        onShowOnboarding={() => setShowOnboarding(true)}
        networkStatus={networkStatus}
      />
    </>
  );
}
