import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ImageWithFallback } from './components/figma/ImageWithFallback'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import {
  ShoppingCart, Heart, Search, Star, MapPin, Phone, MessageCircle,
  ArrowLeft, Plus, Minus, Trash2, Package, Truck, CheckCircle,
  XCircle, Clock, User, LogOut, Menu, X, TrendingUp, Users,
  ShoppingBag, LayoutDashboard, List, Shield, Tag, Filter, Eye,
  ChevronRight, Bell, Settings, Edit, Trash, Plus as PlusIcon, Home,
  AlertCircle
} from 'lucide-react'
import logoMain from '@/imports/WhatsApp_Image_2026-06-24_at_7.27.08_PM-2.jpeg'

// ─── SUPABASE API ────────────────────────────────────────────────────────────

const SB_BASE = 'https://xymeznfxzytyzmfimbdp.supabase.co/functions/v1/server/make-server-be870e9e'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bWV6bmZ4enl0eXptZmltYmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDUxMjgsImV4cCI6MjA5ODQ4MTEyOH0.-B7_lMCl13mR5emoqB5USM4BOgiYadF5lZ-709iFdw4'
const SB_HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SB_KEY}` }

async function sbGet<T>(path: string): Promise<T> {
  const r = await fetch(`${SB_BASE}/${path}`, { headers: SB_HEADERS })
  return r.json()
}
async function sbPut(path: string, data: unknown): Promise<void> {
  await fetch(`${SB_BASE}/${path}`, { method: 'PUT', headers: SB_HEADERS, body: JSON.stringify(data) })
}

// ─── TYPES ──────────────────────────────────────────────────────────────────

type View = 'home' | 'shop' | 'product' | 'cart' | 'checkout' |
  'tracking' | 'auth' | 'account' | 'admin-login' | 'admin-dashboard' |
  'admin-orders' | 'admin-products' | 'admin-customers'

interface Product {
  id: number; name: string; club: string; player?: string; playerNumber?: string
  country: string; season: string; description?: string
  type: 'players' | 'no-players'; price: number
  sizes: string[]; stock: number; image: string; isNew: boolean
  isBestSeller: boolean; rating: number; reviews: number
}
interface CartItem { product: Product; size: string; quantity: number }
interface Order {
  id: string; orderNumber: string; trackingCode: string; date: string
  customer: { name: string; phone: string; address: string; region: string; city: string; quarter: string }
  items: CartItem[]; total: number; payment: string
  status: 'nouvelle' | 'confirmee' | 'preparation' | 'livraison' | 'livree' | 'annulee'
  notes: string
}
interface Customer {
  id: string; name: string; email: string; phone: string; password: string
  favorites: number[]; orders: string[]
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const IMGS = {
  arsenal: 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  bayern: 'https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  brazil: 'https://images.unsplash.com/photo-1552066379-e7bfd22155c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  barca: 'https://images.unsplash.com/photo-1662096909714-e2f206d0a636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  hanging: 'https://images.unsplash.com/photo-1738091063217-1f59463342c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  col: 'https://images.unsplash.com/photo-1762361695298-f33ba71c28ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  colombia: 'https://images.unsplash.com/photo-1763656812756-3539efd3e301?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  manunited: 'https://images.unsplash.com/photo-1772474659559-7d009fef11df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Maillot Real Madrid', club: 'Real Madrid', player: 'Vinicius Jr', playerNumber: '7', country: 'Espagne', season: '2025/26', description: 'Maillot domicile officiel Real Madrid avec flocage Vinicius Jr.', type: 'players', price: 8000, sizes: ['M','L','XL','2XL'], stock: 15, image: IMGS.col, isNew: true, isBestSeller: true, rating: 4.9, reviews: 48 },
  { id: 2, name: 'Maillot PSG', club: 'PSG', player: 'Mbappé', playerNumber: '10', country: 'France', season: '2025/26', description: 'Maillot domicile PSG saison 2025/26 avec flocage Mbappé.', type: 'players', price: 8000, sizes: ['M','L','XL','2XL'], stock: 12, image: IMGS.barca, isNew: true, isBestSeller: true, rating: 4.8, reviews: 35 },
  { id: 3, name: 'Maillot Arsenal', club: 'Arsenal', player: 'Saka', playerNumber: '7', country: 'Angleterre', season: '2025/26', description: 'Maillot domicile Arsenal rouge canonique avec flocage Saka.', type: 'players', price: 8000, sizes: ['L','XL','2XL'], stock: 8, image: IMGS.arsenal, isNew: false, isBestSeller: true, rating: 4.7, reviews: 29 },
  { id: 4, name: 'Maillot Bayern Munich', club: 'Bayern Munich', player: 'Kane', playerNumber: '9', country: 'Allemagne', season: '2025/26', description: 'Maillot Bayern Munich rouge avec flocage Harry Kane.', type: 'players', price: 8000, sizes: ['M','L','XL'], stock: 10, image: IMGS.bayern, isNew: true, isBestSeller: false, rating: 4.6, reviews: 22 },
  { id: 5, name: 'Maillot Brésil', club: 'Sélection Brésil', player: 'Rodrygo', playerNumber: '11', country: 'Brésil', season: '2026', description: 'Maillot officiel Seleção brésilienne avec flocage Rodrygo.', type: 'players', price: 8000, sizes: ['M','L','XL','2XL'], stock: 20, image: IMGS.brazil, isNew: false, isBestSeller: true, rating: 4.9, reviews: 61 },
  { id: 6, name: 'Maillot Man. United', club: 'Manchester United', player: 'Rashford', playerNumber: '10', country: 'Angleterre', season: '2025/26', description: 'Maillot domicile Manchester United avec flocage Rashford.', type: 'players', price: 8000, sizes: ['L','XL','2XL'], stock: 6, image: IMGS.manunited, isNew: false, isBestSeller: false, rating: 4.5, reviews: 18 },
  { id: 7, name: 'Maillot Colombie', club: 'Sélection Colombie', player: 'J. Díaz', playerNumber: '11', country: 'Colombie', season: '2026', description: 'Maillot jaune iconique de la Colombie avec flocage Luis Díaz.', type: 'players', price: 8000, sizes: ['M','L','XL'], stock: 9, image: IMGS.colombia, isNew: true, isBestSeller: false, rating: 4.7, reviews: 14 },
  { id: 8, name: 'Real Madrid — Sans Joueur', club: 'Real Madrid', country: 'Espagne', season: '2025/26', description: 'Maillot domicile Real Madrid sans flocage. Personnalisez vous-même !', type: 'no-players', price: 6000, sizes: ['M','L','XL','2XL'], stock: 25, image: IMGS.col, isNew: false, isBestSeller: true, rating: 4.8, reviews: 52 },
  { id: 9, name: 'PSG — Sans Joueur', club: 'PSG', country: 'France', season: '2025/26', description: 'Maillot PSG domicile sans flocage. Idéal pour personnalisation.', type: 'no-players', price: 6000, sizes: ['M','L','XL','2XL'], stock: 18, image: IMGS.barca, isNew: false, isBestSeller: true, rating: 4.7, reviews: 41 },
  { id: 10, name: 'Arsenal — Sans Joueur', club: 'Arsenal', country: 'Angleterre', season: '2025/26', description: 'Maillot Arsenal rouge sans flocage. Qualité premium.', type: 'no-players', price: 6000, sizes: ['M','L','XL'], stock: 14, image: IMGS.arsenal, isNew: true, isBestSeller: false, rating: 4.6, reviews: 27 },
  { id: 11, name: 'Bayern Munich — Sans Joueur', club: 'Bayern Munich', country: 'Allemagne', season: '2025/26', description: 'Maillot Bayern Munich sans flocage. Tissu premium respirant.', type: 'no-players', price: 6000, sizes: ['M','L','XL','2XL'], stock: 11, image: IMGS.hanging, isNew: false, isBestSeller: false, rating: 4.5, reviews: 19 },
  { id: 12, name: 'Brésil — Sans Joueur', club: 'Sélection Brésil', country: 'Brésil', season: '2026', description: 'Maillot Brésil jaune et vert sans flocage. Superbe qualité.', type: 'no-players', price: 6000, sizes: ['M','L','XL','2XL'], stock: 22, image: IMGS.brazil, isNew: true, isBestSeller: true, rating: 4.9, reviews: 58 },
  { id: 13, name: 'Liverpool — Sans Joueur', club: 'Liverpool', country: 'Angleterre', season: '2025/26', description: 'Maillot Liverpool rouge sans flocage. Livraison rapide Bamako.', type: 'no-players', price: 6000, sizes: ['L','XL','2XL'], stock: 7, image: IMGS.manunited, isNew: false, isBestSeller: false, rating: 4.4, reviews: 12 },
]

const TESTIMONIALS = [
  { name: 'Moussa K.', city: 'Bamako', stars: 5, text: "Qualité top, livraison rapide à Sénou. Je recommande Jersey House à 100% !" },
  { name: 'Fatoumata D.', city: 'Bamako', stars: 5, text: "Le maillot Real Madrid est magnifique. Exactement ce que j'attendais !" },
  { name: 'Ibrahim S.', city: 'Bamako', stars: 5, text: "Service client WhatsApp très réactif. Commande reçue le jour même." },
  { name: 'Aminata C.', city: 'Kalaban-Coro', stars: 4, text: "Très bonne qualité pour le prix. Maillot PSG impeccable !" },
]

const MALI_REGIONS = ['Bamako', 'Kayes', 'Koulikoro', 'Sikasso', 'Ségou', 'Mopti', 'Gao', 'Tombouctou', 'Kidal']
const BAMAKO_COMMUNES = ['Commune I', 'Commune II', 'Commune III', 'Commune IV', 'Commune V', 'Commune VI']
const QUARTERS: Record<string, string[]> = {
  'Commune I': ['Banconi', 'Boulkassoumbougou', 'Doumanzana', 'Djélibougou'],
  'Commune II': ['Bagadadji', 'Niarela', 'Quinzambougou', 'Medina Coura'],
  'Commune III': ['Bacodjicoroni', 'Missira', 'Hippodrome', 'Dravéla'],
  'Commune IV': ['Lafiabougou', 'Taliko', 'Lassa', 'Korofina'],
  'Commune V': ['Badalabougou', 'Hamdallaye', 'Kalaban Coura', 'Torokorobougou'],
  'Commune VI': ['Magnambougou', 'Niamakoro', 'Sénou', 'Yirimadio', 'Sabalibougou'],
}

const CHART_DATA = [
  { month: 'Jan 26', ventes: 45, ca: 270000 },
  { month: 'Fév 26', ventes: 52, ca: 328000 },
  { month: 'Mar 26', ventes: 61, ca: 402000 },
  { month: 'Avr 26', ventes: 48, ca: 296000 },
  { month: 'Mai 26', ventes: 70, ca: 476000 },
  { month: 'Jun 26', ventes: 83, ca: 574000 },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const PINK = '#e91e8c'
const genId = () => Math.random().toString(36).slice(2, 10).toUpperCase()
const genOrderNum = () => `JH-${Date.now().toString().slice(-6)}`
const genTrack = () => `TRK-${genId()}`
const fmtPrice = (p: number) => `${p.toLocaleString('fr-FR')} FCFA`
const now = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function useLocalStorage<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init }
    catch { return init }
  })
  const set = (v: T | ((prev: T) => T)) => {
    setVal(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }
  return [val, set] as const
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  nouvelle: { label: 'Nouvelle', color: 'bg-yellow-500', icon: '🟡' },
  confirmee: { label: 'Confirmée', color: 'bg-green-500', icon: '🟢' },
  preparation: { label: 'En préparation', color: 'bg-blue-500', icon: '🔵' },
  livraison: { label: 'En livraison', color: 'bg-purple-500', icon: '🟣' },
  livree: { label: 'Livrée', color: 'bg-emerald-500', icon: '✅' },
  annulee: { label: 'Annulée', color: 'bg-red-500', icon: '🔴' },
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const s = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${s.color}`}>
      {s.icon} {s.label}
    </span>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar({
  view, setView, cartCount, user, onLogout, favCount
}: {
  view: View; setView: (v: View) => void; cartCount: number
  user: Customer | null; onLogout: () => void; favCount: number
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button onClick={() => setView('home')} className="flex-shrink-0">
          <ImageWithFallback src={logoMain} alt="Jersey House" className="h-10 w-auto object-contain" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
          {[['home','Accueil'],['shop','Boutique'],['tracking','Suivi commande']] .map(([v,l]) => (
            <button key={v} onClick={() => setView(v as View)}
              className={`hover:text-white transition-colors ${view === v ? 'text-white' : ''}`}>{l}</button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => setView('shop')} className="text-white/60 hover:text-white transition-colors">
            <Search className="size-5" />
          </button>
          <button onClick={() => setView(user ? 'account' : 'auth')}
            className="hidden sm:flex text-white/60 hover:text-white transition-colors relative">
            <User className="size-5" />
          </button>
          <button onClick={() => setView('cart')} className="relative text-white/60 hover:text-white transition-colors">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full text-[10px] font-black flex items-center justify-center"
                style={{ background: PINK }}>{cartCount}</span>
            )}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/60 hover:text-white">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          {user && (
            <button onClick={onLogout} className="hidden md:flex text-white/40 hover:text-white/70 transition-colors">
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 flex flex-col gap-4 text-sm font-medium text-white/70">
          {[['home','Accueil'],['shop','Boutique'],['tracking','Suivi commande'],
            [user ? 'account' : 'auth', user ? 'Mon Compte' : 'Connexion']].map(([v,l]) => (
            <button key={v} onClick={() => { setView(v as View); setMenuOpen(false) }}
              className="text-left hover:text-white transition-colors">{l}</button>
          ))}
          {user && <button onClick={() => { onLogout(); setMenuOpen(false) }} className="text-left text-red-400">Déconnexion</button>}
        </div>
      )}
    </header>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer({ setView }: { setView: (v: View) => void }) {
  const wa = (msg: string) => window.open(`https://wa.me/22370442282?text=${encodeURIComponent(msg)}`, '_blank')
  return (
    <footer className="bg-black border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <ImageWithFallback src={logoMain} alt="Jersey House" className="h-12 w-auto object-contain mb-3" />
          <p className="text-white/40 text-sm leading-relaxed">La maison des passionnés de football à Bamako, Sénou.</p>
          <p className="text-white/40 text-xs mt-4">★ Depuis 2026</p>
        </div>
        <div>
          <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Navigation</p>
          {[['home','Accueil'],['shop','Boutique'],['tracking','Suivi commande'],['auth','Mon Compte']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v as View)} className="block text-white/40 hover:text-white text-sm mb-2 text-left transition-colors">{l}</button>
          ))}
        </div>
        <div>
          <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Paiement</p>
          {['Orange Money', 'Wave', 'Confirmation WhatsApp'].map(p => (
            <p key={p} className="text-white/40 text-sm mb-2">{p}</p>
          ))}
        </div>
        <div>
          <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Contact</p>
          <p className="flex items-center gap-2 text-white/40 text-sm mb-2"><MapPin className="size-3.5" />Bamako, Sénou</p>
          <p className="flex items-center gap-2 text-white/40 text-sm mb-4"><Phone className="size-3.5" />+223 70 44 22 82</p>
          <button onClick={() => wa('Bonjour Jersey House !')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: '#25D366' }}>
            <MessageCircle className="size-4" /> WhatsApp
          </button>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-white/20 text-xs">
        © 2026 Jersey House · Bamako, Mali · Tous droits réservés
      </div>
    </footer>
  )
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({
  product, onView, onAddCart, onToggleFav, isFav
}: {
  product: Product
  onView: () => void
  onAddCart: (size: string) => void
  onToggleFav: () => void
  isFav: boolean
}) {
  const [selectedSize, setSelectedSize] = useState('')
  return (
    <div className="bg-white/5 border border-white/10 hover:border-[#e91e8c]/50 rounded-2xl overflow-hidden group transition-all hover:shadow-[0_0_30px_rgba(233,30,140,0.12)]">
      <div className="relative h-52 overflow-hidden bg-white/5 cursor-pointer" onClick={onView}>
        <ImageWithFallback src={product.image} alt={product.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
          {product.isNew && <span className="bg-[#e91e8c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOUVEAU</span>}
          {product.isBestSeller && <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ TOP VENTE</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onToggleFav() }}
          className={`absolute top-3 right-3 size-8 rounded-full flex items-center justify-center bg-black/50 backdrop-blur transition-colors ${isFav ? 'text-[#e91e8c]' : 'text-white/60 hover:text-[#e91e8c]'}`}>
          <Heart className="size-4" fill={isFav ? PINK : 'none'} />
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white/60 text-xs">{product.club} · {product.season}</p>
          {product.player && <p className="text-white text-sm font-bold">{product.player}</p>}
        </div>
      </div>
      <div className="p-4">
        <p className="text-white font-bold text-sm mb-1 truncate">{product.name}</p>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({length: 5}).map((_,i) => (
            <Star key={i} className={`size-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-white/20'}`} fill={i < Math.floor(product.rating) ? '#facc15' : 'none'} />
          ))}
          <span className="text-white/30 text-xs ml-1">({product.reviews})</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.sizes.map(s => (
            <button key={s} onClick={() => setSelectedSize(s)}
              className={`text-xs px-2 py-0.5 rounded border font-medium transition-all ${selectedSize === s
                ? 'border-[#e91e8c] bg-[#e91e8c]/10 text-[#e91e8c]'
                : 'border-white/20 text-white/50 hover:border-white/50'}`}>{s}</button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-[#e91e8c]">{fmtPrice(product.price)}</span>
          <button
            onClick={() => selectedSize ? onAddCart(selectedSize) : onView()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all"
            style={{ background: PINK }}>
            <ShoppingCart className="size-3" />
            {selectedSize ? 'Ajouter' : 'Choisir'}
          </button>
        </div>
        {product.stock < 10 && <p className="text-red-400 text-xs mt-2">⚠ Plus que {product.stock} en stock</p>}
      </div>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({
  products, setView, setSelectedProduct, cart, setCart, favorites, setFavorites
}: {
  products: Product[]; setView: (v: View) => void; setSelectedProduct: (p: Product) => void
  cart: CartItem[]; setCart: (f: CartItem[] | ((p: CartItem[]) => CartItem[])) => void
  favorites: number[]; setFavorites: (f: number[] | ((p: number[]) => number[])) => void
}) {
  const wa = (msg: string) => window.open(`https://wa.me/22370442282?text=${encodeURIComponent(msg)}`, '_blank')

  const addToCart = (p: Product, size: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id && i.size === size)
      if (ex) return prev.map(i => i.product.id === p.id && i.size === size ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product: p, size, quantity: 1 }]
    })
  }

  const toggleFav = (id: number) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])

  const newProducts = products.filter(p => p.isNew).slice(0, 4)
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-black py-20 md:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: PINK }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ background: PINK }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-4 px-3 py-1 rounded-full border" style={{ color: PINK, borderColor: `${PINK}40` }}>
              La Maison des Passionnés de Football
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-none text-white mb-4">
              REPRÉSENTEZ<br /><span style={{ color: PINK }}>VOS COULEURS</span>
            </h1>
            <p className="text-white/50 text-lg mb-8 max-w-md mx-auto md:mx-0">
              Maillots authentiques · Qualité premium · Livraison rapide à Bamako
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button onClick={() => setView('shop')}
                className="px-8 py-3 rounded-full font-black text-white text-sm transition-transform hover:scale-105"
                style={{ background: PINK }}>
                Voir la boutique
              </button>
              <button onClick={() => wa('Bonjour Jersey House ! Je veux commander un maillot.')}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm border border-white/20 hover:border-white/40 transition-colors">
                <MessageCircle className="size-4" style={{ color: '#25D366' }} /> Commander sur WhatsApp
              </button>
            </div>
            <div className="mt-10 flex items-center gap-8 justify-center md:justify-start">
              {[['✓ Maillots Players & Fans', ''], ['✓ Qualité Premium', ''], ['✓ Livraison Rapide', '']].map(([l]) => (
                <span key={l} className="text-white/40 text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 w-72 md:w-96">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: PINK }} />
              <ImageWithFallback src={IMGS.brazil} alt="Maillots football" className="relative rounded-3xl w-full object-cover aspect-[3/4]" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur rounded-xl p-3 border border-white/10">
                <p className="text-white font-bold text-sm">Maillots Players</p>
                <p className="font-black text-lg" style={{ color: PINK }}>8 000 FCFA</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="relative max-w-7xl mx-auto px-4 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['500+','Maillots vendus'],['⭐ 4.9','Satisfaction'],['24h','Livraison Bamako'],['2','Types de maillots']].map(([v,l]) => (
            <div key={l} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xl font-black text-white">{v}</p>
              <p className="text-white/40 text-xs mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PINK }}>Nouveautés</p>
            <h2 className="text-3xl font-black text-white">DERNIÈRES ARRIVÉES</h2>
          </div>
          <button onClick={() => setView('shop')} className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
            Voir tout <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newProducts.map(p => (
            <ProductCard key={p.id} product={p}
              onView={() => { setSelectedProduct(p); setView('product') }}
              onAddCart={size => addToCart(p, size)}
              onToggleFav={() => toggleFav(p.id)}
              isFav={favorites.includes(p.id)} />
          ))}
        </div>
      </section>

      {/* Catégories */}
      <section className="bg-white/[0.02] border-y border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PINK }}>Catégories</p>
            <h2 className="text-3xl font-black text-white">NOS COLLECTIONS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Maillots Players', sub: 'Avec nom & numéro de joueur', price: '8 000 FCFA', img: IMGS.arsenal, filter: 'players' },
              { label: 'Maillots No Players', sub: 'Sans nom de joueur', price: '6 000 FCFA', img: IMGS.brazil, filter: 'no-players' },
            ].map(c => (
              <button key={c.filter} onClick={() => setView('shop')}
                className="relative overflow-hidden rounded-2xl group text-left border border-white/10 hover:border-[#e91e8c]/40 transition-all">
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback src={c.img} alt={c.label} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-black text-xl">{c.label}</p>
                  <p className="text-white/50 text-sm">{c.sub}</p>
                  <p className="font-black text-base mt-1" style={{ color: PINK }}>{c.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Meilleures ventes */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PINK }}>Populaires</p>
            <h2 className="text-3xl font-black text-white">MEILLEURES VENTES</h2>
          </div>
          <button onClick={() => setView('shop')} className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
            Voir tout <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map(p => (
            <ProductCard key={p.id} product={p}
              onView={() => { setSelectedProduct(p); setView('product') }}
              onAddCart={size => addToCart(p, size)}
              onToggleFav={() => toggleFav(p.id)}
              isFav={favorites.includes(p.id)} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-4 md:mx-auto max-w-7xl mb-10">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${PINK}, #7c0c4e)` }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">🔥 Offre Spéciale</p>
              <h3 className="text-white text-3xl font-black">Commandez 2 maillots,<br />livraison gratuite !</h3>
              <p className="text-white/70 mt-2">Disponible pour tout Bamako · Valable ce mois-ci</p>
            </div>
            <button onClick={() => wa('Bonjour ! Je veux profiter de la promo 2 maillots livraison gratuite !')}
              className="flex-shrink-0 bg-white px-8 py-3 rounded-full font-black text-sm transition-transform hover:scale-105"
              style={{ color: PINK }}>
              Profiter de l&apos;offre
            </button>
          </div>
        </div>
      </section>

      {/* Avis Clients */}
      <section className="bg-white/[0.02] border-y border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PINK }}>Témoignages</p>
            <h2 className="text-3xl font-black text-white">AVIS DE NOS CLIENTS</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({length:5}).map((_,j) => <Star key={j} className="size-3.5 text-yellow-400" fill="#facc15" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ background: PINK }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: PINK }}>Notre Histoire</p>
            <h2 className="text-3xl font-black text-white mb-4">JERSEY HOUSE,<br />BAMAKO SÉNOU</h2>
            <p className="text-white/50 leading-relaxed mb-4">
              Jersey House est la boutique de référence pour les passionnés de football à Bamako.
              Nous proposons des maillots authentiques de qualité premium pour tous les clubs et sélections du monde entier.
            </p>
            <p className="text-white/50 leading-relaxed mb-6">
              Commandez facilement via WhatsApp, payez avec Orange Money ou Wave,
              et recevez votre maillot rapidement à domicile.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[['🏆','Qualité'],['🚀','Livraison rapide'],['💰','Prix accessible']].map(([emoji, l]) => (
                <div key={l} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">{emoji}</p>
                  <p className="text-white/60 text-xs font-medium">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ImageWithFallback src={IMGS.arsenal} alt="Maillots" className="rounded-2xl aspect-square object-cover" />
            <ImageWithFallback src={IMGS.brazil} alt="Maillots" className="rounded-2xl aspect-square object-cover mt-6" />
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="border-t border-white/10 py-16 bg-black text-center px-4">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Commandez maintenant</p>
        <h2 className="text-4xl font-black text-white mb-2">+223 70 44 22 82</h2>
        <p className="text-white/40 mb-6">Disponible 7j/7 · Réponse rapide garantie</p>
        <button onClick={() => wa('Bonjour Jersey House ! Je voudrais commander un maillot.')}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-black text-white text-base transition-transform hover:scale-105"
          style={{ background: '#25D366' }}>
          <MessageCircle className="size-5" /> Écrire sur WhatsApp
        </button>
      </section>
    </div>
  )
}

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────

function ShopPage({
  products, setView, setSelectedProduct, cart, setCart, favorites, setFavorites
}: {
  products: Product[]; setView: (v: View) => void; setSelectedProduct: (p: Product) => void
  cart: CartItem[]; setCart: (f: CartItem[] | ((p: CartItem[]) => CartItem[])) => void
  favorites: number[]; setFavorites: (f: number[] | ((p: number[]) => number[])) => void
}) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'players' | 'no-players'>('all')
  const [countryFilter, setCountryFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default')
  const [showFilters, setShowFilters] = useState(false)

  const clubs = [...new Set(products.map(p => p.club))]
  const countries = [...new Set(products.map(p => p.country))]

  const filtered = useMemo(() => {
    let list = products
    if (query) list = list.filter(p => [p.name, p.club, p.player ?? '', p.country].some(s => s.toLowerCase().includes(query.toLowerCase())))
    if (typeFilter !== 'all') list = list.filter(p => p.type === typeFilter)
    if (countryFilter) list = list.filter(p => p.country === countryFilter)
    if (sizeFilter) list = list.filter(p => p.sizes.includes(sizeFilter))
    if (sortBy === 'price-asc') list = [...list].sort((a,b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a,b) => b.price - a.price)
    if (sortBy === 'rating') list = [...list].sort((a,b) => b.rating - a.rating)
    return list
  }, [products, query, typeFilter, countryFilter, sizeFilter, sortBy])

  const addToCart = (p: Product, size: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id && i.size === size)
      if (ex) return prev.map(i => i.product.id === p.id && i.size === size ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product: p, size, quantity: 1 }]
    })
  }
  const toggleFav = (id: number) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">BOUTIQUE</h1>
        <p className="text-white/40">{filtered.length} maillots disponibles</p>
      </div>

      {/* Search + filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un club, joueur, pays…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#e91e8c]/50" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${showFilters ? 'border-[#e91e8c] text-[#e91e8c]' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
            <Filter className="size-4" /> Filtres
          </button>
        </div>
        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1 block">Type</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="all">Tous</option>
                <option value="players">Players</option>
                <option value="no-players">No Players</option>
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Pays</label>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="">Tous les pays</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Taille</label>
              <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="">Toutes</option>
                {['M','L','XL','2XL'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Trier par</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option value="default">Par défaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {[['all','Tous'], ['players','Players (8 000)'], ['no-players','No Players (6 000)']].map(([v,l]) => (
            <button key={v} onClick={() => setTypeFilter(v as typeof typeFilter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${typeFilter === v ? 'text-white border-[#e91e8c]' : 'text-white/50 border-white/10 hover:border-white/30'}`}
              style={typeFilter === v ? { background: PINK } : {}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <ShoppingBag className="size-12 mx-auto mb-3 opacity-30" />
          <p>Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p}
              onView={() => { setSelectedProduct(p); setView('product') }}
              onAddCart={size => addToCart(p, size)}
              onToggleFav={() => toggleFav(p.id)}
              isFav={favorites.includes(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────

function ProductDetailPage({
  product, setView, setCart, favorites, setFavorites
}: {
  product: Product; setView: (v: View) => void
  setCart: (f: CartItem[] | ((p: CartItem[]) => CartItem[])) => void
  favorites: number[]; setFavorites: (f: number[] | ((p: number[]) => number[])) => void
}) {
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const isFav = favorites.includes(product.id)

  const addToCart = () => {
    if (!size) return
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.size === size)
      if (ex) return prev.map(i => i.product.id === product.id && i.size === size ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { product, size, quantity: qty }]
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const orderWA = () => {
    const msg = `Bonjour Jersey House ! Je veux commander :\n*${product.name}*${product.player ? ` — ${product.player}` : ''}\nSaison: ${product.season}\nTaille: ${size || '?'}\nQuantité: ${qty}\nPrix: ${fmtPrice(product.price * qty)}`
    window.open(`https://wa.me/22370442282?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => setView('shop')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Retour à la boutique
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative rounded-2xl overflow-hidden bg-white/5 aspect-square">
          <ImageWithFallback src={product.image} alt={product.name} className="size-full object-cover" />
          <button onClick={() => setFavorites(prev => prev.includes(product.id) ? prev.filter(f => f !== product.id) : [...prev, product.id])}
            className={`absolute top-4 right-4 size-10 rounded-full bg-black/60 flex items-center justify-center ${isFav ? 'text-[#e91e8c]' : 'text-white/60'}`}>
            <Heart className="size-5" fill={isFav ? PINK : 'none'} />
          </button>
          {product.isNew && <span className="absolute top-4 left-4 text-xs font-black px-3 py-1 rounded-full text-white" style={{ background: PINK }}>NOUVEAU</span>}
        </div>
        <div>
          <p className="text-white/40 text-sm mb-1">{product.club} · {product.country} · {product.season}</p>
          <h1 className="text-3xl font-black text-white mb-1">{product.name}</h1>
          {product.player && <p className="font-bold mb-3" style={{ color: PINK }}>#{product.player}</p>}
          <div className="flex items-center gap-2 mb-4">
            {Array.from({length:5}).map((_,i) => <Star key={i} className={`size-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-white/20'}`} fill={i < Math.floor(product.rating) ? '#facc15' : 'none'} />)}
            <span className="text-white/40 text-sm">{product.rating} ({product.reviews} avis)</span>
          </div>
          <p className="text-3xl font-black mb-6" style={{ color: PINK }}>{fmtPrice(product.price)}</p>

          <div className="mb-5">
            <p className="text-white/50 text-sm mb-2">Type : <span className="text-white">{product.type === 'players' ? 'Avec joueur' : 'Sans joueur'}</span></p>
            <p className="text-white/50 text-sm">Stock : <span className={product.stock < 5 ? 'text-red-400' : 'text-green-400'}>{product.stock} disponibles</span></p>
          </div>

          <div className="mb-5">
            <p className="text-white/50 text-sm mb-2 font-medium">Sélectionner une taille</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`px-5 py-2 rounded-xl border font-bold text-sm transition-all ${size === s ? 'text-white border-[#e91e8c]' : 'border-white/20 text-white/60 hover:border-white/50'}`}
                  style={size === s ? { background: `${PINK}20` } : {}}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <p className="text-white/50 text-sm font-medium">Quantité</p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-2 hover:bg-white/10 text-white transition-colors"><Minus className="size-4" /></button>
              <span className="text-white font-bold px-2">{qty}</span>
              <button onClick={() => setQty(q => q+1)} className="px-3 py-2 hover:bg-white/10 text-white transition-colors"><Plus className="size-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={addToCart} disabled={!size}
              className="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: added ? '#16a34a' : PINK }}>
              <ShoppingCart className="size-5" />
              {added ? '✓ Ajouté au panier !' : (size ? 'Ajouter au panier' : 'Choisir une taille')}
            </button>
            <button onClick={orderWA}
              className="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da357] transition-colors">
              <MessageCircle className="size-5" /> Commander sur WhatsApp
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[['🔒','Paiement sécurisé'],['🚀','Livraison rapide'],['↩️','Échange facile']].map(([e,l]) => (
              <div key={l} className="bg-white/5 rounded-xl p-3">
                <p className="text-lg mb-1">{e}</p>
                <p className="text-white/40 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────

function CartPage({ cart, setCart, setView }: {
  cart: CartItem[]; setCart: (f: CartItem[] | ((p: CartItem[]) => CartItem[])) => void; setView: (v: View) => void
}) {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const updateQty = (id: number, size: string, qty: number) => {
    if (qty < 1) { setCart(prev => prev.filter(i => !(i.product.id === id && i.size === size))); return }
    setCart(prev => prev.map(i => i.product.id === id && i.size === size ? { ...i, quantity: qty } : i))
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => setView('shop')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Continuer mes achats
      </button>
      <h1 className="text-3xl font-black text-white mb-6">MON PANIER</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <ShoppingCart className="size-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-4">Votre panier est vide</p>
          <button onClick={() => setView('shop')} className="px-6 py-3 rounded-full font-bold text-white text-sm" style={{ background: PINK }}>
            Voir la boutique
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={`${item.product.id}-${item.size}`} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <ImageWithFallback src={item.product.image} alt={item.product.name} className="size-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{item.product.name}</p>
                {item.product.player && <p className="text-white/40 text-xs">{item.product.player}</p>}
                <p className="text-white/40 text-xs">Taille: <span className="text-white">{item.size}</span></p>
                <p className="font-black mt-1" style={{ color: PINK }}>{fmtPrice(item.product.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => setCart(prev => prev.filter(i => !(i.product.id === item.product.id && i.size === item.size)))}
                  className="text-white/30 hover:text-red-400 transition-colors"><Trash2 className="size-4" /></button>
                <div className="flex items-center gap-2 bg-black border border-white/10 rounded-lg overflow-hidden">
                  <button onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)} className="px-2 py-1 text-white hover:bg-white/10"><Minus className="size-3" /></button>
                  <span className="text-white text-sm font-bold px-1">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)} className="px-2 py-1 text-white hover:bg-white/10"><Plus className="size-3" /></button>
                </div>
                <p className="text-white/60 text-xs">{fmtPrice(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between mb-2 text-white/50 text-sm">
              <span>Sous-total ({cart.reduce((s,i)=>s+i.quantity,0)} articles)</span>
              <span>{fmtPrice(total)}</span>
            </div>
            <div className="flex justify-between mb-4 text-white/50 text-sm">
              <span>Livraison</span>
              <span className="text-green-400">Gratuite (Bamako)</span>
            </div>
            <div className="flex justify-between font-black text-xl text-white border-t border-white/10 pt-3">
              <span>Total</span>
              <span style={{ color: PINK }}>{fmtPrice(total)}</span>
            </div>
          </div>
          <button onClick={() => setView('checkout')}
            className="w-full py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2" style={{ background: PINK }}>
            Commander — {fmtPrice(total)} <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────

function CheckoutPage({ cart, setCart, setView, setOrders, user }: {
  cart: CartItem[]; setCart: (v: CartItem[]) => void; setView: (v: View) => void
  setOrders: (f: Order[] | ((p: Order[]) => Order[])) => void; user: Customer | null
}) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', region: 'Bamako', city: 'Commune VI', quarter: 'Sénou', notes: '' })
  const [payment, setPayment] = useState<'orange-money' | 'wave' | 'whatsapp'>('whatsapp')
  const [submitted, setSubmitted] = useState(false)
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const total = cart.reduce((s,i) => s + i.product.price * i.quantity, 0)
  const quarters = QUARTERS[form.city] || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const order: Order = {
      id: genId(), orderNumber: genOrderNum(), trackingCode: genTrack(),
      date: now(),
      customer: { name: form.name, phone: form.phone, address: form.address, region: form.region, city: form.city, quarter: form.quarter },
      items: cart, total, payment, status: 'nouvelle', notes: form.notes
    }
    setOrders(prev => [...prev, order])
    setCart([])
    setNewOrder(order)
    setSubmitted(true)
    // WhatsApp message
    const msg = `🛒 *Nouvelle commande Jersey House*\n\n*N° ${order.orderNumber}*\n*Code suivi: ${order.trackingCode}*\n\nClient: ${form.name}\nTél: ${form.phone}\nAdresse: ${form.quarter}, ${form.city}, ${form.region}\n\nArticles:\n${cart.map(i => `• ${i.product.name}${i.product.player ? ` (${i.product.player})` : ''} — Taille ${i.size} × ${i.quantity} = ${fmtPrice(i.product.price * i.quantity)}`).join('\n')}\n\n*Total: ${fmtPrice(total)}*\nPaiement: ${payment === 'orange-money' ? 'Orange Money' : payment === 'wave' ? 'Wave' : 'À confirmer'}`
    window.open(`https://wa.me/22370442282?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (submitted && newOrder) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="size-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `${PINK}20` }}>
        <CheckCircle className="size-10" style={{ color: PINK }} />
      </div>
      <h2 className="text-3xl font-black text-white mb-2">Commande envoyée !</h2>
      <p className="text-white/50 mb-6">Vous allez être redirigé vers WhatsApp pour confirmer votre commande.</p>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-white/50 text-sm">N° commande</span>
          <span className="text-white font-bold">{newOrder.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50 text-sm">Code suivi</span>
          <span className="font-black" style={{ color: PINK }}>{newOrder.trackingCode}</span>
        </div>
      </div>
      <p className="text-white/30 text-xs mb-6">Notez votre code de suivi pour suivre votre commande</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => setView('tracking')} className="w-full py-3 rounded-xl font-bold text-white text-sm border border-white/20 hover:border-white/40 transition-colors">
          Suivre ma commande
        </button>
        <button onClick={() => setView('shop')} className="w-full py-3 rounded-xl font-bold text-white text-sm" style={{ background: PINK }}>
          Retour à la boutique
        </button>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8">
      <button type="button" onClick={() => setView('cart')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Retour au panier
      </button>
      <h1 className="text-3xl font-black text-white mb-6">COMMANDE</h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <p className="text-white font-bold mb-3">Récapitulatif ({cart.length} article{cart.length>1?'s':''})</p>
        {cart.map(i => (
          <div key={`${i.product.id}-${i.size}`} className="flex justify-between text-sm mb-1">
            <span className="text-white/60">{i.product.name} (T.{i.size}) ×{i.quantity}</span>
            <span className="text-white">{fmtPrice(i.product.price * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-black text-white">
          <span>Total</span><span style={{ color: PINK }}>{fmtPrice(total)}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-white font-bold">Vos informations</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-white/40 text-xs block mb-1">Nom complet *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Moussa Koné"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">WhatsApp / Téléphone *</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+223 7X XX XX XX"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-white/40 text-xs block mb-1">Région *</label>
            <select required value={form.region} onChange={e => setForm({...form, region: e.target.value, city: '', quarter: ''})}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
              {MALI_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {form.region === 'Bamako' && (
            <div>
              <label className="text-white/40 text-xs block mb-1">Commune *</label>
              <select value={form.city} onChange={e => setForm({...form, city: e.target.value, quarter: ''})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                {BAMAKO_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {form.city && quarters.length > 0 && (
            <div>
              <label className="text-white/40 text-xs block mb-1">Quartier *</label>
              <select value={form.quarter} onChange={e => setForm({...form, quarter: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                <option value="">Choisir...</option>
                {quarters.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Adresse précise</label>
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Rue, bâtiment, repère..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Notes de livraison</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Instructions particulières..."
            rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50 resize-none" />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-white font-bold mb-3">Mode de paiement</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'orange-money', label: 'Orange Money', color: '#f97316', icon: 'OM' },
            { id: 'wave', label: 'Wave', color: '#0A9EF3', icon: 'W' },
            { id: 'whatsapp', label: 'Via WhatsApp', color: '#25D366', icon: '💬' },
          ].map(pm => (
            <button type="button" key={pm.id} onClick={() => setPayment(pm.id as typeof payment)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${payment === pm.id ? 'border-[#e91e8c] bg-[#e91e8c]/10' : 'border-white/10 hover:border-white/30'}`}>
              <div className="size-9 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0" style={{ background: pm.color }}>
                {pm.icon}
              </div>
              <span className={`text-sm font-bold ${payment === pm.id ? 'text-white' : 'text-white/60'}`}>{pm.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="w-full py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ background: PINK }}>
        <MessageCircle className="size-5" /> Confirmer sur WhatsApp — {fmtPrice(total)}
      </button>
    </form>
  )
}

// ─── ORDER TRACKING ───────────────────────────────────────────────────────────

function TrackingPage({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<Order | null>(null)
  const [searched, setSearched] = useState(false)

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const r = orders.find(o => o.orderNumber === query.trim().toUpperCase() || o.trackingCode === query.trim().toUpperCase())
    setFound(r || null)
    setSearched(true)
  }

  const steps: { key: Order['status']; label: string; icon: React.ReactNode }[] = [
    { key: 'nouvelle', label: 'Commande reçue', icon: <ShoppingBag className="size-4" /> },
    { key: 'confirmee', label: 'Confirmée', icon: <CheckCircle className="size-4" /> },
    { key: 'preparation', label: 'En préparation', icon: <Package className="size-4" /> },
    { key: 'livraison', label: 'En livraison', icon: <Truck className="size-4" /> },
    { key: 'livree', label: 'Livrée ✓', icon: <CheckCircle className="size-4" /> },
  ]
  const statusIndex = found ? steps.findIndex(s => s.key === found.status) : -1

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-white mb-2">SUIVI DE COMMANDE</h1>
        <p className="text-white/40">Entrez votre numéro de commande ou code de suivi</p>
      </div>

      <form onSubmit={search} className="flex gap-3 mb-8">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="JH-XXXXXX ou TRK-XXXXXXXX"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#e91e8c]/50" />
        <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: PINK }}>
          Rechercher
        </button>
      </form>

      {searched && !found && (
        <div className="text-center py-10 bg-white/5 border border-white/10 rounded-2xl">
          <AlertCircle className="size-10 mx-auto mb-3 text-white/20" />
          <p className="text-white/50">Aucune commande trouvée avec ce numéro.</p>
          <p className="text-white/30 text-sm mt-1">Vérifiez votre numéro ou contactez-nous sur WhatsApp.</p>
        </div>
      )}

      {found && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex justify-between items-start flex-wrap gap-3">
            <div>
              <p className="text-white font-black text-lg">{found.orderNumber}</p>
              <p className="text-white/40 text-xs">Code suivi: <span style={{ color: PINK }}>{found.trackingCode}</span></p>
              <p className="text-white/40 text-xs mt-1">{found.date}</p>
            </div>
            <StatusBadge status={found.status} />
          </div>
          <div className="p-5">
            {found.status !== 'annulee' ? (
              <div className="flex items-start gap-0 mb-8 overflow-x-auto pb-2">
                {steps.map((s, i) => {
                  const done = i <= statusIndex
                  const active = i === statusIndex
                  return (
                    <div key={s.key} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div className={`size-9 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'border-[#e91e8c] text-[#e91e8c]' : 'border-white/20 text-white/20'} ${active ? 'shadow-[0_0_15px_rgba(233,30,140,0.5)]' : ''}`}
                          style={done ? { background: `${PINK}20` } : {}}>
                          {s.icon}
                        </div>
                        <p className={`text-xs text-center mt-2 w-16 ${done ? 'text-white' : 'text-white/30'} ${active ? 'font-bold' : ''}`}>{s.label}</p>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`h-0.5 w-8 mx-1 mt-[-14px] ${i < statusIndex ? 'bg-[#e91e8c]' : 'bg-white/10'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
                <XCircle className="size-5 text-red-400" />
                <p className="text-red-300 font-bold">Commande annulée</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/40 mb-1">Client</p>
                <p className="text-white font-bold">{found.customer.name}</p>
                <p className="text-white/50">{found.customer.phone}</p>
              </div>
              <div>
                <p className="text-white/40 mb-1">Adresse</p>
                <p className="text-white">{found.customer.quarter}, {found.customer.city}</p>
                <p className="text-white/50">{found.customer.region}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-white/40 text-sm mb-2">Articles</p>
              {found.items.map(i => (
                <div key={`${i.product.id}-${i.size}`} className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{i.product.name} (T.{i.size}) ×{i.quantity}</span>
                  <span className="text-white">{fmtPrice(i.product.price * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-black mt-2 pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span style={{ color: PINK }}>{fmtPrice(found.total)}</span>
              </div>
            </div>
            {found.notes && (
              <p className="text-white/40 text-xs mt-3">Notes: {found.notes}</p>
            )}
          </div>
          <div className="px-5 pb-5">
            <button onClick={() => window.open(`https://wa.me/22370442282?text=${encodeURIComponent(`Bonjour, je veux des informations sur ma commande ${found.orderNumber}`)}`, '_blank')}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#25D366] hover:bg-[#1da357] flex items-center justify-center gap-2 transition-colors">
              <MessageCircle className="size-4" /> Contacter Jersey House
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function AuthPage({ setUser, setView, customers, setCustomers }: {
  setUser: (u: Customer) => void; setView: (v: View) => void
  customers: Customer[]; setCustomers: (f: Customer[] | ((p: Customer[]) => Customer[])) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (mode === 'login') {
      const u = customers.find(c => c.email === form.email && c.password === form.password)
      if (!u) { setError('Email ou mot de passe incorrect'); return }
      setUser(u); setView('account')
    } else {
      if (customers.find(c => c.email === form.email)) { setError('Email déjà utilisé'); return }
      const u: Customer = { id: genId(), name: form.name, email: form.email, phone: form.phone, password: form.password, favorites: [], orders: [] }
      setCustomers(prev => [...prev, u])
      setUser(u); setView('account')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white text-center mb-2">{mode === 'login' ? 'CONNEXION' : 'INSCRIPTION'}</h1>
      <p className="text-white/40 text-center mb-8">
        {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}{' '}
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: PINK }} className="font-bold">
          {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
        </button>
      </p>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="text-white/40 text-xs block mb-1">Nom complet</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Votre nom"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Téléphone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+223 7X XX XX XX"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
            </div>
          </>
        )}
        <div>
          <label className="text-white/40 text-xs block mb-1">Email</label>
          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="votre@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Mot de passe</label>
          <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button type="submit" className="w-full py-4 rounded-xl font-black text-white text-sm" style={{ background: PINK }}>
          {mode === 'login' ? 'Se connecter' : "Créer mon compte"}
        </button>
      </form>
    </div>
  )
}

// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────

function AccountPage({ user, orders, favorites, products, setView, setSelectedProduct }: {
  user: Customer; orders: Order[]; favorites: number[]; products: Product[]
  setView: (v: View) => void; setSelectedProduct: (p: Product) => void
}) {
  const [tab, setTab] = useState<'orders' | 'favorites' | 'profile'>('orders')
  const myOrders = orders.filter(o => o.customer.phone === user.phone || o.customer.name === user.name)
  const favProducts = products.filter(p => favorites.includes(p.id))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="size-16 rounded-full flex items-center justify-center text-white text-2xl font-black" style={{ background: PINK }}>
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="text-white/40 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-white/10 pb-1">
        {[['orders','Commandes'],['favorites','Favoris'],['profile','Profil']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`px-5 py-2 rounded-t-lg text-sm font-bold transition-colors ${tab === k ? 'text-white border-b-2 border-[#e91e8c]' : 'text-white/40 hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-3">
          {myOrders.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Package className="size-12 mx-auto mb-3 opacity-20" />
              <p>Aucune commande</p>
              <button onClick={() => setView('shop')} className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white" style={{ background: PINK }}>
                Commander
              </button>
            </div>
          ) : myOrders.map(o => (
            <div key={o.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-4 justify-between">
              <div>
                <p className="text-white font-bold">{o.orderNumber}</p>
                <p className="text-white/40 text-xs">{o.date}</p>
                <p className="text-white/40 text-xs mt-1">{o.items.length} article{o.items.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={o.status} />
                <p className="font-black text-sm" style={{ color: PINK }}>{fmtPrice(o.total)}</p>
                <button onClick={() => setView('tracking')} className="text-xs text-white/40 hover:text-white underline">Suivre</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {favProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 text-white/30">
              <Heart className="size-12 mx-auto mb-3 opacity-20" />
              <p>Aucun favori</p>
            </div>
          ) : favProducts.map(p => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#e91e8c]/40 transition-all"
              onClick={() => { setSelectedProduct(p); setView('product') }}>
              <div className="h-36 overflow-hidden">
                <ImageWithFallback src={p.image} alt={p.name} className="size-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-white font-bold text-sm truncate">{p.name}</p>
                <p className="font-black text-sm" style={{ color: PINK }}>{fmtPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm">
          {[['Nom', user.name], ['Email', user.email], ['Téléphone', user.phone || '—']].map(([k,v]) => (
            <div key={k} className="mb-4">
              <p className="text-white/40 text-xs mb-1">{k}</p>
              <p className="text-white font-medium">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────

function AdminLoginPage({ setAdminAuth, setView }: { setAdminAuth: (v: boolean) => void; setView: (v: View) => void }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.email === 'admin@jerseyhouse.ml' && form.password === 'Admin2024') {
      setAdminAuth(true); setView('admin-dashboard')
    } else setError('Identifiants incorrects')
  }
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ImageWithFallback src={logoMain} alt="Jersey House" className="h-14 w-auto object-contain mx-auto mb-4" />
          <p className="text-white/40 text-sm">Espace Administrateur</p>
        </div>
        <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-white/40 text-xs block mb-1">Email admin</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e91e8c]/50" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Mot de passe</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e91e8c]/50" />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl font-black text-white" style={{ background: PINK }}>
            <Shield className="size-4 inline mr-2" />Connexion sécurisée
          </button>
          <p className="text-white/20 text-xs text-center">Accès réservé à l&apos;administrateur Jersey House</p>
        </form>
      </div>
    </div>
  )
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────

function AdminLayout({ view, setView, children, onLogout }: {
  view: View; setView: (v: View) => void; children: React.ReactNode; onLogout: () => void
}) {
  const [sideOpen, setSideOpen] = useState(false)
  const nav = [
    { key: 'admin-dashboard', icon: <LayoutDashboard className="size-4" />, label: 'Dashboard' },
    { key: 'admin-orders', icon: <List className="size-4" />, label: 'Commandes' },
    { key: 'admin-products', icon: <Tag className="size-4" />, label: 'Produits' },
    { key: 'admin-customers', icon: <Users className="size-4" />, label: 'Clients' },
  ]
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-transform duration-200 ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-4 border-b border-white/10">
          <ImageWithFallback src={logoMain} alt="JH" className="h-8 w-auto object-contain" />
          <p className="text-white/30 text-[10px] mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => (
            <button key={n.key} onClick={() => { setView(n.key as View); setSideOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${view === n.key ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              style={view === n.key ? { background: `${PINK}20`, color: PINK } : {}}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut className="size-4" /> Déconnexion
          </button>
          <button onClick={() => setView('home')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors mt-1">
            <Home className="size-4" /> Voir la boutique
          </button>
        </div>
      </aside>
      {sideOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0a0a0a] border-b border-white/10 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSideOpen(true)} className="lg:hidden text-white/50 hover:text-white">
            <Menu className="size-5" />
          </button>
          <span className="text-white/60 text-sm font-medium capitalize">{view.replace('admin-', '')}</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboard({ orders, products, customers }: { orders: Order[]; products: Product[]; customers: Customer[] }) {
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'nouvelle').length,
    confirmed: orders.filter(o => o.status === 'confirmee' || o.status === 'preparation').length,
    inDelivery: orders.filter(o => o.status === 'livraison').length,
    delivered: orders.filter(o => o.status === 'livree').length,
    cancelled: orders.filter(o => o.status === 'annulee').length,
    revenue: orders.filter(o => o.status !== 'annulee').reduce((s,o) => s + o.total, 0),
    totalProducts: products.length,
    totalStock: products.reduce((s,p) => s + p.stock, 0),
    lowStock: products.filter(p => p.stock < 5).length,
    clientCount: new Set(orders.map(o => o.customer.phone)).size,
  }

  const topProducts = products
    .map(p => ({ ...p, sold: p.reviews * 2 }))
    .sort((a,b) => b.sold - a.sold)
    .slice(0, 5)

  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-black text-white">TABLEAU DE BORD</h1>
          <p className="text-white/30 text-xs mt-0.5">Jersey House · {today}</p>
        </div>
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
          <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
          Boutique en ligne
        </span>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Commandes totales', value: stats.total, sub: `${stats.pending} en attente`, icon: <ShoppingBag className="size-5" />, color: '#6366f1' },
          { label: 'Chiffre d\'affaires', value: fmtPrice(stats.revenue), sub: `${stats.delivered} livrées`, icon: <TrendingUp className="size-5" />, color: PINK },
          { label: 'Produits', value: stats.totalProducts, sub: `${stats.totalStock} en stock`, icon: <Tag className="size-5" />, color: '#f59e0b' },
          { label: 'Clients actifs', value: stats.clientCount, sub: 'depuis l\'ouverture', icon: <Users className="size-5" />, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-xs">{s.label}</p>
              <span className="size-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</span>
            </div>
            <p className="text-white font-black text-2xl">{s.value}</p>
            <p className="text-white/30 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'Nouvelles', value: stats.pending, color: '#eab308' },
          { label: 'Confirmées', value: stats.confirmed, color: '#22c55e' },
          { label: 'En livraison', value: stats.inDelivery, color: '#a855f7' },
          { label: 'Livrées', value: stats.delivered, color: '#10b981' },
          { label: 'Annulées', value: stats.cancelled, color: '#ef4444' },
          { label: 'Stock bas', value: stats.lowStock, color: '#f97316' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-bold mb-4">Ventes mensuelles</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="ventes" fill={PINK} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-bold mb-4">Chiffre d&apos;affaires (FCFA)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} formatter={(v: number) => fmtPrice(v)} />
              <Line type="monotone" dataKey="ca" stroke={PINK} strokeWidth={2} dot={{ fill: PINK, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-white font-bold">Produits les plus populaires</p>
          <span className="text-white/30 text-xs">Classés par avis</span>
        </div>
        <div className="divide-y divide-white/5">
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-white/20 font-black text-sm w-4">#{i+1}</span>
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                <img src={p.image} alt={p.name} className="size-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{p.name}</p>
                <p className="text-white/30 text-xs">{p.club} · Stock: {p.stock}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-sm" style={{ color: PINK }}>{fmtPrice(p.price)}</p>
                <p className="text-yellow-400 text-xs">⭐ {p.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <p className="text-white font-bold">Dernières commandes</p>
        </div>
        {orders.length === 0 ? (
          <p className="text-white/30 text-sm text-center p-8">Aucune commande pour l&apos;instant</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs border-b border-white/10">
                  <th className="text-left px-4 py-3">N° Commande</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(o => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white font-bold">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-white/70">{o.customer.name}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: PINK }}>{fmtPrice(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-white/40">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ADMIN ORDERS ─────────────────────────────────────────────────────────────

function AdminOrdersPage({ orders, setOrders }: { orders: Order[]; setOrders: (f: Order[] | ((p: Order[]) => Order[])) => void }) {
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all')
  const [detail, setDetail] = useState<Order | null>(null)

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : null)
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  const allStatuses: Order['status'][] = ['nouvelle', 'confirmee', 'preparation', 'livraison', 'livree', 'annulee']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white">COMMANDES ({orders.length})</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterStatus === 'all' ? 'text-white border-[#e91e8c]' : 'text-white/50 border-white/10'}`}
            style={filterStatus === 'all' ? { background: PINK } : {}}>Toutes</button>
          {allStatuses.slice(0,4).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterStatus === s ? 'text-white border-[#e91e8c]' : 'text-white/50 border-white/10'}`}
              style={filterStatus === s ? { background: PINK } : {}}>
              {STATUS_CONFIG[s].icon}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 bg-white/5 rounded-2xl">Aucune commande</div>
      ) : (
        <div className="space-y-3">
          {filtered.slice().reverse().map(o => (
            <div key={o.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex flex-wrap gap-4 justify-between items-start mb-3">
                <div>
                  <p className="text-white font-black">{o.orderNumber}</p>
                  <p className="text-white/40 text-xs">{o.date} · Code: {o.trackingCode}</p>
                  <p className="text-white/70 text-sm mt-1">{o.customer.name} · {o.customer.phone}</p>
                  <p className="text-white/40 text-xs">{o.customer.quarter}, {o.customer.city}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={o.status} />
                  <p className="font-black" style={{ color: PINK }}>{fmtPrice(o.total)}</p>
                </div>
              </div>

              <div className="text-xs text-white/50 mb-3">
                {o.items.map(i => `${i.product.name} (T.${i.size}) ×${i.quantity}`).join(' · ')}
              </div>

              <div className="flex flex-wrap gap-2 items-center border-t border-white/10 pt-3">
                <p className="text-white/30 text-xs mr-1">Changer statut :</p>
                {allStatuses.map(s => (
                  <button key={s} disabled={o.status === s} onClick={() => updateStatus(o.id, s)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${o.status === s ? 'opacity-50 cursor-default' : 'hover:opacity-80'}`}
                    style={{ background: `${STATUS_CONFIG[s].color.replace('bg-','').includes('yellow') ? '#eab308' : STATUS_CONFIG[s].color.replace('bg-','').includes('green') ? '#22c55e' : STATUS_CONFIG[s].color.replace('bg-','').includes('blue') ? '#3b82f6' : STATUS_CONFIG[s].color.replace('bg-','').includes('purple') ? '#a855f7' : STATUS_CONFIG[s].color.replace('bg-','').includes('emerald') ? '#10b981' : '#ef4444'}20`, color: 'white' }}>
                    {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                  </button>
                ))}
                <button onClick={() => window.open(`https://wa.me/${o.customer.phone.replace(/\s/g,'')}?text=${encodeURIComponent(`Bonjour ${o.customer.name}, votre commande ${o.orderNumber} est maintenant ${STATUS_CONFIG[o.status].label}.`)}`, '_blank')}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors">
                  <MessageCircle className="size-3" /> WA
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ADMIN PRODUCTS ───────────────────────────────────────────────────────────

const ALL_SIZES = ['M', 'L', 'XL', '2XL']

function compressImage(dataUrl: string, maxW = 700, quality = 0.75): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

function AdminProductsPage({ products, setProducts, setView }: {
  products: Product[]
  setProducts: (f: Product[] | ((p: Product[]) => Product[])) => void
  setView: (v: View) => void
}) {
  const [mode, setMode] = useState<'list' | 'form' | 'success'>('list')
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedProduct, setSavedProduct] = useState<Product | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [uploadError, setUploadError] = useState('')

  const emptyForm = (): Product => ({
    id: Date.now(), name: '', club: '', player: '', playerNumber: '',
    country: '', season: '2025/26', description: '', type: 'players',
    price: 8000, sizes: ['M','L','XL','2XL'], stock: 10,
    image: '', isNew: true, isBestSeller: false, rating: 4.5, reviews: 0
  })

  const openNew = () => { setEditing(emptyForm()); setUploadError(''); setMode('form') }
  const openEdit = (p: Product) => { setEditing({ ...p }); setUploadError(''); setMode('form') }
  const del = (id: number) => {
    if (!window.confirm('Supprimer ce maillot définitivement ?')) return
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async ev => {
      const raw = ev.target?.result as string
      const compressed = await compressImage(raw)
      setEditing(prev => prev ? { ...prev, image: compressed } : prev)
    }
    reader.readAsDataURL(file)
  }

  const toggleSize = (s: string) => {
    if (!editing) return
    const sizes = editing.sizes.includes(s) ? editing.sizes.filter(x => x !== s) : [...editing.sizes, s]
    setEditing({ ...editing, sizes })
  }

  const finalName = (e: Product) => {
    if (e.name.trim()) return e.name.trim()
    if (e.type === 'players' && e.player) return `Maillot ${e.club} — ${e.player}`
    return `${e.club} — Sans Joueur`
  }

  const save = () => {
    if (!editing || !editing.club.trim() || saving) return
    setSaving(true)
    const p: Product = {
      ...editing,
      name: finalName(editing),
      price: editing.type === 'players' ? 8000 : 6000,
      image: editing.image || IMGS.hanging,
    }
    try {
      setProducts(prev =>
        prev.find(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]
      )
      setSavedProduct(p)
      setMode('success')
    } catch {
      setUploadError('Erreur de sauvegarde. Essayez une image plus petite.')
    }
    setSaving(false)
  }

  const filtered = products.filter(p =>
    !searchQ || [p.name, p.club, p.player ?? '', p.country].some(s => s.toLowerCase().includes(searchQ.toLowerCase()))
  )

  const totalStock = products.reduce((s,p) => s + p.stock, 0)
  const currentImage = editing?.image || ''

  // ── SUCCESS ──
  if (mode === 'success' && savedProduct) return (
    <div className="max-w-lg mx-auto text-center py-8">
      <div className="size-28 mx-auto rounded-2xl overflow-hidden mb-5 border-2" style={{ borderColor: `${PINK}60` }}>
        <img src={savedProduct.image} alt={savedProduct.name} className="size-full object-cover" />
      </div>
      <div className="text-5xl mb-3">✅</div>
      <h2 className="text-2xl font-black text-white mb-2">Maillot publié !</h2>
      <p className="text-white/50 text-sm mb-1">{savedProduct.name}</p>
      <p className="font-black mb-6" style={{ color: PINK }}>{fmtPrice(savedProduct.price)} · Stock : {savedProduct.stock}</p>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden max-w-xs mx-auto mb-6 text-left">
        <div className="h-48 overflow-hidden bg-white/5">
          <img src={savedProduct.image} alt={savedProduct.name} className="size-full object-cover" />
        </div>
        <div className="p-4">
          <p className="text-white font-bold">{savedProduct.name}</p>
          {savedProduct.player && <p className="text-xs mt-0.5 font-bold" style={{ color: PINK }}>#{savedProduct.playerNumber} {savedProduct.player}</p>}
          <p className="text-white/40 text-xs">{savedProduct.club} · {savedProduct.season}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-black text-lg" style={{ color: PINK }}>{fmtPrice(savedProduct.price)}</span>
            <div className="flex gap-1">{savedProduct.sizes.map(s => <span key={s} className="text-xs border border-white/20 px-1.5 py-0.5 rounded text-white/50">{s}</span>)}</div>
          </div>
          <div className="flex gap-1 mt-2">
            {savedProduct.isNew && <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: PINK }}>NOUVEAU</span>}
            {savedProduct.isBestSeller && <span className="text-[10px] px-2 py-0.5 rounded-full text-black font-bold bg-yellow-400">⭐ TOP</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={() => setView('home')} className="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2" style={{ background: PINK }}>
          🏠 Voir sur la page d&apos;accueil
        </button>
        <button onClick={() => setView('shop')} className="w-full py-3 rounded-xl font-bold text-white border border-white/10 hover:border-white/30 transition-colors">
          🛍️ Voir dans la boutique
        </button>
        <button onClick={() => setMode('list')} className="w-full py-3 rounded-xl font-bold text-white/40 hover:text-white/60 transition-colors text-sm">
          ← Retour aux produits
        </button>
        <button onClick={openNew} className="w-full py-3 rounded-xl font-bold text-white/40 hover:text-white/60 transition-colors text-sm">
          ➕ Ajouter un autre maillot
        </button>
      </div>
    </div>
  )

  // ── FORM ──
  if (mode === 'form' && editing) return (
    <div className="max-w-2xl">
      <button onClick={() => setMode('list')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft className="size-4" /> Retour aux produits
      </button>
      <h2 className="text-2xl font-black text-white mb-6">
        {products.find(p => p.id === editing.id) ? '✏️ Modifier le maillot' : '➕ Ajouter un maillot'}
      </h2>

      <div className="space-y-5">
        {/* Photo Upload */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-bold mb-3">📸 Photo du maillot</p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-40 h-40 rounded-xl overflow-hidden bg-white/5 border-2 flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: currentImage ? `${PINK}60` : 'rgba(255,255,255,0.15)', borderStyle: currentImage ? 'solid' : 'dashed' }}>
              {currentImage ? (
                <img src={currentImage} alt="Photo maillot" className="size-full object-cover" />
              ) : (
                <div className="text-center px-2">
                  <p className="text-4xl mb-2">👕</p>
                  <p className="text-white/30 text-xs">Photo ici</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <label className="block cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed transition-all"
                  style={{ borderColor: `${PINK}50`, background: `${PINK}0a` }}>
                  <span className="text-xl">📂</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: PINK }}>Choisir une photo</p>
                    <p className="text-white/30 text-xs">JPG, PNG, WEBP</p>
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
              {currentImage && (
                <button onClick={() => setEditing({...editing, image: ''})} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">✕ Supprimer la photo</button>
              )}
              <div>
                <label className="text-white/40 text-xs block mb-1">Ou coller une URL</label>
                <input
                  value={currentImage.startsWith('data:') ? '' : currentImage}
                  onChange={e => setEditing({...editing, image: e.target.value})}
                  placeholder="https://exemple.com/maillot.jpg"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Infos principales */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <p className="text-white font-bold mb-1">📋 Informations du maillot</p>

          <div>
            <label className="text-white/40 text-xs block mb-1">Nom personnalisé (optionnel)</label>
            <input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})}
              placeholder="Ex: Maillot Real Madrid Vinicius"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs block mb-1">Club / Équipe *</label>
              <input required value={editing.club} onChange={e => setEditing({...editing, club: e.target.value})}
                placeholder="Ex: Real Madrid"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Pays *</label>
              <input required value={editing.country} onChange={e => setEditing({...editing, country: e.target.value})}
                placeholder="Ex: Espagne"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs block mb-1">Saison *</label>
            <input value={editing.season} onChange={e => setEditing({...editing, season: e.target.value})}
              placeholder="Ex: 2025/26"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
          </div>

          <div>
            <label className="text-white/40 text-xs block mb-1">Catégorie *</label>
            <div className="grid grid-cols-2 gap-3">
              {[['players', '⭐ Players', '8 000 FCFA'], ['no-players', '🏷️ No Players', '6 000 FCFA']].map(([v,l,p]) => (
                <button type="button" key={v} onClick={() => setEditing({...editing, type: v as Product['type'], price: v === 'players' ? 8000 : 6000})}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${editing.type === v ? 'border-[#e91e8c]' : 'border-white/10 hover:border-white/30'}`}
                  style={editing.type === v ? { background: `${PINK}15` } : {}}>
                  <p className={`font-bold text-sm ${editing.type === v ? 'text-white' : 'text-white/50'}`}>{l}</p>
                  <p className="text-xs mt-0.5" style={{ color: editing.type === v ? PINK : undefined }}>{p}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Joueur (si Players) */}
        {editing.type === 'players' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-white font-bold mb-1">👤 Informations joueur</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs block mb-1">Nom du joueur</label>
                <input value={editing.player || ''} onChange={e => setEditing({...editing, player: e.target.value})}
                  placeholder="Ex: Vinicius Jr"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
              </div>
              <div>
                <label className="text-white/40 text-xs block mb-1">Numéro</label>
                <input value={editing.playerNumber || ''} onChange={e => setEditing({...editing, playerNumber: e.target.value})}
                  placeholder="Ex: 7"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50" />
              </div>
            </div>
          </div>
        )}

        {/* Stock + Tailles */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <p className="text-white font-bold">📦 Stock et tailles</p>
          <div>
            <label className="text-white/40 text-xs block mb-2">Tailles disponibles *</label>
            <div className="flex gap-2 flex-wrap">
              {ALL_SIZES.map(s => (
                <button type="button" key={s} onClick={() => toggleSize(s)}
                  className={`w-14 h-10 rounded-xl border-2 font-black text-sm transition-all ${editing.sizes.includes(s) ? 'border-[#e91e8c] text-white' : 'border-white/15 text-white/30 hover:border-white/40'}`}
                  style={editing.sizes.includes(s) ? { background: `${PINK}20` } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Quantité en stock *</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setEditing({...editing, stock: Math.max(0, editing.stock - 1)})}
                className="size-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center">
                <Minus className="size-4" />
              </button>
              <input type="number" min="0" value={editing.stock}
                onChange={e => setEditing({...editing, stock: Math.max(0, Number(e.target.value))})}
                className="w-24 bg-black border border-white/10 rounded-xl px-4 py-2 text-white text-center font-black focus:outline-none focus:border-[#e91e8c]/50" />
              <button type="button" onClick={() => setEditing({...editing, stock: editing.stock + 1})}
                className="size-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center">
                <Plus className="size-4" />
              </button>
              <span className="text-white/30 text-sm">maillots</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-bold mb-3">📝 Description</p>
          <textarea value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})}
            placeholder="Description du maillot, matière, caractéristiques..."
            rows={3} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e91e8c]/50 resize-none" />
        </div>

        {/* Options */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-bold mb-3">⚙️ Options d&apos;affichage</p>
          <div className="flex flex-wrap gap-4">
            {[['isNew','🆕 Marquer comme NOUVEAU'],['isBestSeller','⭐ Marquer comme TOP VENTE']].map(([k,l]) => (
              <label key={k} className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-all relative ${(editing as Record<string,unknown>)[k] ? 'bg-[#e91e8c]' : 'bg-white/10'}`}
                  onClick={() => setEditing({...editing, [k]: !(editing as Record<string,unknown>)[k]})}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${(editing as Record<string,unknown>)[k] ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className="text-white/60 text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Aperçu fiche produit */}
        <div className="border-2 rounded-2xl p-5" style={{ borderColor: `${PINK}35`, background: `${PINK}05` }}>
          <p className="text-white font-bold mb-4">👁️ Aperçu — Fiche produit</p>
          <div className="bg-black/60 rounded-2xl overflow-hidden border border-white/10 max-w-xs">
            <div className="h-52 bg-white/5 flex items-center justify-center overflow-hidden">
              {currentImage ? (
                <img src={currentImage} alt="Maillot" className="size-full object-cover" />
              ) : (
                <div className="text-center">
                  <p className="text-5xl mb-2">👕</p>
                  <p className="text-white/20 text-xs">Photo du maillot</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-white font-bold text-sm">{finalName(editing) || 'Nom du maillot'}</p>
              {editing.player && <p className="text-xs mt-0.5 font-bold" style={{ color: PINK }}>#{editing.playerNumber || '?'} {editing.player}</p>}
              <p className="text-white/40 text-xs mt-0.5">{editing.club || 'Club'} · {editing.country || 'Pays'} · {editing.season}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-black text-lg" style={{ color: PINK }}>{fmtPrice(editing.price)}</span>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {editing.sizes.map(s => <span key={s} className="text-xs border border-white/20 px-1.5 py-0.5 rounded text-white/50">{s}</span>)}
              </div>
              <div className="flex gap-1 mt-2">
                {editing.isNew && <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: PINK }}>NOUVEAU</span>}
                {editing.isBestSeller && <span className="text-[10px] px-2 py-0.5 rounded-full text-black font-bold bg-yellow-400">⭐ TOP</span>}
              </div>
              <p className="text-white/30 text-xs mt-1">📦 Stock : {editing.stock}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <button onClick={() => setMode('list')}
            className="flex-1 py-4 rounded-xl font-bold text-white/60 border border-white/10 hover:border-white/30 transition-colors">
            Annuler
          </button>
          <button onClick={save} disabled={!editing.club.trim() || saving}
            className="flex-1 py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:scale-[1.01]"
            style={{ background: PINK }}>
            {saving ? '⏳ Sauvegarde...' : '✅ Publier le maillot'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── LIST ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">PRODUITS</h1>
          <p className="text-white/40 text-xs mt-0.5">{products.length} maillots · {totalStock} en stock</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg transition-transform hover:scale-105" style={{ background: PINK }}>
          <Plus className="size-4" /> Ajouter un maillot
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total maillots', value: products.length },
          { label: 'Stock total', value: `${totalStock} unités` },
          { label: 'Rupture de stock', value: products.filter(p => p.stock < 3).length, alert: true },
        ].map(s => (
          <div key={s.label} className={`bg-white/5 border rounded-xl p-3 text-center ${s.alert && products.filter(p => p.stock < 3).length > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'}`}>
            <p className={`font-black text-lg ${s.alert && products.filter(p => p.stock < 3).length > 0 ? 'text-red-400' : 'text-white'}`}>{s.value}</p>
            <p className="text-white/30 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Rechercher un maillot..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#e91e8c]/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white/5 border rounded-2xl p-4 flex gap-4 ${p.stock < 3 ? 'border-red-500/30' : 'border-white/10'}`}>
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
              <img src={p.image} alt={p.name} className="size-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <p className="text-white font-bold text-sm flex-1 truncate">{p.name}</p>
                {p.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold flex-shrink-0" style={{ background: PINK }}>NEW</span>}
              </div>
              <p className="text-white/40 text-xs">{p.club} · {p.country} · {p.season}</p>
              {p.player && <p className="text-xs" style={{ color: PINK }}>#{p.playerNumber || '?'} {p.player}</p>}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="font-black text-sm" style={{ color: PINK }}>{fmtPrice(p.price)}</span>
                <span className={`text-xs ${p.stock < 5 ? 'text-red-400' : 'text-white/40'}`}>
                  {p.stock < 3 ? '⚠️' : '📦'} {p.stock} en stock
                </span>
              </div>
              <p className="text-white/20 text-xs mt-0.5">{p.sizes.join(' · ')}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => openEdit(p)} className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors"><Edit className="size-3.5" /></button>
              <button onClick={() => del(p.id)} className="size-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"><Trash className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ADMIN CUSTOMERS ──────────────────────────────────────────────────────────

function AdminCustomersPage({ orders }: { orders: Order[] }) {
  const customerMap = new Map<string, { name: string; phone: string; orders: Order[]; total: number }>()
  orders.forEach(o => {
    const key = o.customer.phone || o.customer.name
    if (!customerMap.has(key)) customerMap.set(key, { name: o.customer.name, phone: o.customer.phone, orders: [], total: 0 })
    const c = customerMap.get(key)!
    c.orders.push(o); c.total += o.total
  })
  const customers = Array.from(customerMap.values()).sort((a,b) => b.total - a.total)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-white">CLIENTS ({customers.length})</h1>
      {customers.length === 0 ? (
        <div className="text-center py-16 text-white/30 bg-white/5 rounded-2xl">Aucun client pour l&apos;instant</div>
      ) : (
        <div className="space-y-3">
          {customers.map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center text-white font-black" style={{ background: PINK }}>
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-white font-bold">{c.name}</p>
                  <p className="text-white/40 text-xs">{c.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-white font-black">{c.orders.length}</p>
                  <p className="text-white/30 text-xs">commande{c.orders.length > 1 ? 's' : ''}</p>
                </div>
                <div className="text-center">
                  <p className="font-black" style={{ color: PINK }}>{fmtPrice(c.total)}</p>
                  <p className="text-white/30 text-xs">total</p>
                </div>
                <button onClick={() => window.open(`https://wa.me/${c.phone.replace(/\s/g,'')}`, '_blank')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors">
                  <MessageCircle className="size-3" /> WA
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>('home')
  const [cart, setCart] = useLocalStorage<CartItem[]>('jh_cart', [])
  const [favorites, setFavorites] = useLocalStorage<number[]>('jh_favorites', [])
  const [user, setUser] = useLocalStorage<Customer | null>('jh_user', null)
  const [adminAuth, setAdminAuth] = useLocalStorage<boolean>('jh_admin', false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Supabase-backed state
  const [products, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS)
  const [orders, setOrdersState] = useState<Order[]>([])
  const [customers, setCustomersState] = useState<Customer[]>([])

  // Load all data from Supabase on mount
  useEffect(() => {
    sbGet<Product[]>('products').then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setProductsState(data)
      } else if (Array.isArray(data) && data.length === 0) {
        // Seed with initial products
        sbPut('products', INITIAL_PRODUCTS).catch(console.error)
      }
    }).catch(console.error)

    sbGet<Order[]>('orders').then(data => {
      if (Array.isArray(data)) setOrdersState(data)
    }).catch(console.error)

    sbGet<Customer[]>('customers').then(data => {
      if (Array.isArray(data)) setCustomersState(data)
    }).catch(console.error)

    // Poll products every 30s so visitors see admin updates in real time
    const poll = () => sbGet<Product[]>('products').then(data => {
      if (Array.isArray(data) && data.length > 0) setProductsState(data)
    }).catch(console.error)
    const interval = setInterval(poll, 30000)
    window.addEventListener('focus', poll)
    return () => { clearInterval(interval); window.removeEventListener('focus', poll) }
  }, [])

  // Synced setters
  const setProducts = useCallback((v: Product[] | ((prev: Product[]) => Product[])) => {
    setProductsState(prev => {
      const next = typeof v === 'function' ? v(prev) : v
      sbPut('products', next).catch(console.error)
      return next
    })
  }, [])

  const setOrders = useCallback((v: Order[] | ((prev: Order[]) => Order[])) => {
    setOrdersState(prev => {
      const next = typeof v === 'function' ? v(prev) : v
      sbPut('orders', next).catch(console.error)
      return next
    })
  }, [])

  const setCustomers = useCallback((v: Customer[] | ((prev: Customer[]) => Customer[])) => {
    setCustomersState(prev => {
      const next = typeof v === 'function' ? v(prev) : v
      sbPut('customers', next).catch(console.error)
      return next
    })
  }, [])

  const cartCount = cart.reduce((s,i) => s + i.quantity, 0)

  const logout = () => { setUser(null); setView('home') }
  const adminLogout = () => { setAdminAuth(false); setView('home') }

  // Admin pages
  if (view === 'admin-login') return <AdminLoginPage setAdminAuth={setAdminAuth} setView={setView} />
  if (['admin-dashboard','admin-orders','admin-products','admin-customers'].includes(view)) {
    if (!adminAuth) { setView('admin-login'); return null }
    return (
      <AdminLayout view={view} setView={setView} onLogout={adminLogout}>
        {view === 'admin-dashboard' && <AdminDashboard orders={orders} products={products} customers={customers} />}
        {view === 'admin-orders' && <AdminOrdersPage orders={orders} setOrders={setOrders} />}
        {view === 'admin-products' && <AdminProductsPage products={products} setProducts={setProducts} setView={setView} />}
        {view === 'admin-customers' && <AdminCustomersPage orders={orders} />}
      </AdminLayout>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar view={view} setView={setView} cartCount={cartCount} user={user} onLogout={logout} favCount={favorites.length} />
      <main className="flex-1">
        {view === 'home' && <HomePage products={products} setView={setView} setSelectedProduct={setSelectedProduct} cart={cart} setCart={setCart} favorites={favorites} setFavorites={setFavorites} />}
        {view === 'shop' && <ShopPage products={products} setView={setView} setSelectedProduct={setSelectedProduct} cart={cart} setCart={setCart} favorites={favorites} setFavorites={setFavorites} />}
        {view === 'product' && selectedProduct && <ProductDetailPage product={selectedProduct} setView={setView} setCart={setCart} favorites={favorites} setFavorites={setFavorites} />}
        {view === 'cart' && <CartPage cart={cart} setCart={setCart} setView={setView} />}
        {view === 'checkout' && <CheckoutPage cart={cart} setCart={setCart} setView={setView} setOrders={setOrders} user={user} />}
        {view === 'tracking' && <TrackingPage orders={orders} />}
        {view === 'auth' && <AuthPage setUser={setUser} setView={setView} customers={customers} setCustomers={setCustomers} />}
        {view === 'account' && user && <AccountPage user={user} orders={orders} favorites={favorites} products={products} setView={setView} setSelectedProduct={setSelectedProduct} />}
        {view === 'account' && !user && <AuthPage setUser={setUser} setView={setView} customers={customers} setCustomers={setCustomers} />}
      </main>
      <Footer setView={setView} />
      {/* Admin access hidden link */}
      <div className="text-center py-2">
        <button onClick={() => setView('admin-login')} className="text-white/10 hover:text-white/20 text-[10px] transition-colors">
          Admin
        </button>
      </div>
    </div>
  )
}
