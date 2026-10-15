import {
  ArrowRight, BarChart3, BookOpen, Brain, Check, ChevronLeft, ChevronRight, FlaskConical, GraduationCap,
  Globe, Hand, LayoutGrid, LineChart, Lightbulb, Monitor, MonitorSmartphone, Languages, Pi, Play, Plus, Search, TrendingUp,
  UserCheck, Users, Shapes, Calendar, MessageCircle, Headset, Mail
} from "lucide-react";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { currentUser, useStore } from "../store";
import { COUNTRIES, Country, countryByCode } from "../curriculum";
import "./landing.css";

/* ---------- Photos Réelles ---------- */
const PHOTOS = {
  hero: "/landing/hero-nuit.webp",
  heroSmall: "/landing/hero-nuit-640.webp",
  avatar: "/landing/hero.jpg",
  girl: "/landing/eleve.jpg",
  t1: "/landing/temoin-1.jpg",
  t2: "/landing/temoin-2.jpg",
  t3: "/landing/temoin-3.jpg",
};

/* ---------- Données Conformes à la Maquette ---------- */
const TESTIMONIALS = [
  {
    name: "Mme ADJIN",
    role: "parent d'élève (3e)",
    photo: PHOTOS.t1,
    text: (
      <>
        Mon fils avait beaucoup de lacunes en maths. En quelques semaines, il a repris confiance et ses notes se sont{" "}
        <strong className="lx-quote-hl">nettement améliorées.</strong>
      </>
    ),
  },
  {
    name: "M. HOUNKPE",
    role: "parent d'élève (2nde)",
    photo: PHOTOS.t2,
    text: (
      <>
        L'interface est très simple et mon fils adore{" "}
        <strong className="lx-quote-hl">les exercices.</strong> Il travaille seul et je vois vraiment{" "}
        <strong className="lx-quote-hl">le progrès.</strong>
      </>
    ),
  },
  {
    name: "Mme TOSSOU",
    role: "parent d'élève (1ère)",
    photo: PHOTOS.t3,
    text: (
      <>
        Les explications sont claires et bien adaptées. Ma fille a retrouvé le{" "}
        <strong className="lx-quote-hl">goût des maths !</strong>
      </>
    ),
  },
];

const FEATURES = [
  { Icon: Calendar, t: "Des bases solides", d: "Revenir sur les fondamentaux pour mieux avancer.", bg: "rgba(255, 201, 51, 0.16)", color: "#ffc933" },
  { Icon: Brain, t: "Un accompagnement IA", d: "Des explications claires, à son rythme.", bg: "rgba(154, 86, 255, 0.2)", color: "#c3a0ff" },
  { Icon: UserCheck, t: "Un suivi parental", d: "Des rapports simples et clairs sur les progrès.", bg: "rgba(0, 245, 212, 0.14)", color: "#4df0d8" },
  { Icon: MonitorSmartphone, t: "Un accès partout", d: "Sur téléphone, tablette et ordinateur.", bg: "rgba(53, 182, 255, 0.18)", color: "#6fcaff" },
];

const SUBJECTS = [
  { Icon: Pi, name: "Mathématiques", pct: 85, icon: "linear-gradient(135deg, #0aa7ff, #35d3ff)", bar: "linear-gradient(90deg, #10c6ff, #35e0ff)" },
  { Icon: Languages, name: "Anglais", pct: 72, icon: "linear-gradient(135deg, #6a5cff, #a35cff)", bar: "linear-gradient(90deg, #10c6ff, #6fb0ff)" },
  { Icon: FlaskConical, name: "Physique-Chimie", pct: 68, icon: "linear-gradient(135deg, #0aa7ff, #1fe0d0)", bar: "linear-gradient(90deg, #10c6ff, #6fb0ff)" },
];

const HERO_FEATURES = [
  { Icon: Monitor, label: "Accessible partout" },
  { Icon: LineChart, label: "Suivi des progrès" },
  { Icon: LayoutGrid, label: "Adapté à chaque niveau" },
];

/* Coordonnées du support : à remplacer par les vraies avant la mise en ligne */
const SUPPORT_EMAIL = "support@declickmath.com";
const SUPPORT_WHATSAPP = ""; // numéro international sans « + » ni espaces, ex. "22501020304"
const SUPPORT_MAIL_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Besoin d'aide sur DeclickMath")}`;
const SUPPORT_WA_URL = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide sur DeclickMath.")}`;

const NAV = [
  { id: "accueil", label: "Accueil" },
  { id: "methode", label: "Méthode" },
  { id: "niveaux", label: "Niveaux" },
  { id: "temoignages", label: "Témoignages" },
  { id: "faq", label: "FAQ" },
  { id: "support", label: "Support" },
];

