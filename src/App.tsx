import { useEffect, useSyncExternalStore } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminNav, BottomNav, TopBar } from "./components/ui";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ChildLogin from "./pages/ChildLogin";
import StudentActivation from "./pages/StudentActivation";
import ResetPassword from "./pages/ResetPassword";
import { recoveryActive, subscribeRecovery } from "./lib/authRemote";
import Landing from "./pages/Landing";
import Catalogue from "./pages/Catalogue";
import Check from "./pages/Check";
import { ExamRunPage, ExamStart } from "./pages/ExamPage";
import Home from "./pages/Home";
import NotionPage from "./pages/NotionPage";
import ParentChild from "./pages/ParentChild";
import ParentHome from "./pages/ParentHome";
import OnboardStudent from "./pages/OnboardStudent";
import Placement from "./pages/Placement";
import Probleme from "./pages/Probleme";
import Methodes from "./pages/Methodes";
import Revision from "./pages/Revision";
import Etapes, { EtapesList } from "./pages/Etapes";
import Erreurs from "./pages/Erreurs";
import Tuteur from "./pages/Tuteur";
import Jeux, { JeuxHub } from "./pages/Jeux";
import Bilan from "./pages/Bilan";
import Parcours from "./pages/Parcours";
import Situations from "./pages/Situations";
import Simulation from "./pages/Simulation";
import Scanner from "./pages/Scanner";
import Profile from "./pages/Profile";
import Proprietes from "./pages/Proprietes";
import Verbes from "./pages/Verbes";
import Progress from "./pages/Progress";
import Session from "./pages/Session";
import Sujet, { SujetParent } from "./pages/Sujet";
import { stopPreview } from "./adminActions";
import { currentUser, DEFAULT_PREFS, restoreParentSession, THEMES, themeOf, useStore } from "./store";

const TABS = ["/", "/exercices", "/tuteur", "/methodes", "/progres", "/profil"];

