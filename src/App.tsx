/**
 * @license
 * SPDX
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Wifi, ArrowRight, Lock, ShieldCheck, Zap, Terminal, Loader2, Cloud, Cpu,
  EyeOff, Activity, ChevronDown, MessageSquare, Globe, Fingerprint, Menu, Flame,
  SquarePen, Plus, Mic, Send, Search, ImageIcon, Brain, Code as CodeIcon, X, Settings,
  Database, Radio, Video, PenTool, Sparkles, Layers, Play, Download, AlertCircle,
  Volume2, LogOut, History, User as UserIcon, Infinity as InfinityIcon
} from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { withRetry } from './lib/retry';
import { apiConfig } from './config/api-config';
import Markdown from 'react-markdown';
import { syncToSupabase } from './components/services/lib/supabase';
import { enhancePrompt, analyzeNeuralContext, analyzeImage, manusEngineeringAgent } from './components/services/neuralService';
import SurrealHero from './components/SurrealHero';
import OmniAINexo from './components/OmniAINexo';
import OnboardingFlow from './components/OnboardingFlow';
import { 
  auth, db, googleProvider, signInWithPopup, onAuthStateChanged, serverTimestamp, Timestamp, User
} from './firebase';
import { 
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, orderBy, limit, addDoc
} from 'firebase/firestore';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const ai = new GoogleGenAI({ apiKey: apiConfig.geminiApiKey || '' });

// ... unchanged component code ...