const LEVELS = [
  {
    theme: "blue",
    badge: "CI – CM2",
    Icon: BookOpen,
    titlePrefix: "Poser les ",
    titleHighlight: "bases",
    subtitle: "Pour bien démarrer en maths et en anglais, avec confiance.",
    features: ["Maths : calcul et numération", "Maths : géométrie simple", "Anglais : vocabulaire et phrases"],
    gradientIcon: "linear-gradient(135deg, #1e88e5 0%, #00d2ff 100%)",
    gradientBtn: "linear-gradient(90deg, #1e88e5 0%, #00d2ff 100%)",
    glowColor: "rgba(0, 210, 255, 0.35)",
    borderColor: "rgba(0, 210, 255, 0.45)",
    highlightColor: "#00d2ff",
    bgShape: "blue",
  },
  {
    theme: "purple",
    badge: "6ème – 3ème",
    Icon: Brain,
    titlePrefix: "Développer les ",
    titleHighlight: "compétences",
    subtitle: "Pour maîtriser les notions clés et passer le BEPC.",
    features: ["Maths : équations, fonctions", "Anglais : grammaire et lecture", "Physique-Chimie dès la 4ème"],
    gradientIcon: "linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)",
    gradientBtn: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
    glowColor: "rgba(168, 85, 247, 0.35)",
    borderColor: "rgba(168, 85, 247, 0.42)",
    highlightColor: "#c084fc",
    bgShape: "purple",
  },
  {
    theme: "teal",
    badge: "2nde – 1ère",
    Icon: Shapes,
    titlePrefix: "Structurer les ",
    titleHighlight: "acquis",
    subtitle: "Pour consolider les bases et préparer le supérieur.",
    features: ["Maths : fonctions, trigonométrie", "Physique-Chimie : mécanique, chimie", "Anglais : expression écrite et orale"],
    gradientIcon: "linear-gradient(135deg, #0284c7 0%, #00f5d4 100%)",
    gradientBtn: "linear-gradient(90deg, #0284c7 0%, #00f5d4 100%)",
    glowColor: "rgba(0, 245, 212, 0.35)",
    borderColor: "rgba(0, 245, 212, 0.45)",
    highlightColor: "#00f5d4",
    bgShape: "teal",
  },
  {
    theme: "pink",
    badge: "Terminale",
    Icon: GraduationCap,
    titlePrefix: "Se préparer aux ",
    titleHighlight: "examens",
    subtitle: "Pour réussir le BAC et viser plus haut.",
    features: ["Maths : analyse, suites, probabilités", "Physique-Chimie : programme du BAC", "Anglais : épreuve du BAC"],
    gradientIcon: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
    gradientBtn: "linear-gradient(90deg, #ec4899 0%, #f43f5e 100%)",
    glowColor: "rgba(244, 63, 94, 0.35)",
    borderColor: "rgba(244, 63, 94, 0.45)",
    highlightColor: "#f43f5e",
    bgShape: "pink",
  },
];

const STEPS = [
  {
    Icon: Search,
    num: "1",
    t: "Diagnostic initial",
    d: "On identifie les lacunes et on définit un parcours personnalisé.",
  },
  {
    Icon: BookOpen,
    num: "2",
    t: "Cours simples",
    d: "Des leçons courtes et illustrées pour bien comprendre.",
  },
  {
    Icon: Brain,
    num: "3",
    t: "Exercices guidés",
    d: "Des exercices adaptés avec corrections détaillées et explications.",
  },
  {
    Icon: LineChart,
    num: "4",
    t: "Suivi des progrès",
    d: "L'élève et ses parents suivent les résultats et les progrès.",
  },
];

const OFFER_BULLETS = [
  "Maths et Anglais du CI à la Terminale",
  "Physique-Chimie de la 4ème à la Terminale",
  "Suivi personnalisé et tableau de bord parent",
  "Accès sur tous les appareils",
  "Support technique et pédagogique",
];

const faqFor = (c: Country) => [
  {
    q: "Mon enfant peut-il commencer même s'il a beaucoup de lacunes ?",
    a: "Oui. Le mini-test de départ repère ce qui manque, puis le parcours reprend les bases avant d'avancer, par petites étapes et sans note.",
  },
  {
    q: "Est-ce que DeclickMath remplace un professeur ?",
    a: "Non. DeclickMath complète le travail en classe : il explique autrement, fait refaire des exercices et montre ce qui reste fragile. Il ne remplace pas un enseignant.",
  },
  {
    q: "Comment fonctionne le suivi parental ?",
    a: "Le parent crée un compte, invite son enfant avec un code et reçoit un résumé simple de la semaine : jours actifs, temps, efforts. Il peut aussi décider si les corrigés sont accessibles.",
  },
  {
    q: "Quels sont les moyens de paiement ?",
    a: c.mobileMoney.length
      ? `Le paiement par mobile money est prévu au lancement en ${c.name} (${c.mobileMoney.join(", ")}), en F CFA (${c.zone}). Les offres et les tarifs définitifs seront annoncés avant l'ouverture des abonnements.`
      : `Le paiement par mobile money sera proposé au lancement en ${c.name}, en F CFA (${c.zone}). Les opérateurs et les tarifs définitifs seront annoncés avant l'ouverture des abonnements.`,
  },
  {
    q: "Est-ce que le contenu est adapté au programme de mon pays ?",
    a: `DeclickMath couvre les 14 pays de la zone FCFA : UEMOA (XOF) et CEMAC (XAF). Pour ${c.name}, les parcours préparent à l'examen de fin de primaire (${c.exams.primaire}), de collège (${c.exams.college}) et de lycée (${c.exams.lycee}). Les contenus sont relus par des enseignants et les programmes de chaque pays sont en cours de validation.`,
  },
];

