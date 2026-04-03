import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { auth, db, signInWithGoogle, logout } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  LayoutDashboard, 
  Store, 
  User as UserIcon, 
  LogOut, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight, 
  Globe, 
  MapPin, 
  Mail, 
  Phone, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Link as LinkIcon,
  MessageCircle,
  ArrowRight,
  Menu,
  X,
  Settings,
  Eye,
  Edit3,
  Share2,
  Zap,
  Shield,
  Rocket
} from "lucide-react";
import { cn } from "./lib/utils";

// --- Types ---
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  username: string;
  onboarded: boolean;
  createdAt: any;
}

interface Portfolio {
  uid: string;
  profilePhoto: string;
  fullName: string;
  jobTitle: string;
  bio: string;
  location: string;
  whatsapp: string;
  email: string;
  phone: string;
  socials: {
    instagram: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
  customLinks: { title: string; url: string }[];
  featuredProjects: { title: string; location: string; image: string; tags: string[] }[];
}

// --- Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-neon-pink rounded-lg flex items-center justify-center glow-pink rotate-12">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter">
            ZREALATOR<span className="text-neon-pink">Z</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <button 
                onClick={() => navigate("/dashboard")}
                className="text-sm font-medium hover:text-neon-pink transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate("/dashboard/store")}
                className="text-sm font-medium hover:text-neon-cyan transition-colors"
              >
                Module Store
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <img 
                  src={user.photoURL || ""} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-white/20"
                />
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-neon-pink hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass border-b border-white/10 p-6 md:hidden flex flex-col gap-4"
          >
            {user ? (
              <>
                <button onClick={() => { navigate("/dashboard"); setIsOpen(false); }} className="text-left py-2 font-medium">Dashboard</button>
                <button onClick={() => { navigate("/dashboard/store"); setIsOpen(false); }} className="text-left py-2 font-medium">Module Store</button>
                <button onClick={() => { logout(); setIsOpen(false); }} className="text-left py-2 font-medium text-red-400 flex items-center gap-2">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <button onClick={() => { signInWithGoogle(); setIsOpen(false); }} className="w-full py-3 bg-neon-pink text-white font-bold rounded-xl">Get Started</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="py-12 px-6 border-t border-white/5 mt-20">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-neon-pink/20 rounded flex items-center justify-center border border-neon-pink/30">
          <Zap className="text-neon-pink" size={16} />
        </div>
        <span className="text-xl font-display font-bold tracking-tighter">
          ZREALATOR<span className="text-neon-pink">Z</span>
        </span>
      </div>
      <div className="flex gap-8 text-sm text-white/40">
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
      </div>
      <p className="text-sm text-white/20">© 2026 ZrealatorZ. Built for the future.</p>
    </div>
  </footer>
);

// --- Pages ---

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-neon-pink/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-neon-cyan uppercase mb-6 inline-block">
            Neon Edition • Realator OS
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-8 leading-[0.9]">
            THE OPERATING <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-yellow">
              SYSTEM FOR REALATORS
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Build your professional portfolio in seconds. Manage your brand, 
            showcase your listings, and scale your real estate business with the most modern OS.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => user ? navigate("/dashboard") : signInWithGoogle()}
              className="px-10 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-neon-pink hover:text-white transition-all duration-500 transform hover:scale-105 flex items-center gap-3 group"
            >
              {user ? "Go to Dashboard" : "Start Building Free"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 glass rounded-2xl font-bold hover:bg-white/10 transition-all">
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
          {[
            { 
              icon: <LayoutDashboard className="text-neon-pink" />, 
              title: "Portfolio Builder", 
              desc: "A Linktree-style digital business card optimized for real estate agents." 
            },
            { 
              icon: <Store className="text-neon-cyan" />, 
              title: "Module Store", 
              desc: "Extend your OS with custom modules for CRM, lead gen, and automation." 
            },
            { 
              icon: <Shield className="text-neon-yellow" />, 
              title: "Future Ready", 
              desc: "Built on modern tech to ensure your brand stays ahead of the curve." 
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 glass rounded-3xl text-left hover:border-white/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass rounded-[40px] p-4 border-white/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-dark/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" 
            alt="Dashboard Preview" 
            className="w-full rounded-[32px] opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute bottom-20 left-0 right-0 z-20 text-center">
            <h2 className="text-4xl font-display font-bold mb-4">Ready to upgrade your brand?</h2>
            <button 
              onClick={() => user ? navigate("/dashboard") : signInWithGoogle()}
              className="px-8 py-4 bg-neon-pink text-white font-bold rounded-2xl glow-pink hover:scale-105 transition-all"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const Onboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.onboarded) {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if username exists
      const usernameDoc = doc(db, "usernames", username.toLowerCase());
      const snap = await getDoc(usernameDoc);
      
      if (snap.exists()) {
        setError("Username already taken");
        setLoading(false);
        return;
      }

      // Create user profile
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: username.toLowerCase(),
        onboarded: true,
        createdAt: new Date().toISOString()
      });

      // Create username mapping
      await setDoc(usernameDoc, { uid: user.uid });

      // Create initial portfolio
      await setDoc(doc(db, "portfolios", user.uid), {
        uid: user.uid,
        fullName: user.displayName || "",
        profilePhoto: user.photoURL || "",
        jobTitle: "Real Estate Professional",
        bio: "Helping families find their dream homes.",
        location: "",
        whatsapp: "",
        email: user.email || "",
        phone: "",
        socials: { instagram: "", linkedin: "", twitter: "", website: "" },
        customLinks: [],
        featuredProjects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,45,120,0.1),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-10 rounded-[40px] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neon-pink rounded-2xl flex items-center justify-center glow-pink mx-auto mb-6 rotate-12">
            <Rocket className="text-white fill-white" size={32} />
          </div>
          <h2 className="text-3xl font-display font-black mb-2">Welcome to ZrealatorZ</h2>
          <p className="text-white/50">Choose your unique username to get started.</p>
        </div>

        <form onSubmit={handleOnboarding} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-white/60 mb-2 ml-1 uppercase tracking-widest">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">zrealatorz.com/</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="yourname"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-[128px] pr-4 focus:outline-none focus:border-neon-pink transition-all font-bold"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-2 ml-1 font-medium">{error}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-neon-pink hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Setting up..." : "Complete Setup"}
            <ChevronRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const portfolioUrl = `zrealatorz.com/${profile?.username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-2">
              HELLO, <span className="text-neon-pink uppercase">{profile?.displayName?.split(" ")[0]}</span>
            </h1>
            <p className="text-white/50">Welcome back to your Realator OS dashboard.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate("/dashboard/portfolio")}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-neon-cyan transition-all flex items-center gap-2"
            >
              <Edit3 size={18} /> Edit Portfolio
            </button>
            <button 
              onClick={() => window.open(`/${profile?.username}`, "_blank")}
              className="p-3 glass rounded-xl hover:bg-white/10 transition-all"
            >
              <Eye size={20} />
            </button>
          </div>
        </header>

        {/* Stats & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 glass rounded-[32px] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Your Public Link</h3>
              <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                <Globe className="text-neon-cyan" size={20} />
                <span className="flex-1 font-mono text-sm overflow-hidden text-ellipsis">{portfolioUrl}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied ? <Check className="text-green-400" size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-8 mt-12">
              <div>
                <p className="text-3xl font-display font-black">1.2k</p>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Views</p>
              </div>
              <div>
                <p className="text-3xl font-display font-black">48</p>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Link Clicks</p>
              </div>
              <div>
                <p className="text-3xl font-display font-black">12</p>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-neon-pink rounded-[32px] p-8 glow-pink flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate("/dashboard/store")}>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
            <Zap className="mb-8 group-hover:scale-125 transition-transform duration-500" size={40} />
            <div>
              <h3 className="text-2xl font-display font-black mb-2">MODULE STORE</h3>
              <p className="text-white/80 text-sm leading-relaxed">Upgrade your OS with powerful real estate modules. CRM, Automation, and more.</p>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-2">
          <LayoutDashboard className="text-neon-cyan" size={24} />
          ACTIVE MODULES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass rounded-3xl p-6 border-neon-cyan/30">
            <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center mb-4 border border-neon-cyan/20">
              <UserIcon className="text-neon-cyan" size={20} />
            </div>
            <h4 className="font-bold mb-1">Portfolio Builder</h4>
            <p className="text-xs text-white/40 mb-4 uppercase font-bold tracking-tighter">Core Module • Active</p>
            <button 
              onClick={() => navigate("/dashboard/portfolio")}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
            >
              Manage
            </button>
          </div>

          {[
            { title: "Lead CRM", icon: <MessageCircle size={20} /> },
            { title: "Listing Sync", icon: <Globe size={20} /> },
            { title: "Auto Responder", icon: <Zap size={20} /> }
          ].map((m, i) => (
            <div key={i} className="glass rounded-3xl p-6 opacity-40 grayscale relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span className="px-3 py-1 bg-white text-black text-[10px] font-black rounded-full uppercase tracking-widest">Coming Soon</span>
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4">
                {m.icon}
              </div>
              <h4 className="font-bold mb-1">{m.title}</h4>
              <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">Module • Locked</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PortfolioEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const portfolioDoc = doc(db, "portfolios", user.uid);
    const unsubscribe = onSnapshot(portfolioDoc, (snap) => {
      if (snap.exists()) {
        setPortfolio(snap.data() as Portfolio);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSave = async () => {
    if (!user || !portfolio) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "portfolios", user.uid), {
        ...portfolio,
        updatedAt: new Date().toISOString()
      });
      setMessage("Portfolio updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error saving portfolio.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!portfolio) return;
    setPortfolio({ ...portfolio, [field]: value });
  };

  const updateSocial = (field: string, value: string) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      socials: { ...portfolio.socials, [field]: value }
    });
  };

  const addLink = () => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      customLinks: [...portfolio.customLinks, { title: "", url: "" }]
    });
  };

  const removeLink = (index: number) => {
    if (!portfolio) return;
    const newLinks = [...portfolio.customLinks];
    newLinks.splice(index, 1);
    setPortfolio({ ...portfolio, customLinks: newLinks });
  };

  const updateLink = (index: number, field: "title" | "url", value: string) => {
    if (!portfolio) return;
    const newLinks = [...portfolio.customLinks];
    newLinks[index][field] = value;
    setPortfolio({ ...portfolio, customLinks: newLinks });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Zap className="animate-pulse text-neon-pink" size={48} /></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <ArrowRight className="rotate-180" size={24} />
            </button>
            <h1 className="text-3xl font-display font-black">EDIT PORTFOLIO</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-neon-pink text-white font-bold rounded-xl glow-pink hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("p-4 rounded-xl mb-8 text-center font-bold", message.includes("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400")}
          >
            {message}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Basic Info */}
          <section className="glass p-8 rounded-[32px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-neon-pink" /> BASIC INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-6 mb-4">
                <img src={portfolio?.profilePhoto} alt="Profile" className="w-20 h-20 rounded-2xl border-2 border-neon-pink" />
                <div className="flex-1">
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Profile Photo URL</label>
                  <input 
                    type="text" 
                    value={portfolio?.profilePhoto}
                    onChange={(e) => updateField("profilePhoto", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-pink outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={portfolio?.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-pink outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Job Title</label>
                <input 
                  type="text" 
                  value={portfolio?.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-pink outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Bio</label>
                <textarea 
                  value={portfolio?.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-pink outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="glass p-8 rounded-[32px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Phone size={20} className="text-neon-cyan" /> CONTACT CHANNELS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={portfolio?.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-cyan outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={portfolio?.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-cyan outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" 
                  value={portfolio?.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-cyan outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Location</label>
                <input 
                  type="text" 
                  value={portfolio?.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-cyan outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="glass p-8 rounded-[32px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Share2 size={20} className="text-neon-yellow" /> SOCIAL MEDIA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Instagram URL</label>
                <input 
                  type="text" 
                  value={portfolio?.socials.instagram}
                  onChange={(e) => updateSocial("instagram", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-yellow outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">LinkedIn URL</label>
                <input 
                  type="text" 
                  value={portfolio?.socials.linkedin}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-neon-yellow outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Custom Links */}
          <section className="glass p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <LinkIcon size={20} className="text-white" /> CUSTOM LINKS
              </h3>
              <button 
                onClick={addLink}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {portfolio?.customLinks.map((link, i) => (
                <div key={i} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest">Title</label>
                    <input 
                      type="text" 
                      value={link.title}
                      onChange={(e) => updateLink(i, "title", e.target.value)}
                      placeholder="e.g. View My Listings"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest">URL</label>
                    <input 
                      type="text" 
                      value={link.url}
                      onChange={(e) => updateLink(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-white/30"
                    />
                  </div>
                  <button 
                    onClick={() => removeLink(i)}
                    className="p-3.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {portfolio?.customLinks.length === 0 && (
                <p className="text-center py-8 text-white/20 font-medium italic">No custom links added yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!username) return;
      try {
        const usernameDoc = doc(db, "usernames", username.toLowerCase());
        const snap = await getDoc(usernameDoc);
        if (snap.exists()) {
          const uid = snap.data().uid;
          const portfolioDoc = doc(db, "portfolios", uid);
          const pSnap = await getDoc(portfolioDoc);
          if (pSnap.exists()) {
            setPortfolio(pSnap.data() as Portfolio);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-dark"><Zap className="animate-pulse text-neon-pink" size={48} /></div>;
  if (!portfolio) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark p-6 text-center">
      <h1 className="text-4xl font-display font-black mb-4">404</h1>
      <p className="text-white/50 mb-8">This Realator profile doesn't exist yet.</p>
      <button onClick={() => window.location.href = "/"} className="px-8 py-3 bg-neon-pink text-white font-bold rounded-xl">Create Your Own</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-neon-pink selection:text-white">
      <div className="max-w-xl mx-auto px-6 py-20 relative">
        {/* Background Glows */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-neon-pink/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-neon-cyan/10 blur-[120px] rounded-full" />
        </div>

        {/* Profile Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-neon-pink blur-2xl opacity-20 rounded-full" />
            <img 
              src={portfolio.profilePhoto} 
              alt={portfolio.fullName} 
              className="w-32 h-32 rounded-[40px] border-4 border-white/10 relative z-10 object-cover"
            />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-display font-black tracking-tighter mb-2 uppercase"
          >
            {portfolio.fullName}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neon-cyan font-bold tracking-widest text-xs uppercase mb-6"
          >
            {portfolio.jobTitle}
          </motion.p>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 leading-relaxed max-w-sm mx-auto mb-8"
          >
            {portfolio.bio}
          </motion.p>

          {portfolio.location && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-white/40 text-sm font-medium"
            >
              <MapPin size={14} />
              {portfolio.location}
            </motion.div>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {portfolio.whatsapp && (
            <a 
              href={`https://wa.me/${portfolio.whatsapp.replace(/\D/g, "")}`} 
              target="_blank" 
              className="flex items-center justify-center gap-3 py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all border-neon-cyan/20 text-neon-cyan"
            >
              <MessageCircle size={20} /> WhatsApp
            </a>
          )}
          {portfolio.email && (
            <a 
              href={`mailto:${portfolio.email}`} 
              className="flex items-center justify-center gap-3 py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all border-neon-pink/20 text-neon-pink"
            >
              <Mail size={20} /> Email
            </a>
          )}
        </div>

        {/* Custom Links */}
        <div className="space-y-4 mb-12">
          {portfolio.customLinks.map((link, i) => (
            <motion.a
              key={i}
              href={link.url}
              target="_blank"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="group flex items-center justify-between p-5 glass rounded-2xl hover:bg-white/10 transition-all border-white/5 hover:border-white/20"
            >
              <span className="font-bold text-lg">{link.title}</span>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-neon-pink group-hover:text-white transition-all">
                <ExternalLink size={18} />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Socials */}
        <div className="flex justify-center gap-6 mb-20">
          {portfolio.socials.instagram && (
            <a href={portfolio.socials.instagram} target="_blank" className="p-4 glass rounded-2xl text-white/60 hover:text-neon-pink hover:border-neon-pink/30 transition-all">
              <Instagram size={24} />
            </a>
          )}
          {portfolio.socials.linkedin && (
            <a href={portfolio.socials.linkedin} target="_blank" className="p-4 glass rounded-2xl text-white/60 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all">
              <Linkedin size={24} />
            </a>
          )}
          {portfolio.socials.twitter && (
            <a href={portfolio.socials.twitter} target="_blank" className="p-4 glass rounded-2xl text-white/60 hover:text-neon-yellow hover:border-neon-yellow/30 transition-all">
              <Twitter size={24} />
            </a>
          )}
          {portfolio.socials.website && (
            <a href={portfolio.socials.website} target="_blank" className="p-4 glass rounded-2xl text-white/60 hover:text-white hover:border-white/30 transition-all">
              <Globe size={24} />
            </a>
          )}
        </div>

        {/* Branding */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold tracking-widest uppercase">Powered by</span>
            <span className="font-display font-black tracking-tighter text-sm">ZREALATORZ</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const ModuleStore = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <ArrowRight className="rotate-180" size={24} />
            </button>
            <h1 className="text-4xl font-display font-black">MODULE STORE</h1>
          </div>
          <p className="text-white/50 max-w-2xl">Extend your Realator OS with specialized modules designed to automate your workflow and grow your business.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Active Module */}
          <div className="glass rounded-[40px] p-8 border-neon-pink/30 flex flex-col justify-between h-[400px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <span className="px-3 py-1 bg-neon-pink text-white text-[10px] font-black rounded-full uppercase tracking-widest glow-pink">Installed</span>
            </div>
            <div>
              <div className="w-16 h-16 bg-neon-pink/10 rounded-2xl flex items-center justify-center mb-8 border border-neon-pink/20">
                <LayoutDashboard className="text-neon-pink" size={32} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 uppercase">Portfolio Builder</h3>
              <p className="text-white/50 leading-relaxed">Your digital business card. Optimized for mobile, fast, and beautiful. Showcase your listings and links.</p>
            </div>
            <button onClick={() => navigate("/dashboard/portfolio")} className="w-full py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all">Open Module</button>
          </div>

          {/* Coming Soon Modules */}
          {[
            { 
              title: "Lead CRM", 
              icon: <MessageCircle size={32} />, 
              color: "text-neon-cyan", 
              bg: "bg-neon-cyan/10", 
              border: "border-neon-cyan/20",
              desc: "Manage your leads directly from your portfolio. Automated follow-ups and lead scoring."
            },
            { 
              title: "Listing Sync", 
              icon: <Globe size={32} />, 
              color: "text-neon-yellow", 
              bg: "bg-neon-yellow/10", 
              border: "border-neon-yellow/20",
              desc: "Automatically sync your properties from MLS or other platforms directly to your portfolio."
            },
            { 
              title: "Auto Responder", 
              icon: <Zap size={32} />, 
              color: "text-white", 
              bg: "bg-white/10", 
              border: "border-white/20",
              desc: "AI-powered responses for your WhatsApp and Email leads. Never miss a client again."
            },
            { 
              title: "Analytics Pro", 
              icon: <Eye size={32} />, 
              color: "text-purple-400", 
              bg: "bg-purple-400/10", 
              border: "border-purple-400/20",
              desc: "Deep insights into who is viewing your profile and which links are converting best."
            },
            { 
              title: "Team OS", 
              icon: <Shield size={32} />, 
              color: "text-blue-400", 
              bg: "bg-blue-400/10", 
              border: "border-blue-400/20",
              desc: "Manage your entire real estate team under one OS. Shared leads and performance tracking."
            }
          ].map((m, i) => (
            <div key={i} className="glass rounded-[40px] p-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 flex flex-col justify-between h-[400px] relative group">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                <span className="px-4 py-2 bg-white text-black text-xs font-black rounded-full uppercase tracking-widest">Coming Soon</span>
              </div>
              <div>
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border", m.bg, m.border)}>
                  <div className={m.color}>{m.icon}</div>
                </div>
                <h3 className="text-2xl font-display font-black mb-4 uppercase">{m.title}</h3>
                <p className="text-white/50 leading-relaxed">{m.desc}</p>
              </div>
              <button disabled className="w-full py-4 glass rounded-2xl font-bold opacity-50 cursor-not-allowed">Join Waitlist</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-neon-pink rounded-2xl flex items-center justify-center glow-pink animate-bounce rotate-12">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <span className="text-xs font-bold tracking-[0.3em] text-white/30 uppercase">Initializing OS...</span>
        </div>
      </div>
    );
  }

  const isPublicPortfolio = window.location.pathname.split("/").length === 2 && 
                            window.location.pathname !== "/" && 
                            !["dashboard", "onboarding"].includes(window.location.pathname.split("/")[1]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isPublicPortfolio && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={user ? <Onboarding /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={
            user ? (
              profile?.onboarded ? <Dashboard /> : <Navigate to="/onboarding" />
            ) : <Navigate to="/" />
          } />
          <Route path="/dashboard/portfolio" element={
            user ? (
              profile?.onboarded ? <PortfolioEditor /> : <Navigate to="/onboarding" />
            ) : <Navigate to="/" />
          } />
          <Route path="/dashboard/store" element={
            user ? (
              profile?.onboarded ? <ModuleStore /> : <Navigate to="/onboarding" />
            ) : <Navigate to="/" />
          } />
          <Route path="/:username" element={<PublicPortfolio />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isPublicPortfolio && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