function AppInner() {
  const state = useStore();
  const user = currentUser(state);
  const { pathname } = useLocation();
  const recovering = useSyncExternalStore(subscribeRecovery, recoveryActive);
  const prefs = { ...DEFAULT_PREFS, ...user?.prefs };

  // préférences d'affichage : thème (sinon système), police adaptée, animations réduites
  useEffect(() => {
    const el = document.documentElement;
    const th = THEMES.find((t) => t.id === themeOf(prefs))!;
    el.dataset.theme = th.dark ? "dark" : "light"; // la base (sombre ou clair) ; la palette ajoute la couleur
    if (th.id === "ocean" || th.id === "soleil") el.dataset.palette = th.id; else el.removeAttribute("data-palette");
    if (prefs.dyslexia) el.dataset.font = "dyslexia"; else el.removeAttribute("data-font");
    if (prefs.reduceMotion) el.dataset.motion = "reduce"; else el.removeAttribute("data-motion");
  }, [prefs.theme, prefs.dark, prefs.dyslexia, prefs.reduceMotion]);

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (recovering) return <ResetPassword />; // lien « mot de passe oublié » : on choisit le nouveau mot de passe avant tout
  if (pathname === "/activation" || pathname === "/connexion-qr") return <StudentActivation />;
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/activation" element={<StudentActivation />} />
        <Route path="/connexion-qr" element={<StudentActivation />} />
        <Route path="/connexion-eleve" element={<ChildLogin />} />
        <Route path="/connexion-parent" element={<Auth defaultWho="parent" />} />
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }
  if (pathname === "/accueil") return <Landing />; // la page d'accueil reste visitable une fois connecté (logo DeclickMath)
  if (user.role === "admin") {
    return (
      <>
        {["/", "/exercices"].includes(pathname) && <TopBar name={user.name} sub={pathname === "/" ? "Vue d'ensemble de toutes les classes." : "Tous les cours, classe par classe."} />}
        <Routes>
          <Route path="/" element={<Admin />} />
          <Route path="/exercices" element={<Catalogue />} />
          <Route path="/notion/:id" element={<NotionPage />} />
          <Route path="/serie/:id" element={<Session />} />
          <Route path="/controle/:id" element={<Check />} />
          <Route path="/enfant/:id" element={<ParentChild tab="accueil" />} />
          <Route path="/enfant/:id/exercices" element={<ParentChild tab="exercices" />} />
          <Route path="/enfant/:id/progres" element={<ParentChild tab="progres" />} />
          <Route path="/enfant/:id/reponses" element={<ParentChild tab="reponses" />} />
        <Route path="/enfant/:id/sujets" element={<ParentChild tab="sujets" />} />
        <Route path="/enfant/:id/sujet/:paperId" element={<SujetParent />} />
          <Route path="/enfant/:id/profil" element={<ParentChild tab="profil" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {["/", "/exercices"].includes(pathname) && <AdminNav />}
      </>
    );
  }
  if (user.role === "parent") return (
      <Routes>
        <Route path="/enfant/:id" element={<ParentChild tab="accueil" />} />
        <Route path="/enfant/:id/exercices" element={<ParentChild tab="exercices" />} />
        <Route path="/enfant/:id/progres" element={<ParentChild tab="progres" />} />
        <Route path="/enfant/:id/reponses" element={<ParentChild tab="reponses" />} />
        <Route path="/enfant/:id/sujets" element={<ParentChild tab="sujets" />} />
        <Route path="/enfant/:id/sujet/:paperId" element={<SujetParent />} />
        <Route path="/enfant/:id/profil" element={<ParentChild tab="profil" />} />
        <Route path="*" element={<ParentHome />} />
      </Routes>
    );

  // premier passage : onboarding conversationnel
  if (!user.placed && pathname !== "/onboard" && pathname !== "/positionnement") return <Navigate to="/onboard" replace />;

    const SUBS: Record<string, string> = {
    "/": "Content de te revoir. On continue ?", "/exercices": "Parfait pour continuer ton apprentissage !",
    "/tuteur": "Pose une question ou envoie une capture de ton exercice : je t'aide à trouver la réponse.", "/methodes": "Dix façons d'apprendre, pour comprendre et retenir longtemps.", "/progres": "Voici un aperçu de tes progrès. Tu es sur la bonne voie !", "/profil": "Tes réglages et ton objectif du jour.",
  };
    const hasParentReturn = typeof window !== "undefined" && !!sessionStorage.getItem("declickmath_parent_return_id");
  return (
    <>
      {hasParentReturn && (
        <div style={{ background: "#713cff", color: "#ffffff", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 9999, fontSize: "0.88rem", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
          <span>👀 <b>Aperçu en direct :</b> Vous testez actuellement la session de <b>{user.name}</b>. Les accès et cours fonctionnent parfaitement.</span>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              restoreParentSession();
              window.location.href = "/";
            }}
            style={{ background: "#ffc63d", color: "#1c1545", border: "none", fontWeight: 700, padding: "4px 12px", cursor: "pointer" }}
          >
            Revenir à l'espace parent ↩
          </button>
        </div>
      )}
      {TABS.includes(pathname) && <TopBar name={user.name} sub={SUBS[pathname]} profileTo="/profil" />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboard" element={<OnboardStudent />} />
        <Route path="/exercices" element={<Catalogue />} />
        <Route path="/progres" element={<Progress />} />
        <Route path="/methodes" element={<Methodes />} />
        <Route path="/rappel" element={<Revision mode="rappel" />} />
        <Route path="/cartes" element={<Revision mode="cartes" />} />
        <Route path="/revision" element={<Revision mode="revision" />} />
        <Route path="/etapes" element={<EtapesList />} />
        <Route path="/etapes/:id" element={<Etapes />} />
        <Route path="/erreurs" element={<Erreurs />} />
        <Route path="/tuteur" element={<Tuteur />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/jeux" element={<JeuxHub />} />
        <Route path="/jeux/:game" element={<Jeux />} />
        <Route path="/bilan" element={<Bilan />} />
        <Route path="/parcours" element={<Parcours />} />
        <Route path="/situations" element={<Situations />} />
        <Route path="/simulation/:id" element={<Simulation />} />
        <Route path="/profil" element={<Profile />} />
      <Route path="/positionnement" element={<Placement />} />
        <Route path="/proprietes" element={<Proprietes />} />
        <Route path="/verbes" element={<Verbes />} />
        <Route path="/sujet/notion/:id" element={<Sujet mode="notion" />} />
        <Route path="/sujet/examen/:subject/:kind" element={<Sujet mode="examen" />} />
        <Route path="/notion/:id" element={<NotionPage />} />
        <Route path="/serie/:id" element={<Session />} />
        <Route path="/probleme/:id" element={<Probleme />} />
        <Route path="/controle/:id" element={<Check />} />
        <Route path="/epreuve/resultat/:id" element={<ExamRunPage />} />
        <Route path="/epreuve/:subject/:kind" element={<ExamStart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {TABS.includes(pathname) && <BottomNav />}
    </>
  );
}








/** Application + bandeau d'aperçu quand un administrateur voit l'écran d'un élève ou d'un parent. */
export default function App() {
  const state = useStore();
  const user = currentUser(state);
  const preview = !!state.previewBackup;
  return (
    <>
      {preview && user && (
        <div className="readonly-banner preview-banner" role="status">
          <span>👁 Aperçu : vous voyez l'écran de <b>{user.name}</b> ({user.role === "parent" ? "parent" : "élève"}). Rien de ce que vous faites ici n'est enregistré.</span>
          <button type="button" className="btn primary small-btn" onClick={stopPreview}>Retour à l'administration</button>
        </div>
      )}
      <AppInner />
    </>
  );
}