/* ---------- Pays (zones XOF / XAF) ---------- */
const COUNTRY_KEY = "declickmath-country";
const PRICE: Record<Country["zone"], number> = { XOF: 2500, XAF: 2500 }; // 1 XOF = 1 XAF : parité, prix indicatifs
const TZ_COUNTRY: Record<string, string> = {
  "Africa/Abidjan": "CI", "Africa/Dakar": "SN", "Africa/Bamako": "ML", "Africa/Ouagadougou": "BF", "Africa/Porto-Novo": "BJ",
  "Africa/Lome": "TG", "Africa/Niamey": "NE", "Africa/Bissau": "GW", "Africa/Douala": "CM", "Africa/Libreville": "GA",
  "Africa/Brazzaville": "CG", "Africa/Ndjamena": "TD", "Africa/Bangui": "CF", "Africa/Malabo": "GQ",
};

function initialCountry(): string {
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    if (saved && COUNTRIES.some((c) => c.code === saved)) return saved;
  } catch { /* stockage indisponible */ }
  try {
    const guess = TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone];
    if (guess) return guess;
  } catch { /* fuseau inconnu */ }
  return "CI";
}

/** « le BEPC » / « l'examen de fin de collège » */
const withArticle = (exam: string) => (/^Examen/.test(exam) ? `l'${exam.charAt(0).toLowerCase()}${exam.slice(1)}` : `le ${exam}`);
const fmtPrice = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function CountryPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  return (
    <label className="lx-country">
      <Globe size={18} aria-hidden="true" />
      <span className="lx-sr">Mon pays</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {(["XOF", "XAF"] as const).map((z) => (
          <optgroup key={z} label={z === "XOF" ? "Zone XOF (UEMOA)" : "Zone XAF (CEMAC)"}>
            {COUNTRIES.filter((c) => c.zone === z).map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

/* ---------- Composant Interactif 3D Tilt ---------- */
function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlare((g) => ({ ...g, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`lx-tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform ? "transform 140ms ease-out" : "transform 400ms ease-out",
      }}
    >
      {children}
      <div
        className="lx-tilt-glare"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.35) 0%, transparent 65%)`,
          opacity: glare.opacity,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ---------- Photo avec Repli Automatique ---------- */
function Photo({
  src,
  alt,
  w,
  h,
  className = "",
  children,
  eager,
  srcSet,
  sizes,
}: {
  src: string;
  alt: string;
  w: number;
  h: number;
  className?: string;
  children?: ReactNode;
  eager?: boolean;
  srcSet?: string;
  sizes?: string;
}) {
  const [ok, setOk] = useState(true);
  return (
    <div className={`ph ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
      {ok && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={w}
          height={h}
          fetchPriority={eager ? "high" : undefined}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setOk(false)}
        />
      )}
      {!ok && (
        <div className="ph-fallback" role="img" aria-label={alt}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------- Marque & Logo ---------- */
function Brand({ small }: { small?: boolean }) {
  return (
    <Link to="/" className="lx-brand" aria-label="DeclickMath, accueil">
      <span className="lx-mark">
        <img src="/logo-icon.png" alt="" width="68" height="44" draggable={false} />
      </span>
      <div className="lx-brand-text">
        <b className="lx-brand-title">DeclickMath</b>
        <small className="lx-brand-sub">Apprendre aujourd'hui, réussir demain</small>
      </div>
    </Link>
  );
}

/* ---------- Doodle Rayons Jaunes SVG ---------- */
function DoodleRays({ className = "" }: { className?: string }) {
  return (
    <div className={`lx-doodle-rays ${className}`} aria-hidden="true">
      <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
        <path d="M4 22 L14 14" stroke="#ffc933" strokeWidth="3" strokeLinecap="round" />
        <path d="M17 22 L17 6" stroke="#ffc933" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M30 22 L20 14" stroke="#ffc933" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ---------- Phone Mockup Offre ---------- */
function PhoneOffer() {
  const rows = [
    { label: "Calcul", pct: 85, color: "#ffc933" },
    { label: "Fractions", pct: 60, color: "#10b981" },
    { label: "Géométrie", pct: 45, color: "#6366f1" },
    { label: "Problèmes", pct: 30, color: "#ec4899" },
  ];

  return (
    <div className="lx-offer-phone-container" aria-hidden="true">
      <div className="lx-phone-shell sm">
        <div className="lx-phone-notch sm" />
        <div className="lx-phone-inner">
          <div className="lx-phone-header">
            <div className="lx-phone-logo sm">
              <img src="/logo-icon.png" alt="" width="20" height="13" />
              <span>DeclickMath</span>
            </div>
          </div>

          <div className="lx-pcard sm">
            <div className="lx-pcard-top">
              <small>Mon parcours</small>
            </div>
            <div className="lx-offer-progress-list">
              {rows.map((r) => (
                <div key={r.label} className="lx-op-row">
                  <span className="lx-op-label">{r.label}</span>
                  <div className="lx-op-bar">
                    <span style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lx-offer-devices-badge">
        <MonitorSmartphone size={16} strokeWidth={2.5} />
        <span>Disponible sur téléphone, tablette et ordinateur</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE D'ACCUEIL COMPLÈTE
   ========================================================================== */
export default function Landing() {
  const connected = !!currentUser(useStore());
  const track = useRef<HTMLUListElement>(null);
  const [slide, setSlide] = useState(0);
  const [openAll, setOpenAll] = useState(false);
  const [active, setActive] = useState("accueil");
  const [code, setCode] = useState(initialCountry);
  const country = countryByCode(code);
  const pickCountry = (c: string) => {
    setCode(c);
    try { localStorage.setItem(COUNTRY_KEY, c); } catch { /* ignoré */ }
  };
  const heroBox = useRef<HTMLDivElement>(null);

  // parallaxe douce au pointeur (souris uniquement, désactivée si animations réduites)
  useEffect(() => {
    const el = heroBox.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    const onLeave = () => { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, []);

  const signupUrl = `/commencer?r=parent&p=${country.code}`;
  const studentUrl = `/commencer?p=${country.code}`;

  // Surligne dans le menu la section visible à l'écran
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTestimonials = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("li");
    const shift = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({
      left: dir * shift,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const onTestimonialScroll = () => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("li");
    const shift = (card?.offsetWidth ?? 320) + 20;
    setSlide(Math.min(TESTIMONIALS.length - 1, Math.max(0, Math.round(el.scrollLeft / shift))));
  };

  return (
    <div className="lx">
      <a className="lx-skip" href="#contenu">
        Aller au contenu
      </a>

      {/* 1. HEADER / NAVBAR */}
      <header className="lx-nav">
        <div className="lx-wrap lx-nav-in">
          <Brand />

          <nav aria-label="Menu principal" className="lx-links">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className={active === n.id ? "lx-nav-link active" : "lx-nav-link"} aria-current={active === n.id ? "true" : undefined}>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="lx-nav-cta">
            <CountryPicker value={code} onChange={pickCountry} />
            {connected ? (
              <Link className="lx-btn yellow sm font-bold" to="/">Mon espace</Link>
            ) : (
              <>
                <Link className="lx-btn ghost-nav sm" to="/commencer?c=login">
                  Se connecter
                </Link>
                <Link className="lx-btn yellow sm font-bold" to={signupUrl}>
                  Commencer maintenant
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* 2. HERO — la promesse */}
        <section id="accueil" className="lx-hero" aria-labelledby="h-hero">
          <div className="lx-math-layer" aria-hidden="true">
            <span className="lx-math-sym m1">π</span>
            <span className="lx-math-sym m2">∑</span>
            <span className="lx-math-sym m3">√x</span>
            <span className="lx-math-sym m4">x²</span>
            <span className="lx-math-sym m5">∆</span>
            <div className="lx-mesh-glow glow-1" />
            <div className="lx-mesh-glow glow-2" />
          </div>

          <div className="lx-wrap lx-hero-in">
            <div className="lx-hero-copy">
              <p className="lx-badge-capsule">
                <GraduationCap size={26} strokeWidth={1.8} aria-hidden="true" />
                <b>Du CI à la Terminale</b>
                <i className="lx-capsule-dot" aria-hidden="true" />
                <span>Pensé pour les élèves francophones</span>
              </p>

              <h1 id="h-hero">
                Aidez votre enfant à reprendre confiance en <span className="lx-grad-text">mathématiques</span>
              </h1>

              <p className="lx-hero-text">
                DeclickMath est une plateforme d'apprentissage intelligente qui accompagne votre enfant, même s'il part de zéro. Des explications simples, des exercices adaptés et un suivi personnalisé pour progresser pas à pas.
              </p>

              <div className="lx-hero-cta-box">
                <Link className="lx-btn yellow lx-hero-btn" to={signupUrl}>
                  <span>Commencer maintenant</span>
                  <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
                </Link>
                <a className="lx-demo-link" href="#methode">
                  <span className="lx-demo-play"><Play size={20} aria-hidden="true" /></span>
                  <span>Voir la démo</span>
                </a>
              </div>

              <ul className="lx-hero-trust">
                {HERO_FEATURES.map(({ Icon, label }) => (
                  <li key={label}>
                    <span className="lx-trust-round"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lx-hero-visual">
              <div className="lx-hero-photo-box" ref={heroBox}>
                <span className="lx-hero-aura" aria-hidden="true" />
                <Photo
                  src={PHOTOS.hero}
                  srcSet={`${PHOTOS.heroSmall} 640w, ${PHOTOS.hero} 1145w`}
                  sizes="(min-width: 992px) 46vw, 92vw"
                  alt="Un élève rayonnant montre sa copie de mathématiques notée 20 sur 20"
                  w={1145}
                  h={1374}
                  className="lx-hero-photo-img"
                  eager
                >
                  <Users size={96} />
                </Photo>
                <div className="lx-float-chip lx-glass">
                  <span className="ic"><TrendingUp size={20} aria-hidden="true" /></span>
                  <span>Plus de confiance<br />chaque jour</span>
                </div>
                <div className="lx-float-prog lx-glass" aria-hidden="true">
                  <div className="lx-float-prog-row">
                    <span className="ic"><BarChart3 size={24} /></span>
                    <div><small>Progression</small><b>78%</b></div>
                  </div>
                  <div className="lx-subj-bar"><span style={{ width: "78%", background: "linear-gradient(90deg, #10c6ff, #6a5cff)" }} /></div>
                </div>
              </div>

              <div className="lx-dash lx-glass" aria-hidden="true">
                <div className="lx-dash-head">
                  <span className="lx-dash-brand">
                    <span className="lx-dash-bulb"><Lightbulb size={18} /></span>
                    DeclickMath
                  </span>
                  <img className="lx-dash-avatar" src={PHOTOS.avatar} alt="" />
                </div>
                <p className="lx-dash-hello">Bonjour ! <Hand size={20} /></p>
                <p className="lx-dash-sub">On continue ensemble !</p>
                <ul className="lx-subj-list">
                  {SUBJECTS.map(({ Icon, name, pct, icon, bar }) => (
                    <li key={name} className="lx-subj">
                      <span className="lx-subj-ic" style={{ background: icon }}><Icon size={22} /></span>
                      <span className="lx-subj-body">
                        {name}
                        <span className="lx-subj-bar"><span style={{ width: `${pct}%`, background: bar }} /></span>
                      </span>
                      <span className="lx-subj-pct">{pct}%</span>
                      <ChevronRight size={16} />
                    </li>
                  ))}
                </ul>
                <div className="lx-dash-cta">
                  <span className="l"><span className="ic"><LineChart size={20} /></span>Voir mon parcours</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. SECTION : POURQUOI (rassurer) CHOISIR DECLICKMATH ? (Clair)
        ======================================================== */}
        <section className="lx-section lx-light" aria-labelledby="h-sol">
          <div className="lx-wrap lx-two lx-sol-layout">
            <div className="lx-stack">
              <p className="lx-eyebrow purple">POURQUOI CHOISIR DECLICKMATH ?</p>
              <h2 id="h-sol">
                Une solution <span className="lx-grad-text">complète</span>, pensée pour les parents et leurs enfants
              </h2>
              <p className="lx-soft">
                DeclickMath ne se contente pas de donner des cours. Nous aidons chaque élève à construire des bases solides, à corriger ses erreurs et à progresser durablement, avec un accompagnement bienveillant et structuré.
              </p>
              <div className="lx-cta-wrap">
                <a className="lx-btn yellow font-bold" href="#methode">
                  <span>Découvrir la méthode</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </a>
              </div>
            </div>

            <ul className="lx-feats-grid">
              {FEATURES.map(({ Icon, t, d, bg, color }) => (
                <li key={t}>
                  <TiltCard maxTilt={8} scale={1.03} className="lx-feat-card">
                    <div className="lx-feat-icon-box" style={{ background: bg, color }}>
                      <Icon size={26} strokeWidth={2.2} />
                    </div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </TiltCard>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ========================================================
            5. SECTION : NOTRE MÉTHODE (Clair)
        ======================================================== */}
        <section id="methode" className="lx-section lx-light" aria-labelledby="h-met">
          <div className="lx-wrap lx-stack" style={{ gap: 40 }}>
            <div className="lx-stack">
              <p className="lx-eyebrow purple">NOTRE MÉTHODE</p>
              <h2 id="h-met">
                Apprendre autrement, <span className="lx-grad-text">étape par étape</span>
              </h2>
              <p className="lx-soft lx-desc-wide">
                Une approche simple et efficace, basée sur la pratique, l'explication et la répétition intelligente.
              </p>
              <div>
                <Link className="lx-btn yellow font-bold" to={studentUrl}>
                  <span>Essayer le mini-test gratuit</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            <ol className="lx-steps-flow">
              {STEPS.map(({ Icon, num, t, d }, idx) => (
                <li key={t} className="lx-step-item">
                  <div className="lx-step-card">
                    <div className="lx-step-header">
                      <span className="lx-step-circle-num">{num}</span>
                      <span className="lx-step-circle-icon">
                        <Icon size={20} strokeWidth={2.4} />
                      </span>
                    </div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="lx-step-arrow-connector" aria-hidden="true">
                      <ArrowRight size={20} strokeWidth={2.5} />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ========================================================
            4. SECTION : LES NIVEAUX SCOLAIRES (Sombre)
        ======================================================== */}
        <section id="niveaux" className="lx-section lx-dark" aria-labelledby="h-niv">
          <div className="lx-wrap lx-stack" style={{ gap: 36 }}>
            <div className="lx-stack">
              <p className="lx-eyebrow purple-light">LES NIVEAUX SCOLAIRES</p>
              <h2 id="h-niv">Du CI à la Terminale, un parcours <span className="lx-grad-text">adapté</span> à chaque élève</h2>
              <p className="lx-exam-line">
                <span>Examens en {country.name} ({country.zone}) :</span>
                {[country.exams.primaire, country.exams.college, country.exams.lycee].map((e) => <b key={e}>{e}</b>)}
              </p>
              <p className="lx-soft lx-desc-wide">
                Maths et Anglais du CI à la Terminale, Physique-Chimie de la 4ème à la Terminale. Commencez par le niveau de votre enfant. Il pourra ensuite progresser vers les niveaux supérieurs, sans pression.
              </p>
            </div>

            <ul className="lx-levels-grid">
              {LEVELS.map((lvl) => {
                const {
                  theme,
                  badge,
                  Icon,
                  titlePrefix,
                  titleHighlight,
                  subtitle: defaultSubtitle,
                  features,
                  gradientIcon,
                  gradientBtn,
                  glowColor,
                  highlightColor,
                } = lvl;
                const sub: Record<string, string> = {
                  blue: `Pour bien démarrer en maths et en anglais, jusqu'au ${country.exams.primaire}.`,
                  purple: `Pour maîtriser les notions clés et réussir ${withArticle(country.exams.college)}.`,
                  pink: `Pour réussir ${withArticle(country.exams.lycee)} et viser plus haut.`,
                };
                const subtitle = sub[theme] ?? defaultSubtitle;
                return (
                  <li key={badge}>
                    <TiltCard
                      maxTilt={10}
                      scale={1.03}
                      className={`lx-level-card-exact lx-level-card-${theme}`}
                    >
                      {/* Ambient shape in background */}
                      <div className={`lx-level-bg-orb orb-${theme}`} aria-hidden="true" />

                      {/* Header with Icon and Badge */}
                      <div className="lx-level-card-header">
                        <div
                          className="lx-level-squircle-icon"
                          style={{ background: gradientIcon }}
                        >
                          <Icon size={26} strokeWidth={2.4} color="#ffffff" />
                        </div>
                        <span className={`lx-level-badge-pill pill-${theme}`}>{badge}</span>
                      </div>

                      {/* Title with Highlighted Word */}
                      <h3 className="lx-level-title-clean">
                        {titlePrefix}
                        <span style={{ color: highlightColor }}>{titleHighlight}</span>
                      </h3>

                      {/* Subtitle */}
                      <p className="lx-level-subtitle-clean">{subtitle}</p>

                      {/* Checklist */}
                      <ul className="lx-level-items-clean">
                        {features.map((item) => (
                          <li key={item}>
                            <span
                              className="lx-level-check-circle"
                              style={{ background: gradientIcon }}
                            >
                              <Check size={13} strokeWidth={3.5} color="#ffffff" />
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Gradient Action Button */}
                      <Link
                        className="lx-level-action-btn"
                        style={{
                          background: gradientBtn,
                          boxShadow: `0 8px 24px ${glowColor}`,
                        }}
                        to={studentUrl}
                        aria-label={`Voir le programme ${badge}`}
                      >
                        <span>Voir le programme</span>
                        <ArrowRight size={17} strokeWidth={2.5} />
                      </Link>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ========================================================
            6. SECTION : TÉMOIGNAGES (Sombre)
        ======================================================== */}
        <section id="temoignages" className="lx-section lx-dark lx-section-testimonials" aria-labelledby="h-tem">
          <div className="lx-wrap lx-two lx-tem-layout">
            <div className="lx-stack">
              <div className="lx-badge-capsule-blue">TÉMOIGNAGES</div>
              <h2 id="h-tem" className="lx-h2-testimonials">
                Des familles qui voient<br />la <span className="lx-title-blue-glow">différence</span>
              </h2>
              <p className="lx-soft">
                Des parents partagent leurs expériences et les progrès de leurs enfants avec DeclickMath.
              </p>

              <div className="lx-car-ctrl" role="group" aria-label="Parcourir les témoignages">
                <button
                  type="button"
                  className="lx-round-btn lx-btn-tem-nav"
                  aria-label="Témoignage précédent"
                  onClick={() => scrollTestimonials(-1)}
                >
                  <ChevronLeft size={22} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  className="lx-round-btn lx-btn-tem-nav"
                  aria-label="Témoignage suivant"
                  onClick={() => scrollTestimonials(1)}
                >
                  <ChevronRight size={22} strokeWidth={2.5} />
                </button>
                <div className="lx-dots-blue" aria-hidden="true">
                  {TESTIMONIALS.map((_, i) => (
                    <span key={i} className={`lx-dot-pip-blue ${i === slide ? "active" : ""}`} />
                  ))}
                </div>
              </div>
            </div>

            <ul
              className="lx-testimonials-track"
              ref={track}
              onScroll={onTestimonialScroll}
              aria-label="Témoignages de parents"
              tabIndex={0}
            >
              {TESTIMONIALS.map((t) => (
                <li key={t.name} className="lx-testimonial-item">
                  <TiltCard maxTilt={8} scale={1.02} className="lx-testimonial-card-exact">
                    <div className="lx-testimonial-avatar-center">
                      <div className="lx-avatar-ring">
                        <Photo src={t.photo} alt={t.name} w={84} h={84} className="lx-avatar-img-round">
                          <span>{t.name.split(" ").pop()?.[0]}</span>
                        </Photo>
                      </div>
                    </div>

                    <div className="lx-quote-mark-blue" aria-hidden="true">
                      <svg width="22" height="18" viewBox="0 0 24 20" fill="currentColor">
                        <path d="M9.6 0C5.1 2.3 2.2 6.5 2 11.8c.2.4.6.6 1.2.6 1.9 0 3.8 1.4 3.8 3.8 0 2.4-1.8 3.8-3.8 3.8C1.4 20 0 18.5 0 16 0 9.8 4 3.6 9.6 0zm14.4 0c-4.5 2.3-7.4 6.5-7.6 11.8.2.4.6.6 1.2.6 1.9 0 3.8 1.4 3.8 3.8 0 2.4-1.8 3.8-3.8 3.8-1.8 0-3.2-1.5-3.2-4 0-6.2 4-12.4 9.6-16z"/>
                      </svg>
                    </div>

                    <blockquote className="lx-quote-text-clean">{t.text}</blockquote>

                    <div className="lx-card-blue-bar" />

                    <div className="lx-card-author-clean">
                      <b className="lx-author-name">— {t.name},</b>
                      <span className="lx-author-grade">{t.role}</span>
                    </div>
                  </TiltCard>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ========================================================
            7. SECTION : OFFRE DE LANCEMENT (3D)
        ======================================================== */}
        <section className="lx-section lx-offer" aria-labelledby="h-offer">
          <div className="lx-wrap lx-offer-outer">
            {/* Côté Gauche : Photo de l'élève & Doodle */}
            <div className="lx-offer-left-box">
              <Photo
                src={PHOTOS.girl}
                alt="Une élève concentrée prend des notes devant son ordinateur"
                w={560}
                h={420}
                className="lx-girl-photo-box"
              >
                <GraduationCap size={80} />
              </Photo>

              <div className="lx-offer-doodle-container" aria-hidden="true">
                <DoodleRays className="rays-doodle-left" />
                <p className="lx-offer-handwritten">
                  Un pas aujourd'hui,<br />une grande différence<br />demain !
                </p>
                <DoodleRays className="rays-doodle-right" />
              </div>
            </div>

            {/* Côté Droit : Carte d'Offre avec Contenu & Smartphone */}
            <div className="lx-offer-card-main">
              <div className="lx-offer-card-content">
                <span className="lx-offer-pill-badge">OFFRE DE LANCEMENT</span>
                <h2 id="h-offer" className="lx-offer-title">
                  Accès complet <span className="lx-grad-text">DeclickMath</span>
                </h2>
                <p className="lx-soft lx-offer-subtitle">
                  Tout ce dont votre enfant a besoin pour progresser sereinement.
                </p>

                <div className="lx-price-line">
                  <span className="lx-price-start">À partir de</span>
                  <b className="lx-price-figure">{fmtPrice(PRICE[country.zone])} F CFA</b>
                  <span className="lx-price-cycle">/ mois ({country.zone})</span>
                </div>
                <small className="lx-soft lx-price-disclaimer">
                  (prix indicatif, à valider après les tests)
                </small>

                <ul className="lx-offer-checklist">
                  {[...OFFER_BULLETS, country.mobileMoney.length ? `Paiement mobile money : ${country.mobileMoney.join(", ")}` : "Paiement mobile money (opérateurs à annoncer)"].map((item) => (
                    <li key={item}>
                      <span className="lx-check-badge">
                        <Check size={13} strokeWidth={3.5} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="lx-offer-btn-wrap">
                  <Link className="lx-btn yellow font-bold" to={signupUrl}>
                    <span>Commencer maintenant</span>
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>

              {/* Smartphone à droite dans la carte */}
              <div className="lx-offer-card-phone">
                <PhoneOffer />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            8. SECTION : FAQ (Accordéon)
        ======================================================== */}
        <section id="faq" className="lx-section lx-dark lx-faq-section" aria-labelledby="h-faq">
          <div className="lx-wrap lx-two lx-faq-layout">
            <div className="lx-stack">
              <p className="lx-eyebrow purple-light">FAQ</p>
              <h2 id="h-faq">Vos questions, nos <span className="lx-grad-text">réponses</span></h2>
              <p className="lx-soft">
                Nous avons rassemblé ici les questions les plus fréquentes pour vous aider à mieux comprendre DeclickMath.
              </p>
              <div>
                <button
                  type="button"
                  className="lx-btn yellow sm font-bold"
                  onClick={() => setOpenAll((v) => !v)}
                  aria-pressed={openAll}
                >
                  <span>{openAll ? "Réduire les questions" : "Voir toutes les questions"}</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="lx-accordion">
              {faqFor(country).map((f) => (
                <details key={f.q + openAll} open={openAll || undefined} className="lx-acc-item">
                  <summary className="lx-acc-summary">
                    <span className="lx-acc-q">{f.q}</span>
                    <span className="lx-acc-icon">
                      <Plus size={18} strokeWidth={2.5} />
                    </span>
                  </summary>
                  <div className="lx-acc-content">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* SUPPORT — contacter l'équipe */}
        <section id="support" className="lx-section lx-support" aria-labelledby="h-support">
          <div className="lx-wrap">
            <div className="lx-support-card">
              <span className="lx-support-ic" aria-hidden="true"><Headset size={34} strokeWidth={2} /></span>
              <div className="lx-support-copy">
                <p className="lx-eyebrow purple-light">BESOIN D'AIDE ?</p>
                <h2 id="h-support">Une question, un souci ? <span className="lx-grad-text">Contactez-nous</span></h2>
                <p>
                  Notre équipe répond aux parents et aux élèves : compte, paiement, accès aux cours ou question pédagogique.
                  Écrivez-nous ou cliquez sur le bouton Support, nous revenons vers vous rapidement.
                </p>
              </div>
              <div className="lx-support-actions">
                {SUPPORT_WHATSAPP && (
                  <a className="lx-btn yellow font-bold" href={SUPPORT_WA_URL} target="_blank" rel="noreferrer">
                    <Headset size={18} strokeWidth={2.5} aria-hidden="true" />
                    <span>Contacter le support</span>
                  </a>
                )}
                <a className={SUPPORT_WHATSAPP ? "lx-btn ghost-nav" : "lx-btn yellow font-bold"} href={SUPPORT_MAIL_URL}>
                  <Mail size={18} strokeWidth={2.5} aria-hidden="true" />
                  <span>Nous contacter</span>
                </a>
                <small className="lx-support-mail">{SUPPORT_EMAIL}</small>
              </div>
            </div>
          </div>
        </section>

        {/* 9. APPEL FINAL — ferme la boucle ouverte par le hero */}
        <section className="lx-final" aria-labelledby="h-final">
          <div className="lx-wrap">
            <div className="lx-final-card">
              <div>
                <h2 id="h-final">Prêt à aider votre enfant à <span className="lx-grad-text">reprendre confiance</span> ?</h2>
                <p>Créez votre espace parent en deux minutes. Sans engagement, et votre enfant peut commencer tout de suite.</p>
              </div>
              <div className="lx-final-actions">
                <Link className="lx-btn yellow lx-hero-btn" to={signupUrl}>
                  <span>Créer mon espace parent</span>
                  <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
                </Link>
                <Link className="lx-btn ghost-nav" to="/commencer?c=login">Se connecter</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          9. FOOTER
      ======================================================== */}
      <footer className="lx-foot">
        <div className="lx-wrap lx-foot-in">
          <Brand small />

          <nav aria-label="Pied de page" className="lx-foot-nav">
            <a href="#accueil">Accueil</a>
            <a href="#methode">Méthode</a>
            <a href="#niveaux">Niveaux</a>
            <a href="#temoignages">Témoignages</a>
            <a href="#faq">FAQ</a>
            <a href="#support">Support</a>
          </nav>

          <div className="lx-foot-right">
            <div className="lx-social-row">
              <a
                href="https://facebook.com"
                aria-label="Facebook DeclickMath"
                target="_blank"
                rel="noreferrer"
                className="lx-social-circle"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://wa.me/"
                aria-label="WhatsApp DeclickMath"
                target="_blank"
                rel="noreferrer"
                className="lx-social-circle"
              >
                <MessageCircle size={18} strokeWidth={2.2} />
              </a>

              <a
                href="https://tiktok.com"
                aria-label="TikTok DeclickMath"
                target="_blank"
                rel="noreferrer"
                className="lx-social-circle"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>

            <small className="lx-foot-copy">
              © 2025 DeclickMath. Tous droits réservés.
            </small>
          </div>
        </div>
      </footer>

      {/* Bouton Support flottant */}
      <a
        className="lx-support-fab"
        href={SUPPORT_WHATSAPP ? SUPPORT_WA_URL : "#support"}
        {...(SUPPORT_WHATSAPP ? { target: "_blank", rel: "noreferrer" } : {})}
        aria-label="Contacter le support"
      >
        <Headset size={20} strokeWidth={2.4} aria-hidden="true" />
        <span>Support</span>
      </a>
    </div>
  );
}
