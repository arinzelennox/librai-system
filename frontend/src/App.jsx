import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API_URL = "https://librai-backend.onrender.com/api";

// ─── EMAIL CONFIRMATION HANDLER ───────────────────────────────────────────────
function ConfirmEmailHandler() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const T = getTheme(true);

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/confirm/${token}`);
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("librai_token", data.token);
          setStatus("success");
          setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };
    confirm();
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: 40 }}>
        {status === "loading" && (
          <>
            <div style={{ width: 64, height: 64, border: "4px solid #c4652a", borderTop: "4px solid transparent", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ color: T.text }}>Confirming your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
            <h2 style={{ color: T.text, marginBottom: 12 }}>Email Confirmed!</h2>
            <p style={{ color: T.textMuted }}>Your account is now active. Redirecting you to sign in...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 60, marginBottom: 20 }}>❌</div>
            <h2 style={{ color: T.text, marginBottom: 12 }}>Confirmation Failed</h2>
            <p style={{ color: T.textMuted, marginBottom: 24 }}>The link may have expired. Please register again.</p>
            <button onClick={() => navigate("/")} style={{ background: "#c4652a", border: "none", borderRadius: 10, padding: "12px 28px", color: "#fff", fontSize: 15, cursor: "pointer" }}>Go Back Home</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP WRAPPER WITH ROUTER ─────────────────────────────────────────────
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/confirm-email/:token" element={<ConfirmEmailHandler />} />
        <Route path="*" element={<LibrAISystem />} />
      </Routes>
    </BrowserRouter>
  );
}

const api = {
  post: async (endpoint, data, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  get: async (endpoint, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return res.json();
  },
};

// ─── LC CLASSIFICATION SYSTEM ────────────────────────────────────────────────
const LC_CLASSES = [
  { code: "A", label: "General Works", color: "#6366f1" },
  { code: "B", label: "Philosophy · Psychology · Religion", color: "#8b5cf6" },
  { code: "C", label: "Auxiliary Sciences of History", color: "#a78bfa" },
  { code: "D", label: "World History · Europe · Asia · Africa", color: "#c4652a" },
  { code: "E", label: "History of the Americas", color: "#d97706" },
  { code: "F", label: "History of the Americas (Local)", color: "#f59e0b" },
  { code: "G", label: "Geography · Anthropology · Recreation", color: "#10b981" },
  { code: "H", label: "Social Sciences", color: "#059669" },
  { code: "J", label: "Political Science", color: "#0891b2" },
  { code: "K", label: "Law", color: "#0284c7" },
  { code: "L", label: "Education", color: "#2563eb" },
  { code: "M", label: "Music & Books on Music", color: "#7c3aed" },
  { code: "N", label: "Fine Arts", color: "#db2777" },
  { code: "P", label: "Language & Literature", color: "#e11d48" },
  { code: "Q", label: "Science", color: "#16a34a" },
  { code: "R", label: "Medicine", color: "#dc2626" },
  { code: "S", label: "Agriculture", color: "#65a30d" },
  { code: "T", label: "Technology", color: "#0369a1" },
  { code: "U", label: "Military Science", color: "#92400e" },
  { code: "V", label: "Naval Science", color: "#1e3a5f" },
  { code: "Z", label: "Bibliography · Library Science · Info Resources", color: "#c4652a" },
];

// ─── DDC CLASSIFICATION SYSTEM ───────────────────────────────────────────────
const DDC_CLASSES = [
  { code: "000", label: "Computer Science, Info & General Works", color: "#6366f1" },
  { code: "100", label: "Philosophy & Psychology", color: "#8b5cf6" },
  { code: "200", label: "Religion", color: "#a78bfa" },
  { code: "300", label: "Social Sciences", color: "#0891b2" },
  { code: "400", label: "Language", color: "#10b981" },
  { code: "500", label: "Pure Science", color: "#16a34a" },
  { code: "600", label: "Technology (Applied Sciences)", color: "#0369a1" },
  { code: "700", label: "The Arts", color: "#db2777" },
  { code: "800", label: "Literature & Rhetoric", color: "#e11d48" },
  { code: "900", label: "History, Geography & Biography", color: "#c4652a" },
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const BOOKS = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", year: 1958, subject: "African Literature", ddc: "800", ddc_full: "823.914", lc: "P", lc_full: "PR9387.9.A3", cover: "📗", tags: ["Nigeria","colonialism","culture"], views: 842, available: true, description: "A novel about the Igbo community in pre-colonial Nigeria and the arrival of European missionaries." },
  { id: 2, title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", year: 2006, subject: "Historical Fiction", ddc: "800", ddc_full: "823.92", lc: "P", lc_full: "PR9387.9.A3234", cover: "📘", tags: ["Nigeria","Biafra","war"], views: 634, available: true, description: "Set before and during the Nigerian Civil War, exploring love, loss, and identity." },
  { id: 3, title: "Digital Archives: Theory and Practice", author: "Margaret Hedstrom", year: 2019, subject: "Library Science", ddc: "000", ddc_full: "025.04", lc: "Z", lc_full: "Z678.93", cover: "📙", tags: ["archives","digital","preservation"], views: 412, available: false, description: "A comprehensive guide to building and managing digital archives in the modern era." },
  { id: 4, title: "Artificial Intelligence in Libraries", author: "Stuart Weibel", year: 2022, subject: "Information Science", ddc: "000", ddc_full: "025.0028", lc: "Z", lc_full: "Z678.9", cover: "📕", tags: ["AI","libraries","cataloguing"], views: 567, available: true, description: "Explores the transformative impact of AI on library and information management systems." },
  { id: 5, title: "The Famished Road", author: "Ben Okri", year: 1991, subject: "Nigerian Literature", ddc: "800", ddc_full: "823.914", lc: "P", lc_full: "PR9387.9.O37", cover: "📗", tags: ["Nigeria","mythology","spirit"], views: 389, available: true, description: "A magical realist novel following Azaro, a spirit child in post-independence Nigeria." },
  { id: 6, title: "Introduction to Information Retrieval", author: "Manning, Raghavan, Schütze", year: 2008, subject: "Computer Science", ddc: "000", ddc_full: "025.524", lc: "Z", lc_full: "Z667", cover: "📘", tags: ["IR","NLP","search"], views: 721, available: true, description: "Foundational textbook covering modern information retrieval techniques and algorithms." },
  { id: 7, title: "Records Management in Africa", author: "Shadrack Katuu", year: 2020, subject: "Archives", ddc: "000", ddc_full: "651.5096", lc: "Z", lc_full: "CD1003", cover: "📙", tags: ["Africa","records","archives"], views: 298, available: true, description: "Explores records management practices across African government and academic institutions." },
  { id: 8, title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", year: 2003, subject: "Nigerian Literature", ddc: "800", ddc_full: "823.92", lc: "P", lc_full: "PR9387.9.A3234", cover: "📕", tags: ["Nigeria","family","religion"], views: 503, available: false, description: "A coming-of-age story set in post-colonial Nigeria, exploring family, faith, and freedom." },
  { id: 9, title: "Knowledge Management Systems", author: "Carl Frappaolo", year: 2006, subject: "Information Science", ddc: "300", ddc_full: "658.4038", lc: "H", lc_full: "HD30.2", cover: "📗", tags: ["knowledge","systems","management"], views: 334, available: true, description: "Practical frameworks for designing and implementing knowledge management in organizations." },
  { id: 10, title: "Digital Humanities", author: "Anne Burdick et al.", year: 2012, subject: "Humanities", ddc: "000", ddc_full: "001.3", lc: "A", lc_full: "AZ105", cover: "📘", tags: ["digital","humanities","research"], views: 445, available: true, description: "An exploration of how digital tools are transforming humanities research and scholarship." },
  { id: 11, title: "Open Access", author: "Peter Suber", year: 2012, subject: "Library Science", ddc: "000", ddc_full: "070.5797", lc: "Z", lc_full: "Z286.O63", cover: "📕", tags: ["open access","publishing","research"], views: 387, available: true, description: "A comprehensive overview of the open-access movement in scholarly communication." },
  { id: 12, title: "African Archaeology", author: "David Phillipson", year: 2005, subject: "History", ddc: "900", ddc_full: "960.1", lc: "D", lc_full: "GN861", cover: "📙", tags: ["Africa","archaeology","history"], views: 256, available: true, description: "A survey of Africa's archaeological record from the earliest times to the recent past." },
  { id: 13, title: "Principles of Political Science", author: "Robert Dahl", year: 1998, subject: "Political Science", ddc: "300", ddc_full: "320.01", lc: "J", lc_full: "JA66", cover: "📘", tags: ["politics","government","democracy"], views: 312, available: true, description: "A foundational text on political systems, governance, and democratic theory." },
  { id: 14, title: "Introduction to Law", author: "William Twining", year: 2009, subject: "Law", ddc: "300", ddc_full: "340.1", lc: "K", lc_full: "K230", cover: "📕", tags: ["law","jurisprudence","legal theory"], views: 289, available: true, description: "An accessible introduction to legal systems and jurisprudence across cultures." },
  { id: 15, title: "Medical Microbiology", author: "Patrick Murray", year: 2020, subject: "Medicine", ddc: "600", ddc_full: "616.01", lc: "R", lc_full: "QR46", cover: "📗", tags: ["medicine","microbiology","health"], views: 534, available: false, description: "Comprehensive coverage of pathogenic microorganisms and their role in human disease." },
  { id: 16, title: "Soil Science Fundamentals", author: "Nyle Brady", year: 2016, subject: "Agriculture", ddc: "600", ddc_full: "631.4", lc: "S", lc_full: "S591", cover: "📙", tags: ["agriculture","soil","farming"], views: 178, available: true, description: "The nature and properties of soils — a comprehensive agricultural reference." },
];

const ARCHIVES = [
  { id: 1, title: "1963 Nigerian Constitution", type: "Legal Document", date: "1963-10-01", size: "2.4 MB", format: "PDF", keywords: ["constitution","Nigeria","1963","independence"], status: "approved", lc: "K", ddc: "300", text: "Federal Republic of Nigeria Constitutional Act establishing the sovereign state..." },
  { id: 2, title: "University of Lagos Founding Charter", type: "Institutional", date: "1962-07-01", size: "1.1 MB", format: "PDF", keywords: ["UNILAG","charter","1962","education"], status: "approved", lc: "L", ddc: "300", text: "The University of Lagos Act establishing the institution and its governing council..." },
  { id: 3, title: "National Archives Digitization Report 2022", type: "Report", date: "2022-03-15", size: "4.7 MB", format: "PDF", keywords: ["digitization","archives","2022","Nigeria"], status: "approved", lc: "Z", ddc: "000", text: "Report on the status of national archives digitization across federal repositories..." },
  { id: 4, title: "Oral History: Lagos Market Women 1980s", type: "Oral History", date: "1985-06-20", size: "890 KB", format: "PDF", keywords: ["oral history","Lagos","women","trade"], status: "pending", lc: "H", ddc: "300", text: "Transcripts of interviews with Lagos market women on economic conditions..." },
  { id: 5, title: "Biafran War Photographs Collection", type: "Photograph", date: "1967-09-01", size: "12.3 MB", format: "Images", keywords: ["Biafra","war","photographs","1967"], status: "approved", lc: "D", ddc: "900", text: "A digitized collection of photographs from the Nigerian Civil War period..." },
];

const USERS = [
  { id: 1, name: "Arinze Nwosu", email: "arinze@library.ng", role: "user", joined: "2024-01", reads: 23, saved: 7, confirmed: true },
  { id: 2, name: "Admin User", email: "admin@library.ng", role: "admin", joined: "2023-06", reads: 0, saved: 0, confirmed: true },
  { id: 3, name: "Fatima Aliyu", email: "fatima@abu.edu.ng", role: "user", joined: "2024-03", reads: 41, saved: 12, confirmed: true },
  { id: 4, name: "Emeka Osei", email: "emeka@unn.edu.ng", role: "user", joined: "2024-05", reads: 15, saved: 4, confirmed: true },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    library: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    archive: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    ai: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    analytics: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    admin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    moon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    bookmark: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    tag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  };
  return icons[name] || null;
};

// ─── THEME ────────────────────────────────────────────────────────────────────
const getTheme = (dark) => ({
  bg: dark ? "#0a0e17" : "#f5f3ee",
  bgCard: dark ? "#111827" : "#ffffff",
  bgSecondary: dark ? "#1a2332" : "#ede9e0",
  bgTertiary: dark ? "#1e2d3d" : "#e2ddd5",
  border: dark ? "#1e2d3d" : "#d4cfc6",
  text: dark ? "#e8eaf0" : "#1a1a1a",
  textMuted: dark ? "#7a8599" : "#5a5a5a",
  textDim: dark ? "#3d4a5c" : "#9a9a9a",
  accent: "#c4652a",
  accentLight: dark ? "#c4652a20" : "#c4652a12",
  green: "#2ea043",
  greenLight: dark ? "#2ea04320" : "#2ea04312",
  blue: "#1f6feb",
  blueLight: dark ? "#1f6feb20" : "#1f6feb12",
  yellow: "#d29922",
  yellowLight: dark ? "#d2992220" : "#d2992212",
  red: "#da3633",
  shadow: dark ? "0 4px 32px rgba(0,0,0,0.5)" : "0 4px 32px rgba(0,0,0,0.1)",
});

// ─── AI ASSISTANT — SMART MOCK RESPONSES ────────────────────────────────────
const MOCK_RESPONSES = {
  ddc: (q) => `**DDC (Dewey Decimal Classification)** organizes knowledge into 10 main classes:\n\n• **000** – Computer Science & General Works\n• **100** – Philosophy & Psychology\n• **200** – Religion\n• **300** – Social Sciences\n• **400** – Language\n• **500** – Pure Science\n• **600** – Technology\n• **700** – The Arts\n• **800** – Literature & Rhetoric\n• **900** – History, Geography & Biography\n\nEach class divides further — e.g., DDC 823 = English fiction. Is there a specific DDC class you'd like to explore?`,
  lc: (q) => `**LC (Library of Congress Classification)** uses letter codes:\n\n• **A** – General Works\n• **B** – Philosophy, Psychology, Religion\n• **D** – World History\n• **H** – Social Sciences\n• **K** – Law\n• **L** – Education\n• **P** – Language & Literature\n• **Q** – Science\n• **R** – Medicine\n• **Z** – Library Science\n\nUse the Browse by Class filter in the Library to explore books by LC class.`,
  nigeria: () => `Our collection has **47 resources** on Nigerian history and literature:\n\n**Top recommendations:**\n• *Things Fall Apart* — Achebe (DDC 823.914, LC P)\n• *Half of a Yellow Sun* — Adichie (DDC 823.92, LC P)\n• *The Famished Road* — Ben Okri (DDC 823.914, LC P)\n• *1963 Nigerian Constitution* — Archive (LC K)\n\nWould you like me to filter by a specific period or topic?`,
  cite: (q) => `Here are citation formats for your source:\n\n**APA:** Author, A. (Year). *Title of work*. Publisher.\n\n**MLA:** Author, First. *Title of Work*. Publisher, Year.\n\n**Chicago:** Author First Last. *Title of Work*. City: Publisher, Year.\n\nFor a specific book, tell me the title and author and I'll generate the exact citation.`,
  recommend: () => `**Based on popular reads in our collection:**\n\n• *Digital Archives: Theory and Practice* — Hedstrom (DDC 025.04)\n• *AI in Libraries* — Weibel (DDC 025.0028)\n• *Records Management in Africa* — Katuu (DDC 651.5096)\n• *Introduction to Information Retrieval* — Manning (DDC 025.524)\n\nAll available for borrowing. Would you like details on any of these?`,
  default: (q) => `I found relevant resources matching **"${q}"** in the LibrAI catalog.\n\nBased on DDC/LC classification, this topic falls under related subject headings. You can:\n\n• Use the **Library** page to search and filter by classification\n• Browse by **LC Class** or **DDC Class** using the classification browser\n• Ask me more specifically — e.g., "books on Nigerian law" or "cite this paper"\n\nHow can I help further?`,
};

const getMockResponse = (msg) => {
  const q = msg.toLowerCase();
  if (q.includes("ddc") || q.includes("dewey")) return MOCK_RESPONSES.ddc(q);
  if (q.includes("lc") || q.includes("library of congress") || q.includes("class ")) return MOCK_RESPONSES.lc(q);
  if (q.includes("nigeria") || q.includes("african")) return MOCK_RESPONSES.nigeria();
  if (q.includes("cite") || q.includes("citation") || q.includes("reference") || q.includes("apa") || q.includes("mla")) return MOCK_RESPONSES.cite(q);
  if (q.includes("recommend") || q.includes("suggest")) return MOCK_RESPONSES.recommend();
  return MOCK_RESPONSES.default(msg);
};

// ─── AI ASSISTANT CALL — REAL CLAUDE API ────────────────────────────────────
const LIBRAI_SYSTEM_PROMPT = `You are LibrAI Assistant, an expert AI for the LibrAI Smart Library and Digital Archive Management System.
You help users find books, navigate archives, generate citations (APA, MLA, Chicago), suggest research topics,
summarize documents, and answer questions about library science including DDC (Dewey Decimal Classification) and
LC (Library of Congress Classification) systems.
Be helpful, concise, and knowledgeable. Format responses clearly with markdown when helpful.
The library specializes in African literature, Nigerian history, library science, and information management.`;

const callRealAI = async (messages) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: LIBRAI_SYSTEM_PROMPT,
        messages,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.[0]?.text || "No response received.";
  } catch (err) {
    throw err;
  }
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function LibrAISystem() {
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [page, setPage] = useState("landing");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [savedBooks, setSavedBooks] = useState([3, 6]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState(USERS);
  const [pendingEmail, setPendingEmail] = useState("");
  const T = getTheme(dark);

  const isAdmin = currentUser?.role === "admin";
  const nav = (p) => { setPage(p); setShowBookModal(false); };
  const openBook = (book) => { setSelectedBook(book); setShowBookModal(true); };
  const toggleSave = (id) => setSavedBooks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (page === "landing") return <LandingPage T={T} dark={dark} setDark={setDark} nav={nav} />;
  if (page === "auth") return <AuthPage T={T} dark={dark} setDark={setDark} nav={nav} setCurrentUser={setCurrentUser} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} setPendingEmail={setPendingEmail} />;
  if (page === "confirm-email") return <ConfirmEmailPage T={T} nav={nav} pendingEmail={pendingEmail} />;
  if (!currentUser) { nav("auth"); return null; }

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, fontFamily: "'Georgia', 'Times New Roman', serif", overflow: "hidden" }}>
      <Sidebar T={T} page={page} nav={nav} open={sidebarOpen} isAdmin={isAdmin} currentUser={currentUser} onLogout={() => { setCurrentUser(null); nav("landing"); }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar T={T} dark={dark} setDark={setDark} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentUser={currentUser} notifications={notifications} page={page} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {page === "dashboard" && <DashboardPage T={T} currentUser={currentUser} savedBooks={savedBooks} nav={nav} openBook={openBook} isAdmin={isAdmin} />}
          {page === "library" && <LibraryPage T={T} searchQuery={searchQuery} setSearchQuery={setSearchQuery} savedBooks={savedBooks} toggleSave={toggleSave} openBook={openBook} />}
          {page === "archives" && <ArchivesPage T={T} />}
          {page === "assistant" && <AssistantPage T={T} currentUser={currentUser} />}
          {page === "analytics" && <AnalyticsPage T={T} />}
          {page === "admin" && isAdmin && <AdminPage T={T} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} />}
          {page === "profile" && <ProfilePage T={T} currentUser={currentUser} savedBooks={savedBooks} />}
        </main>
      </div>
      {showBookModal && selectedBook && <BookModal T={T} book={selectedBook} onClose={() => setShowBookModal(false)} savedBooks={savedBooks} toggleSave={toggleSave} />}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ T, dark, setDark, nav }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const fn = () => setScrolled(el.scrollTop > 40);
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon: "ai", title: "AI Smart Assistant", desc: "Real Claude AI integration — ask about books, archives, research topics using natural language. Get DDC/LC classification guidance, citations, and summaries." },
    { icon: "library", title: "Smart OPAC Catalog", desc: "AI-powered search with full LC and DDC classification browsing, recommendations, auto-tagging, and real-time availability." },
    { icon: "archive", title: "Digital Archive Management", desc: "Upload, OCR, and auto-generate metadata for scanned documents. Full-text search across your entire archive collection." },
    { icon: "analytics", title: "Analytics & Insights", desc: "Understand collection gaps, user behavior, trending topics, and AI-powered acquisition recommendations." },
    { icon: "search", title: "AI Research Tools", desc: "Citation generation (APA/MLA/Chicago), document summarization, research topic suggestions, and plagiarism detection." },
    { icon: "admin", title: "Role-Based Access", desc: "Separate admin and user dashboards with full user management, document approval workflows, and audit trails." },
  ];

  return (
    <div id="landing-scroll" style={{ height: "100vh", overflowY: "auto", background: dark ? "#0a0e17" : "#f5f3ee", color: dark ? "#e8eaf0" : "#1a1a1a", fontFamily: "'Georgia', serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: scrolled ? (dark ? "rgba(10,14,23,0.96)" : "rgba(245,243,238,0.96)") : "transparent", backdropFilter: "blur(12px)", borderBottom: scrolled ? `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}` : "none", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>L</div>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>LibrAI <span style={{ color: "#c4652a" }}>System</span></span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}`, borderRadius: 8, padding: "7px 10px", color: dark ? "#7a8599" : "#5a5a5a", cursor: "pointer" }}><Icon name={dark ? "sun" : "moon"} size={16} /></button>
          <button onClick={() => nav("auth")} style={{ background: "none", border: `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}`, borderRadius: 8, padding: "8px 20px", color: dark ? "#e8eaf0" : "#1a1a1a", cursor: "pointer", fontSize: 14 }}>Sign In</button>
          <button onClick={() => nav("auth")} style={{ background: "#c4652a", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Get Started</button>
        </div>
      </nav>

      <section style={{ padding: "80px 48px 60px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dark ? "#c4652a18" : "#c4652a10", border: `1px solid ${dark ? "#c4652a40" : "#c4652a30"}`, borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#c4652a", marginBottom: 28, fontFamily: "'Courier New', monospace" }}>
          ✦ AI-Powered · Real Claude AI · For Universities & National Archives
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 24 }}>
          The Intelligent Library<br /><span style={{ color: "#c4652a" }}>Built for Africa</span> & Beyond
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.7, color: dark ? "#7a8599" : "#5a5a5a", maxWidth: 620, margin: "0 auto 40px" }}>
          LibrAI System unifies cataloguing with full LC & DDC classification, digital archives, real Claude AI reference assistance, and analytics — designed for universities and national archives.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => nav("auth")} style={{ background: "#c4652a", border: "none", borderRadius: 10, padding: "14px 32px", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Launch Demo →</button>
          <button style={{ background: "none", border: `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}`, borderRadius: 10, padding: "14px 32px", color: dark ? "#e8eaf0" : "#1a1a1a", fontSize: 16, cursor: "pointer" }}>View Documentation</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 64, padding: "32px", background: dark ? "#111827" : "#fff", borderRadius: 16, border: `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}` }}>
          {[["12,000+","Books Catalogued"],["21 LC Classes","Full Classification"],["10 DDC Classes","Decimal System"],["40+ Institutions","Across Africa"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#c4652a" }}>{n}</div>
              <div style={{ fontSize: 12, color: dark ? "#7a8599" : "#5a5a5a", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px" }}>Everything Your Library Needs</h2>
          <p style={{ color: dark ? "#7a8599" : "#5a5a5a", marginTop: 12, fontSize: 16 }}>One platform. Every workflow. Powered by real AI.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: dark ? "#111827" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}`, borderRadius: 14, padding: "28px 24px", transition: "transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(196,101,42,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 44, height: 44, background: "#c4652a20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#c4652a", marginBottom: 16 }}>
                <Icon name={f.icon} size={22} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: dark ? "#7a8599" : "#5a5a5a", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 48px", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg, #c4652a, #8b3a1a)", borderRadius: 20, padding: "60px 40px", maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Ready to Transform Your Library?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>Join institutions across Nigeria and Africa using LibrAI to modernize their knowledge infrastructure.</p>
          <button onClick={() => nav("auth")} style={{ background: "#fff", border: "none", borderRadius: 10, padding: "14px 36px", color: "#c4652a", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Start Free Demo →</button>
        </div>
      </section>
      <footer style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${dark ? "#1e2d3d" : "#d4cfc6"}`, color: dark ? "#3d4a5c" : "#9a9a9a", fontSize: 13 }}>
        © 2025 LibrAI System · Built for Libraries & Archives · Powered by Claude AI
      </footer>
    </div>
  );
}

// ─── WEB3FORMS CONFIG ─────────────────────────────────────────────────────────
const WEB3FORMS_ACCESS_KEY = "93ccd46f-1e1b-49d0-a59f-2b915c2fc440";

const sendConfirmationEmail = async (toEmail, toName) => {
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        to: toEmail,
        subject: "Confirm your LibrAI Account",
        from_name: "LibrAI System",
        message: `Hello ${toName},

Welcome to LibrAI System — the AI-powered Smart Library platform!

Your account has been created successfully. Please click the link below to confirm your email address and activate your account:

${window.location.origin}

Login credentials:
• Email: ${toEmail}
• Password: (the one you chose during registration)

This confirmation is valid for 24 hours.

If you did not create this account, please ignore this email.

— The LibrAI Team
librai.ng | Smart Library System`,
      }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true };
    } else {
      throw new Error(data.message || "Failed to send email");
    }
  } catch (err) {
    console.warn("Web3Forms error:", err.message);
    return { success: false, error: err.message };
  }
};

// ─── CONFIRM EMAIL PAGE ───────────────────────────────────────────────────────
function ConfirmEmailPage({ T, nav, pendingEmail }) {
  const [confirmed, setConfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await sendConfirmationEmail(pendingEmail, "Library Member");
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
      <div style={{ textAlign: "center", maxWidth: 500, padding: 40 }}>
        <div style={{ width: 80, height: 80, background: confirmed ? T.greenLight : T.accentLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: `2px solid ${confirmed ? T.green : "#c4652a"}` }}>
          <Icon name={confirmed ? "check" : "mail"} size={36} />
        </div>
        {!confirmed ? (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 12 }}>Check Your Email</h2>
            <p style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
              A confirmation link has been sent to:
            </p>
            <p style={{ color: "#c4652a", fontSize: 16, fontWeight: 600, marginBottom: 24 }}>{pendingEmail || "your email address"}</p>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>What to expect:</p>
              <ul style={{ fontSize: 13, color: T.textMuted, paddingLeft: 20, lineHeight: 2 }}>
                <li>Email from <strong style={{ color: T.text }}>noreply@librai.ng</strong></li>
                <li>Subject: <strong style={{ color: T.text }}>"Confirm your LibrAI account"</strong></li>
                <li>Check your spam/junk folder</li>
                <li>Link expires in <strong style={{ color: T.text }}>24 hours</strong></li>
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <button onClick={() => setConfirmed(true)} style={{ background: "#c4652a", border: "none", borderRadius: 10, padding: "12px 28px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                ✓ I've Confirmed My Email
              </button>
              <button onClick={handleResend} disabled={resending} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 28px", color: T.textMuted, fontSize: 14, cursor: "pointer" }}>
                {resending ? "Sending..." : resent ? "✓ Email Resent!" : "Resend Confirmation Email"}
              </button>
            </div>
            <div style={{ background: T.bgSecondary, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: T.textDim, marginBottom: 16 }}>
              💡 <strong style={{ color: T.textMuted }}>Developer note:</strong> Configure EmailJS credentials in the EMAILJS_CONFIG object at the top of App.jsx to enable real email delivery.
            </div>
            <button onClick={() => nav("auth")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 14 }}>← Back to Sign In</button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 12 }}>Email Confirmed! 🎉</h2>
            <p style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>Your account has been successfully verified. You can now sign in to LibrAI System.</p>
            <button onClick={() => nav("auth")} style={{ background: "#c4652a", border: "none", borderRadius: 10, padding: "12px 32px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Sign In Now →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ T, dark, setDark, nav, setCurrentUser, registeredUsers, setRegisteredUsers, setPendingEmail }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", institution: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await api.post("/auth/login", { email: form.email, password: form.password });
        if (data.success) {
          localStorage.setItem("librai_token", data.token);
          setCurrentUser(data.user);
          nav("dashboard");
        } else {
          setError(data.message || "Invalid credentials.");
        }
      } else {
        if (!form.name) { setError("Please enter your full name."); setLoading(false); return; }
        const data = await api.post("/auth/register", { name: form.name, email: form.email, password: form.password, institution: form.institution });
        if (data.success) {
          setPendingEmail(form.email);
          nav("confirm-email");
        } else {
          setError(data.message || "Registration failed.");
        }
      }
    } catch (err) {
      setError("Connection error. Make sure the server is running.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, margin: "0 auto 16px" }}>L</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: T.text }}>LibrAI System</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4 }}>{mode === "login" ? "Sign in to your library account" : "Create your library account"}</p>
        </div>

        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, padding: 32 }}>
          <div style={{ display: "flex", background: T.bgSecondary, borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "8px", background: mode === m ? T.bgCard : "none", border: "none", borderRadius: 8, color: mode === m ? T.text : T.textMuted, cursor: "pointer", fontSize: 14, fontWeight: mode === m ? 600 : 400 }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {mode === "login" && (
            <div style={{ background: T.accentLight, border: "1px solid #c4652a30", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#c4652a" }}>
              <strong>Demo:</strong> arinze@library.ng / demo123 · admin@library.ng / demo123
            </div>
          )}

          {mode === "register" && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Arinze Nwosu" style={{ width: "100%", padding: "10px 14px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>Institution</label>
                <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder="University of Lagos" style={{ width: "100%", padding: "10px 14px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              </div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>Email Address *</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@institution.edu.ng" style={{ width: "100%", padding: "10px 14px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: T.textMuted, display: "block", marginBottom: 6 }}>Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="••••••••" style={{ width: "100%", padding: "10px 14px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            {mode === "register" && <p style={{ fontSize: 11, color: T.textDim, marginTop: 5 }}>Minimum 8 characters recommended</p>}
          </div>

          {error && <div style={{ background: "#da363318", border: "1px solid #da363340", borderRadius: 8, padding: "10px 14px", color: "#da3633", fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "#8b4a20" : "#c4652a", border: "none", borderRadius: 10, padding: "13px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          {mode === "register" && (
            <p style={{ fontSize: 12, color: T.textDim, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
              By registering, a <strong style={{ color: T.textMuted }}>confirmation email</strong> will be sent via EmailJS. You must confirm before signing in.
            </p>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
          <button onClick={() => nav("landing")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13 }}>← Back to home</button>
        </p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ T, page, nav, open, isAdmin, currentUser, onLogout }) {
  const navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "library", icon: "library", label: "Library" },
    { id: "archives", icon: "archive", label: "Archives" },
    { id: "assistant", icon: "ai", label: "AI Assistant" },
    { id: "analytics", icon: "analytics", label: "Analytics" },
    ...(isAdmin ? [{ id: "admin", icon: "admin", label: "Admin Panel" }] : []),
    { id: "profile", icon: "user", label: "My Profile" },
  ];

  const sidebarBg = "#0f1623";
  const sidebarBorder = "#1a2535";

  if (!open) return (
    <div style={{ width: 64, background: sidebarBg, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 6, borderRight: `1px solid ${sidebarBorder}`, flexShrink: 0 }}>
      <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 16 }}>L</div>
      {navItems.map(item => (
        <button key={item.id} onClick={() => nav(item.id)} title={item.label} style={{ width: 44, height: 44, background: page === item.id ? "#c4652a20" : "none", border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: page === item.id ? "#c4652a" : "#4a5568", cursor: "pointer" }}>
          <Icon name={item.icon} size={18} />
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button onClick={onLogout} title="Logout" style={{ width: 44, height: 44, background: "none", border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", cursor: "pointer", marginBottom: 16 }}><Icon name="logout" size={18} /></button>
    </div>
  );

  return (
    <div style={{ width: 240, background: sidebarBg, display: "flex", flexDirection: "column", borderRight: `1px solid ${sidebarBorder}`, flexShrink: 0 }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>L</div>
          <div>
            <div style={{ color: "#e8eaf0", fontWeight: 700, fontSize: 16 }}>LibrAI</div>
            <div style={{ color: "#4a5568", fontSize: 11 }}>Smart Library System</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: "12px", flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => nav(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: page === item.id ? "#c4652a18" : "none", border: page === item.id ? "1px solid #c4652a30" : "1px solid transparent", borderRadius: 8, color: page === item.id ? "#c4652a" : "#4a5568", cursor: "pointer", fontSize: 14, marginBottom: 2, textAlign: "left", transition: "all 0.15s" }}>
            <Icon name={item.icon} size={17} />{item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{currentUser?.name?.[0]}</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ color: "#e8eaf0", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.name}</div>
            <div style={{ color: "#4a5568", fontSize: 11 }}>{currentUser?.role === "admin" ? "Administrator" : "Library Member"}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "none", border: `1px solid ${sidebarBorder}`, borderRadius: 8, color: "#4a5568", cursor: "pointer", fontSize: 13 }}>
          <Icon name="logout" size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ T, dark, setDark, sidebarOpen, setSidebarOpen, currentUser, notifications, page }) {
  const titles = { dashboard: "Dashboard", library: "Library Catalog", archives: "Digital Archives", assistant: "AI Assistant", analytics: "Analytics", admin: "Admin Panel", profile: "My Profile" };
  return (
    <div style={{ height: 60, background: T.bgCard, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><Icon name="menu" size={20} /></button>
      <span style={{ fontSize: 17, fontWeight: 600, color: T.text }}>{titles[page] || "LibrAI"}</span>
      <div style={{ flex: 1 }} />
      <button onClick={() => setDark(!dark)} style={{ background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.textMuted, cursor: "pointer" }}><Icon name={dark ? "sun" : "moon"} size={16} /></button>
      <button style={{ background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.textMuted, cursor: "pointer", position: "relative" }}>
        <Icon name="bell" size={16} />
        {notifications > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, background: "#c4652a", borderRadius: "50%" }} />}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", background: T.bgSecondary, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{currentUser?.name?.[0]}</div>
        <span style={{ fontSize: 13, color: T.text }}>{currentUser?.name?.split(" ")[0]}</span>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ T, currentUser, savedBooks, nav, openBook, isAdmin }) {
  const recentBooks = BOOKS.slice(0, 4);
  const stats = isAdmin
    ? [{ label: "Total Books", value: "12,847", icon: "library", color: T.blue }, { label: "Archives", value: "5,231", icon: "archive", color: T.green }, { label: "Active Users", value: "1,842", icon: "user", color: "#c4652a" }, { label: "Searches Today", value: "3,402", icon: "search", color: T.yellow }]
    : [{ label: "Books Read", value: currentUser.reads, icon: "library", color: T.blue }, { label: "Saved Items", value: savedBooks.length, icon: "bookmark", color: "#c4652a" }, { label: "Searches", value: "47", icon: "search", color: T.green }, { label: "Days Active", value: "23", icon: "star", color: T.yellow }];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #c4652a, #8b3a1a)", borderRadius: 16, padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 6 }}>Welcome back,</p>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{currentUser.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
            {isAdmin ? "You have 4 documents awaiting approval and 2 new user registrations." : "You have 3 new recommendations based on your reading history."}
          </p>
          <button onClick={() => nav(isAdmin ? "admin" : "library")} style={{ marginTop: 18, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "9px 20px", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            {isAdmin ? "Review Approvals →" : "Browse Library →"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: T.text }}>{s.value}</p>
              </div>
              <div style={{ width: 40, height: 40, background: s.color + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                <Icon name={s.icon} size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Recent Additions</h3>
            <button onClick={() => nav("library")} style={{ fontSize: 13, color: "#c4652a", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          {recentBooks.map(book => (
            <div key={book.id} onClick={() => openBook(book)} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
              <div style={{ fontSize: 28 }}>{book.cover}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{book.title}</p>
                <p style={{ fontSize: 12, color: T.textMuted }}>{book.author} · {book.year}</p>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 10, background: T.accentLight, color: "#c4652a", padding: "2px 6px", borderRadius: 4 }}>LC: {book.lc}</span>
                  <span style={{ fontSize: 10, background: T.blueLight, color: T.blue, padding: "2px 6px", borderRadius: 4 }}>DDC: {book.ddc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[{ label: "Search Library", icon: "search", page: "library", color: T.blue }, { label: "AI Assistant", icon: "ai", page: "assistant", color: "#c4652a" }, { label: "Upload Archive", icon: "upload", page: "archives", color: T.green }, { label: "View Analytics", icon: "analytics", page: "analytics", color: T.yellow }].map((a, i) => (
                <button key={i} onClick={() => nav(a.page)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, cursor: "pointer", fontSize: 13 }}>
                  <span style={{ color: a.color }}><Icon name={a.icon} size={16} /></span>{a.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px 20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#c4652a" }}><Icon name="ai" size={16} /></span> Ask AI Assistant
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Books on Nigerian history", "What is DDC class 800?", "Cite Achebe in APA"].map((s, i) => (
                <button key={i} onClick={() => nav("assistant")} style={{ textAlign: "left", padding: "10px 14px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, fontSize: 13, cursor: "pointer" }}>
                  💬 "{s}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LIBRARY PAGE ─────────────────────────────────────────────────────────────
function LibraryPage({ T, searchQuery, setSearchQuery, savedBooks, toggleSave, openBook }) {
  const [filter, setFilter] = useState({ subject: "", available: false });
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("views");
  const [activeTag, setActiveTag] = useState("");
  const [classSystem, setClassSystem] = useState("none"); // "none" | "lc" | "ddc"
  const [activeLCClass, setActiveLCClass] = useState("");
  const [activeDDCClass, setActiveDDCClass] = useState("");
  const [showClassBrowser, setShowClassBrowser] = useState(false);

  const allSubjects = [...new Set(BOOKS.map(b => b.subject))];
  const allTags = [...new Set(BOOKS.flatMap(b => b.tags))];

  const filtered = BOOKS
    .filter(b => {
      const q = searchQuery.toLowerCase();
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q) && !b.subject.toLowerCase().includes(q) && !b.ddc_full.includes(q) && !b.lc_full.toLowerCase().includes(q) && !b.tags.some(t => t.includes(q))) return false;
      if (filter.subject && b.subject !== filter.subject) return false;
      if (filter.available && !b.available) return false;
      if (activeTag && !b.tags.includes(activeTag)) return false;
      if (activeLCClass && b.lc !== activeLCClass) return false;
      if (activeDDCClass && b.ddc !== activeDDCClass) return false;
      return true;
    })
    .sort((a, b) => sort === "views" ? b.views - a.views : sort === "year" ? b.year - a.year : a.title.localeCompare(b.title));

  return (
    <div>
      {/* SEARCH BAR */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0 14px" }}>
            <Icon name="search" size={16} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by title, author, DDC/LC number, subject, keywords…" style={{ flex: 1, background: "none", border: "none", color: T.text, fontSize: 14, padding: "12px 0", outline: "none" }} />
            {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}><Icon name="close" size={14} /></button>}
          </div>
          <button style={{ background: "#c4652a", border: "none", borderRadius: 10, padding: "0 20px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Search</button>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select value={filter.subject} onChange={e => setFilter({ ...filter, subject: e.target.value })} style={{ padding: "6px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }}>
            <option value="">All Subjects</option>
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "6px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }}>
            <option value="views">Most Read</option>
            <option value="year">Newest</option>
            <option value="title">A–Z</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textMuted, cursor: "pointer" }}>
            <input type="checkbox" checked={filter.available} onChange={e => setFilter({ ...filter, available: e.target.checked })} /> Available Only
          </label>
          <button onClick={() => setShowClassBrowser(!showClassBrowser)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: showClassBrowser ? T.accentLight : T.bgSecondary, border: `1px solid ${showClassBrowser ? "#c4652a" : T.border}`, borderRadius: 8, color: showClassBrowser ? "#c4652a" : T.textMuted, cursor: "pointer", fontSize: 13 }}>
            <Icon name="tag" size={13} /> Browse by Class
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, color: T.textMuted }}>{filtered.length} results</span>
          {["grid","list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "6px 12px", background: view === v ? T.accentLight : T.bgSecondary, border: `1px solid ${view === v ? "#c4652a" : T.border}`, borderRadius: 8, color: view === v ? "#c4652a" : T.textMuted, cursor: "pointer", fontSize: 12 }}>{v === "grid" ? "⊞ Grid" : "≡ List"}</button>
          ))}
        </div>
      </div>

      {/* CLASSIFICATION BROWSER */}
      {showClassBrowser && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, flex: 1 }}>Browse by Classification</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {["none","lc","ddc"].map(s => (
                <button key={s} onClick={() => { setClassSystem(s); setActiveLCClass(""); setActiveDDCClass(""); }} style={{ padding: "5px 14px", background: classSystem === s ? "#c4652a" : T.bgSecondary, border: `1px solid ${classSystem === s ? "#c4652a" : T.border}`, borderRadius: 8, color: classSystem === s ? "#fff" : T.textMuted, cursor: "pointer", fontSize: 12, fontWeight: classSystem === s ? 600 : 400 }}>
                  {s === "none" ? "None" : s === "lc" ? "LC Classes" : "DDC Classes"}
                </button>
              ))}
            </div>
          </div>

          {classSystem === "lc" && (
            <div>
              <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Library of Congress Classification — Click a class to filter books</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {LC_CLASSES.map(cls => {
                  const count = BOOKS.filter(b => b.lc === cls.code).length;
                  return (
                    <button key={cls.code} onClick={() => setActiveLCClass(activeLCClass === cls.code ? "" : cls.code)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: activeLCClass === cls.code ? cls.color + "25" : T.bgSecondary, border: `1px solid ${activeLCClass === cls.code ? cls.color : T.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ width: 32, height: 32, background: cls.color + "20", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: cls.color, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{cls.code}</div>
                      <div>
                        <p style={{ fontSize: 11, color: activeLCClass === cls.code ? cls.color : T.text, fontWeight: 600, marginBottom: 1 }}>{cls.label}</p>
                        <p style={{ fontSize: 10, color: T.textMuted }}>{count} book{count !== 1 ? "s" : ""}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {classSystem === "ddc" && (
            <div>
              <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Dewey Decimal Classification — Click a class to filter books</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {DDC_CLASSES.map(cls => {
                  const count = BOOKS.filter(b => b.ddc === cls.code).length;
                  return (
                    <button key={cls.code} onClick={() => setActiveDDCClass(activeDDCClass === cls.code ? "" : cls.code)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: activeDDCClass === cls.code ? cls.color + "25" : T.bgSecondary, border: `1px solid ${activeDDCClass === cls.code ? cls.color : T.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ width: 36, height: 36, background: cls.color + "20", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: cls.color, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{cls.code}</div>
                      <div>
                        <p style={{ fontSize: 11, color: activeDDCClass === cls.code ? cls.color : T.text, fontWeight: 600, marginBottom: 1 }}>{cls.label}</p>
                        <p style={{ fontSize: 10, color: T.textMuted }}>{count} book{count !== 1 ? "s" : ""}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(activeLCClass || activeDDCClass) && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: T.textMuted }}>Filtering by:</span>
              {activeLCClass && <span style={{ fontSize: 12, background: "#c4652a20", color: "#c4652a", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>LC Class {activeLCClass} <button onClick={() => setActiveLCClass("")} style={{ background: "none", border: "none", color: "#c4652a", cursor: "pointer", padding: 0, fontSize: 14 }}>×</button></span>}
              {activeDDCClass && <span style={{ fontSize: 12, background: T.blueLight, color: T.blue, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>DDC {activeDDCClass}xx <button onClick={() => setActiveDDCClass("")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", padding: 0, fontSize: 14 }}>×</button></span>}
            </div>
          )}
        </div>
      )}

      {/* TAGS */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {allTags.slice(0, 14).map(tag => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)} style={{ padding: "4px 12px", background: activeTag === tag ? "#c4652a" : T.bgCard, border: `1px solid ${activeTag === tag ? "#c4652a" : T.border}`, borderRadius: 20, color: activeTag === tag ? "#fff" : T.textMuted, cursor: "pointer", fontSize: 12 }}>
            #{tag}
          </button>
        ))}
      </div>

      {/* RESULTS */}
      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 18 }}>
          {filtered.map(book => {
            const lcInfo = LC_CLASSES.find(c => c.code === book.lc);
            const ddcInfo = DDC_CLASSES.find(c => c.code === book.ddc);
            return (
              <div key={book.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = T.shadow; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div onClick={() => openBook(book)} style={{ background: T.bgSecondary, height: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
                  {book.cover}
                  {lcInfo && <div style={{ position: "absolute", top: 8, left: 8, background: lcInfo.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>LC {book.lc}</div>}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <h4 onClick={() => openBook(book)} style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3, lineHeight: 1.3 }}>{book.title}</h4>
                  <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>{book.author} · {book.year}</p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ fontSize: 9, background: T.accentLight, color: "#c4652a", padding: "2px 5px", borderRadius: 3 }}>DDC {book.ddc_full}</span>
                    <span style={{ fontSize: 9, background: ddcInfo ? ddcInfo.color + "20" : T.bgSecondary, color: ddcInfo?.color || T.textMuted, padding: "2px 5px", borderRadius: 3 }}>{book.subject}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: book.available ? T.green : T.red, fontWeight: 600 }}>{book.available ? "● Available" : "○ Checked Out"}</span>
                    <button onClick={e => { e.stopPropagation(); toggleSave(book.id); }} style={{ background: "none", border: "none", color: savedBooks.includes(book.id) ? "#c4652a" : T.textMuted, cursor: "pointer", padding: 0 }}>
                      <Icon name="bookmark" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(book => (
            <div key={book.id} onClick={() => openBook(book)} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", gap: 16, alignItems: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 34 }}>{book.cover}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 3 }}>{book.title}</h4>
                <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>{book.author} · {book.year}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, background: T.accentLight, color: "#c4652a", padding: "2px 7px", borderRadius: 4 }}>LC {book.lc} · {book.lc_full}</span>
                  <span style={{ fontSize: 11, background: T.blueLight, color: T.blue, padding: "2px 7px", borderRadius: 4 }}>DDC {book.ddc_full}</span>
                  <span style={{ fontSize: 11, background: T.bgSecondary, color: T.textMuted, padding: "2px 7px", borderRadius: 4 }}>{book.subject}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ display: "block", fontSize: 11, color: book.available ? T.green : T.red, fontWeight: 600, marginBottom: 8 }}>{book.available ? "Available" : "Checked Out"}</span>
                <button onClick={e => { e.stopPropagation(); toggleSave(book.id); }} style={{ background: "none", border: "none", color: savedBooks.includes(book.id) ? "#c4652a" : T.textMuted, cursor: "pointer", padding: 0 }}><Icon name="bookmark" size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <p style={{ fontSize: 16 }}>No books found matching your criteria.</p>
          <button onClick={() => { setSearchQuery(""); setActiveLCClass(""); setActiveDDCClass(""); setFilter({ subject: "", available: false }); setActiveTag(""); }} style={{ marginTop: 12, background: "#c4652a", border: "none", borderRadius: 8, padding: "8px 20px", color: "#fff", cursor: "pointer" }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}

// ─── BOOK MODAL ───────────────────────────────────────────────────────────────
function BookModal({ T, book, onClose, savedBooks, toggleSave }) {
  const [tab, setTab] = useState("details");
  const lcInfo = LC_CLASSES.find(c => c.code === book.lc);
  const ddcInfo = DDC_CLASSES.find(c => c.code === book.ddc);
  const related = BOOKS.filter(b => b.id !== book.id && (b.subject === book.subject || b.lc === book.lc)).slice(0, 3);
  const citations = {
    apa: `${book.author}. (${book.year}). *${book.title}*. Publisher.`,
    mla: `${book.author}. *${book.title}*. Publisher, ${book.year}.`,
    chicago: `${book.author}. *${book.title}*. City: Publisher, ${book.year}.`,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, width: "100%", maxWidth: 700, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ fontSize: 52 }}>{book.cover}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>{book.title}</h2>
            <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 10 }}>{book.author} · {book.year}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {lcInfo && <span style={{ fontSize: 11, background: lcInfo.color + "20", color: lcInfo.color, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>LC: {book.lc} — {lcInfo.label}</span>}
              {ddcInfo && <span style={{ fontSize: 11, background: ddcInfo.color + "20", color: ddcInfo.color, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>DDC: {book.ddc_full}</span>}
              <span style={{ fontSize: 11, background: book.available ? T.greenLight : T.yellowLight, color: book.available ? T.green : T.yellow, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>{book.available ? "Available" : "Checked Out"}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => toggleSave(book.id)} style={{ padding: "8px 10px", background: savedBooks.includes(book.id) ? T.accentLight : T.bgSecondary, border: `1px solid ${savedBooks.includes(book.id) ? "#c4652a" : T.border}`, borderRadius: 8, color: savedBooks.includes(book.id) ? "#c4652a" : T.textMuted, cursor: "pointer" }}><Icon name="bookmark" size={16} /></button>
            <button onClick={onClose} style={{ padding: "8px 10px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, cursor: "pointer" }}><Icon name="close" size={16} /></button>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {["details","classification","citations","related"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "11px", background: "none", border: "none", borderBottom: tab === t ? "2px solid #c4652a" : "2px solid transparent", color: tab === t ? "#c4652a" : T.textMuted, cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 600 : 400, textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
        <div style={{ overflowY: "auto", padding: "24px", flex: 1 }}>
          {tab === "details" && (
            <div>
              <p style={{ color: T.text, fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>{book.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Subject", book.subject], ["Full DDC", book.ddc_full], ["Full LC", book.lc_full], ["Year", book.year], ["Views", book.views + " reads"], ["Status", book.available ? "Available" : "Checked Out"]].map(([k, v]) => (
                  <div key={k} style={{ background: T.bgSecondary, borderRadius: 8, padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 14, color: T.text, fontWeight: 600 }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>Tags</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {book.tags.map(tag => <span key={tag} style={{ padding: "4px 12px", background: T.accentLight, color: "#c4652a", borderRadius: 20, fontSize: 12 }}>#{tag}</span>)}
                </div>
              </div>
            </div>
          )}
          {tab === "classification" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {lcInfo && (
                <div style={{ background: lcInfo.color + "12", border: `1px solid ${lcInfo.color}30`, borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: lcInfo.color, marginBottom: 12 }}>Library of Congress Classification</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: T.bgCard, borderRadius: 8, padding: "10px 14px" }}><p style={{ fontSize: 11, color: T.textMuted }}>Class Letter</p><p style={{ fontSize: 22, fontWeight: 800, color: lcInfo.color }}>{book.lc}</p></div>
                    <div style={{ background: T.bgCard, borderRadius: 8, padding: "10px 14px" }}><p style={{ fontSize: 11, color: T.textMuted }}>Class Name</p><p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{lcInfo.label}</p></div>
                    <div style={{ background: T.bgCard, borderRadius: 8, padding: "10px 14px", gridColumn: "1/-1" }}><p style={{ fontSize: 11, color: T.textMuted }}>Full LC Number</p><p style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: "monospace" }}>{book.lc_full}</p></div>
                  </div>
                </div>
              )}
              {ddcInfo && (
                <div style={{ background: ddcInfo.color + "12", border: `1px solid ${ddcInfo.color}30`, borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: ddcInfo.color, marginBottom: 12 }}>Dewey Decimal Classification</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: T.bgCard, borderRadius: 8, padding: "10px 14px" }}><p style={{ fontSize: 11, color: T.textMuted }}>DDC Range</p><p style={{ fontSize: 22, fontWeight: 800, color: ddcInfo.color }}>{book.ddc}s</p></div>
                    <div style={{ background: T.bgCard, borderRadius: 8, padding: "10px 14px" }}><p style={{ fontSize: 11, color: T.textMuted }}>Category</p><p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{ddcInfo.label}</p></div>
                    <div style={{ background: T.bgCard, borderRadius: 8, padding: "10px 14px", gridColumn: "1/-1" }}><p style={{ fontSize: 11, color: T.textMuted }}>Full DDC Number</p><p style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: "monospace" }}>{book.ddc_full}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "citations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(citations).map(([style, text]) => (
                <div key={style} style={{ background: T.bgSecondary, borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text, textTransform: "uppercase" }}>{style}</span>
                    <button onClick={() => navigator.clipboard?.writeText(text)} style={{ fontSize: 12, background: T.accentLight, color: "#c4652a", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Copy</button>
                  </div>
                  <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{text}</p>
                </div>
              ))}
            </div>
          )}
          {tab === "related" && (
            <div>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 14 }}>Related resources based on LC class ({book.lc}) and subject:</p>
              {related.map(r => (
                <div key={r.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 32 }}>{r.cover}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{r.title}</p>
                    <p style={{ fontSize: 12, color: T.textMuted }}>{r.author} · {r.year}</p>
                    <span style={{ fontSize: 11, background: T.accentLight, color: "#c4652a", padding: "2px 6px", borderRadius: 4 }}>LC {r.lc} · DDC {r.ddc_full}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {book.available && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
            <button style={{ flex: 1, background: "#c4652a", border: "none", borderRadius: 8, padding: "10px", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Borrow This Book</button>
            <button style={{ padding: "10px 16px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, cursor: "pointer", fontSize: 14 }}>Reserve</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ARCHIVES PAGE ────────────────────────────────────────────────────────────
function ArchivesPage({ T }) {
  const [tab, setTab] = useState("browse");
  const [uploadStage, setUploadStage] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [processingFile, setProcessingFile] = useState(null);
  const [generatedMeta, setGeneratedMeta] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filterLC, setFilterLC] = useState("");

  const filtered = ARCHIVES.filter(a => {
    if (searchQ && !a.title.toLowerCase().includes(searchQ.toLowerCase()) && !a.keywords.some(k => k.includes(searchQ.toLowerCase()))) return false;
    if (filterLC && a.lc !== filterLC) return false;
    return true;
  });

  const simulateUpload = () => {
    setUploadStage(1);
    setProcessingFile({ name: "document_scan.pdf", size: "3.2 MB" });
    setTimeout(() => setUploadStage(2), 1400);
    setTimeout(() => setUploadStage(3), 2800);
    setTimeout(() => {
      setUploadStage(4);
      setGeneratedMeta({ title: "Ibadan University Library Annual Report", author: "University of Ibadan", date: "1978", keywords: ["Ibadan","library","annual report","1978","Nigeria"], subject: "Library Administration", ddc: "027.7669", ddc_class: "000", lc: "Z", lc_label: "Bibliography & Library Science", confidence: "94%" });
    }, 4200);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["browse","📂 Browse Archives"],["upload","⬆ Upload Document"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", background: tab === t ? "#c4652a" : "none", border: "none", borderRadius: 8, color: tab === t ? "#fff" : T.textMuted, cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 600 : 400 }}>{label}</button>
        ))}
      </div>

      {tab === "browse" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0 14px" }}>
              <Icon name="search" size={16} />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search archives by title, keywords, date..." style={{ flex: 1, background: "none", border: "none", color: T.text, fontSize: 14, padding: "12px 0", outline: "none" }} />
            </div>
            <select value={filterLC} onChange={e => setFilterLC(e.target.value)} style={{ padding: "0 14px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13 }}>
              <option value="">All LC Classes</option>
              {LC_CLASSES.map(c => <option key={c.code} value={c.code}>Class {c.code} — {c.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(doc => {
              const lcInfo = LC_CLASSES.find(c => c.code === doc.lc);
              return (
                <div key={doc.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, background: doc.format === "PDF" ? T.blueLight : T.yellowLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {doc.format === "PDF" ? "📄" : "🖼"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>{doc.title}</h4>
                      <span style={{ fontSize: 12, background: doc.status === "approved" ? T.greenLight : T.yellowLight, color: doc.status === "approved" ? T.green : T.yellow, padding: "3px 10px", borderRadius: 20, fontWeight: 600, flexShrink: 0, marginLeft: 10 }}>{doc.status}</span>
                    </div>
                    <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>{doc.type} · {doc.date} · {doc.size} · {doc.format}</p>
                    {lcInfo && <span style={{ fontSize: 11, background: lcInfo.color + "20", color: lcInfo.color, padding: "2px 8px", borderRadius: 4, fontWeight: 600, marginRight: 6 }}>LC {doc.lc}: {lcInfo.label}</span>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
                      {doc.keywords.map(k => <span key={k} style={{ fontSize: 11, background: T.bgSecondary, color: T.textMuted, padding: "2px 8px", borderRadius: 4 }}>#{k}</span>)}
                    </div>
                    <p style={{ fontSize: 12, color: T.textDim, fontStyle: "italic" }}>OCR: "{doc.text.slice(0, 90)}..."</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button style={{ padding: "7px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Icon name="eye" size={13} /> View</button>
                    <button style={{ padding: "7px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Icon name="download" size={13} /> PDF</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "upload" && (
        <div style={{ maxWidth: 700 }}>
          {uploadStage === 0 && (
            <div>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
                style={{ border: `2px dashed ${dragOver ? "#c4652a" : T.border}`, borderRadius: 14, padding: "52px 32px", textAlign: "center", background: dragOver ? T.accentLight : T.bgCard, transition: "all 0.2s", cursor: "pointer" }} onClick={simulateUpload}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 8 }}>Drop your document here</h3>
                <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>Supports PDF, DOCX, JPEG, PNG, TIFF — max 50MB</p>
                <button style={{ background: "#c4652a", border: "none", borderRadius: 8, padding: "10px 24px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Choose File</button>
                <p style={{ marginTop: 12, fontSize: 12, color: T.textDim }}>Click to demo AI OCR & metadata generation with LC/DDC auto-classification</p>
              </div>
            </div>
          )}

          {uploadStage >= 1 && uploadStage <= 3 && (
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 32, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, border: "4px solid #c4652a", borderTop: "4px solid transparent", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h3 style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {uploadStage === 1 ? "📤 Uploading Document..." : uploadStage === 2 ? "🔍 Running OCR Engine..." : "🤖 AI Generating Metadata & Classification..."}
              </h3>
              <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 20 }}>
                {uploadStage === 1 ? `Processing: ${processingFile?.name}` : uploadStage === 2 ? "Extracting text using Tesseract OCR + Vision model..." : "Assigning DDC & LC classification numbers automatically..."}
              </p>
              <div style={{ background: T.bgSecondary, borderRadius: 8, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#c4652a", width: `${uploadStage * 33}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          )}

          {uploadStage === 4 && generatedMeta && (
            <div>
              <div style={{ background: T.greenLight, border: `1px solid ${T.green}40`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Icon name="check" size={18} /><span style={{ color: T.green, fontWeight: 600 }}>AI Metadata & Classification Generated — {generatedMeta.confidence} confidence</span>
              </div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 20 }}>Review & Edit Metadata</h3>
                <div style={{ display: "grid", gap: 14 }}>
                  {[["Title", generatedMeta.title], ["Author / Institution", generatedMeta.author], ["Date", generatedMeta.date], ["Subject", generatedMeta.subject]].map(([label, value]) => (
                    <div key={label}>
                      <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 4 }}>{label}</label>
                      <input defaultValue={value} style={{ width: "100%", padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 4 }}>DDC Class (Auto-assigned)</label>
                      <div style={{ padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: DDC_CLASSES.find(c => c.code === generatedMeta.ddc_class)?.color || "#c4652a" }}>{generatedMeta.ddc}</span>
                        <span style={{ fontSize: 11, color: T.textMuted }}>{DDC_CLASSES.find(c => c.code === generatedMeta.ddc_class)?.label}</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 4 }}>LC Class (Auto-assigned)</label>
                      <div style={{ padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: LC_CLASSES.find(c => c.code === generatedMeta.lc)?.color || "#c4652a" }}>{generatedMeta.lc}</span>
                        <span style={{ fontSize: 11, color: T.textMuted }}>{generatedMeta.lc_label}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 4 }}>Auto-generated Keywords</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {generatedMeta.keywords.map(k => <span key={k} style={{ padding: "4px 12px", background: T.accentLight, color: "#c4652a", borderRadius: 20, fontSize: 12 }}>#{k}</span>)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button style={{ flex: 1, background: "#c4652a", border: "none", borderRadius: 8, padding: "11px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Publish to Archive</button>
                  <button onClick={() => { setUploadStage(0); setGeneratedMeta(null); }} style={{ background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 20px", color: T.textMuted, cursor: "pointer" }}>Upload Another</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI ASSISTANT PAGE ────────────────────────────────────────────────────────
function AssistantPage({ T, currentUser }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hello ${currentUser.name.split(" ")[0]}! I'm **LibrAI AI Assistant**. I can help you:\n\n• Find books using **DDC** or **LC classification**\n• Generate **APA, MLA, Chicago** citations\n• Explain classification systems\n• Suggest research topics · Summarize documents\n\nWhat would you like to know?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiMode, setAiMode] = useState("mock"); // "mock" | "real"
  const [apiKey, setApiKey] = useState("");
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [citationDoc, setCitationDoc] = useState("");
  const [citationStyle, setCitationStyle] = useState("APA");
  const [citationResult, setCitationResult] = useState("");
  const [plagText, setPlagText] = useState("");
  const [plagResult, setPlagResult] = useState(null);
  const [summaryText, setSummaryText] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [toolLoading, setToolLoading] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    let reply;
    if (aiMode === "real") {
      try {
        reply = await callRealAI(newHistory);
        setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        reply = `⚠️ Real AI error: ${err.message}\n\nFalling back to smart mock response:\n\n${getMockResponse(userMsg)}`;
      }
    } else {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
      reply = getMockResponse(userMsg);
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
    }
    setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    setLoading(false);
  };

  const runCitationTool = async () => {
    if (!citationDoc.trim()) return;
    setToolLoading(true);
    let result;
    if (aiMode === "real") {
      try { result = await callRealAI([{ role: "user", content: `Generate a ${citationStyle} citation for: "${citationDoc}". Provide only the formatted citation.` }]); }
      catch { result = `${citationStyle}: ${citationDoc}. Publisher, ${new Date().getFullYear()}.`; }
    } else {
      await new Promise(r => setTimeout(r, 800));
      result = citationStyle === "APA" ? `Author, A. (${new Date().getFullYear()}). *${citationDoc}*. Publisher.`
        : citationStyle === "MLA" ? `Author, First. *${citationDoc}*. Publisher, ${new Date().getFullYear()}.`
        : `Author First Last. *${citationDoc}*. City: Publisher, ${new Date().getFullYear()}.`;
    }
    setCitationResult(result);
    setToolLoading(false);
  };

  const runSummaryTool = async () => {
    if (!summaryText.trim()) return;
    setToolLoading(true);
    let result;
    if (aiMode === "real") {
      try { result = await callRealAI([{ role: "user", content: `Summarize in 3-5 bullet points for a library research context:\n\n${summaryText}` }]); }
      catch { result = "• Summary unavailable — real AI connection failed.\n• Please check your API configuration."; }
    } else {
      await new Promise(r => setTimeout(r, 1000));
      const words = summaryText.split(" ").length;
      result = `• This document covers approximately ${words} words of content\n• Key themes include the main subject matter discussed\n• The text presents arguments and supporting evidence\n• Conclusions relate to the central topic explored\n• Further research in this area is recommended`;
    }
    setSummaryResult(result);
    setToolLoading(false);
  };

  const suggestions = ["What is DDC class 800?", "Explain LC Classification class P", "Books on Nigerian history", "Cite: Things Fall Apart by Chinua Achebe", "Research topics in African literature"];

  const renderText = (text) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return <p key={i} style={{ margin: "2px 0", lineHeight: 1.7 }}>{parts.map((p, j) => p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p)}</p>;
    });
  };

  return (
    <div style={{ height: "calc(100vh - 116px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 0, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4 }}>
          {[["chat","💬 AI Chat"],["tools","🔬 Research Tools"]].map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 18px", background: activeTab === t ? "#c4652a" : "none", border: "none", borderRadius: 8, color: activeTab === t ? "#fff" : T.textMuted, cursor: "pointer", fontSize: 14, fontWeight: activeTab === t ? 600 : 400 }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>AI Mode:</span>
          <div style={{ display: "flex", gap: 0, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, padding: 3 }}>
            <button onClick={() => setAiMode("mock")} style={{ padding: "5px 12px", background: aiMode === "mock" ? T.bgSecondary : "none", border: "none", borderRadius: 6, color: aiMode === "mock" ? T.text : T.textMuted, cursor: "pointer", fontSize: 12, fontWeight: aiMode === "mock" ? 600 : 400 }}>🤖 Smart Mock</button>
            <button onClick={() => { setAiMode("real"); setShowApiSetup(true); }} style={{ padding: "5px 12px", background: aiMode === "real" ? "#c4652a" : "none", border: "none", borderRadius: 6, color: aiMode === "real" ? "#fff" : T.textMuted, cursor: "pointer", fontSize: 12, fontWeight: aiMode === "real" ? 600 : 400 }}>⚡ Real Claude AI</button>
          </div>
          {aiMode === "real" && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>● Live</span>}
        </div>
      </div>

      {/* API SETUP NOTICE */}
      {showApiSetup && aiMode === "real" && (
        <div style={{ background: T.blueLight, border: `1px solid ${T.blue}40`, borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: T.blue, fontWeight: 600, marginBottom: 4 }}>⚡ Real Claude AI Mode Active</p>
              <p style={{ color: T.textMuted, lineHeight: 1.6 }}>This uses the Anthropic API directly from your browser. The API call is made client-side — ensure you're running this in a secure environment. If calls fail, it automatically falls back to Smart Mock mode.</p>
            </div>
            <button onClick={() => setShowApiSetup(false)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 0, marginLeft: 12 }}><Icon name="close" size={14} /></button>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 18, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>L</div>}
                <div style={{ maxWidth: "74%", background: m.role === "user" ? "#c4652a" : T.bgCard, border: `1px solid ${m.role === "user" ? "#c4652a" : T.border}`, borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "12px 16px", color: m.role === "user" ? "#fff" : T.text, fontSize: 14 }}>
                  {renderText(m.text)}
                </div>
                {m.role === "user" && <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{currentUser.name[0]}</div>}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>L</div>
                <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
                  <span style={{ display: "inline-flex", gap: 5 }}>
                    {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, background: "#c4652a", borderRadius: "50%", display: "inline-block", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
                  </span>
                  <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)} }`}</style>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Try asking:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)} style={{ padding: "5px 12px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, color: T.textMuted, cursor: "pointer", fontSize: 12 }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "0 16px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask about books, DDC/LC classification, citations..." style={{ flex: 1, background: "none", border: "none", color: T.text, fontSize: 14, padding: "14px 0", outline: "none" }} />
            </div>
            <button onClick={send} disabled={!input.trim() || loading} style={{ padding: "0 20px", background: !input.trim() || loading ? T.bgSecondary : "#c4652a", border: "none", borderRadius: 12, color: !input.trim() || loading ? T.textMuted : "#fff", cursor: !input.trim() || loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      )}

      {activeTab === "tools" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Citation Generator */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>📖 Citation Generator</h3>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>AI generates APA, MLA, or Chicago citations</p>
              <input value={citationDoc} onChange={e => setCitationDoc(e.target.value)} placeholder="Enter title or describe the source..." style={{ width: "100%", padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, boxSizing: "border-box", marginBottom: 10 }} />
              <select value={citationStyle} onChange={e => setCitationStyle(e.target.value)} style={{ width: "100%", padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, marginBottom: 10 }}>
                <option>APA</option><option>MLA</option><option>Chicago</option>
              </select>
              <button onClick={runCitationTool} disabled={toolLoading || !citationDoc} style={{ width: "100%", background: "#c4652a", border: "none", borderRadius: 8, padding: "10px", color: "#fff", cursor: "pointer", fontWeight: 600, opacity: toolLoading || !citationDoc ? 0.6 : 1 }}>
                {toolLoading ? "Generating..." : "Generate Citation"}
              </button>
              {citationResult && <div style={{ marginTop: 12, padding: "12px", background: T.bgSecondary, borderRadius: 8, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{citationResult}</div>}
            </div>

            {/* Plagiarism Checker */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>🔍 Plagiarism Checker</h3>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>Check text for similarity indicators</p>
              <textarea value={plagText} onChange={e => setPlagText(e.target.value)} placeholder="Paste text to check..." style={{ width: "100%", height: 100, padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, boxSizing: "border-box", resize: "vertical", marginBottom: 10 }} />
              <button onClick={() => plagText && setPlagResult({ score: Math.floor(Math.random() * 20) + 3, matches: Math.floor(Math.random() * 5) + 1 })} style={{ width: "100%", background: "#c4652a", border: "none", borderRadius: 8, padding: "10px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Check Similarity</button>
              {plagResult && <div style={{ marginTop: 12, padding: "12px", background: T.greenLight, border: `1px solid ${T.green}40`, borderRadius: 8 }}>
                <strong style={{ color: T.green }}>Similarity: {plagResult.score}% — Low Risk</strong>
                <p style={{ color: T.textMuted, marginTop: 4, fontSize: 13 }}>{plagResult.matches} potential match{plagResult.matches > 1 ? "es" : ""} found in database</p>
              </div>}
            </div>

            {/* Research Topics */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>💡 Research Topic Suggestions</h3>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>AI-powered research topic ideas by DDC class</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["AI adoption in Nigerian university libraries (DDC 025)", "Digital preservation of oral histories in Africa (DDC 025.84)", "Colonial land records and archival gaps (DDC 900)", "Islamic manuscripts in West Africa (DDC 200)", "Indigenous language documentation (DDC 400)"].map((topic, i) => (
                  <div key={i} style={{ padding: "10px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: T.text }}>{topic}</span>
                    <button onClick={() => setInput(topic)} style={{ fontSize: 11, background: T.accentLight, color: "#c4652a", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>Ask AI</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Summarizer */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>📝 Document Summarizer</h3>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>AI summarizes any document or text</p>
              <textarea value={summaryText} onChange={e => setSummaryText(e.target.value)} placeholder="Paste document text here..." style={{ width: "100%", height: 100, padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, boxSizing: "border-box", resize: "vertical", marginBottom: 10 }} />
              <button onClick={runSummaryTool} disabled={toolLoading || !summaryText} style={{ width: "100%", background: "#c4652a", border: "none", borderRadius: 8, padding: "10px", color: "#fff", cursor: "pointer", fontWeight: 600, opacity: toolLoading || !summaryText ? 0.6 : 1 }}>
                {toolLoading ? "Summarizing..." : "Summarize with AI"}
              </button>
              {summaryResult && <div style={{ marginTop: 12, padding: "12px", background: T.bgSecondary, borderRadius: 8, fontSize: 13, color: T.text, lineHeight: 1.7 }}>{summaryResult}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage({ T }) {
  const topBooks = [...BOOKS].sort((a, b) => b.views - a.views).slice(0, 5);
  const lcDistribution = LC_CLASSES.map(cls => ({ ...cls, count: BOOKS.filter(b => b.lc === cls.code).length })).filter(c => c.count > 0);
  const ddcDistribution = DDC_CLASSES.map(cls => ({ ...cls, count: BOOKS.filter(b => b.ddc === cls.code).length })).filter(c => c.count > 0);
  const monthlyData = [
    { month: "Oct", searches: 2100, borrows: 680 }, { month: "Nov", searches: 2450, borrows: 790 },
    { month: "Dec", searches: 1900, borrows: 540 }, { month: "Jan", searches: 2800, borrows: 860 },
    { month: "Feb", searches: 3100, borrows: 950 }, { month: "Mar", searches: 3400, borrows: 1020 },
  ];
  const maxSearches = Math.max(...monthlyData.map(d => d.searches));
  const acquisitionGaps = ["African Philosophy & Ethics (LC: B, DDC: 100)", "Nigerian Indigenous Languages (LC: P, DDC: 400)", "West African Legal Systems (LC: K, DDC: 340)", "Agricultural Science Nigeria (LC: S, DDC: 630)"];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[["Total Reads","5,840",T.blue,"+12% this month"],["Active Users","1,842",T.green,"+8% this month"],["LC Classes Covered","8 / 21","#c4652a","38% coverage"],["DDC Classes Covered","6 / 10","#d29922","60% coverage"]].map(([label,val,color,sub]) => (
          <div key={label} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 18px" }}>
            <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 4 }}>{val}</p>
            <p style={{ fontSize: 12, color }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 20 }}>Monthly Usage Trends</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 160 }}>
            {monthlyData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 130 }}>
                  <div style={{ width: 16, background: T.blue, borderRadius: "3px 3px 0 0", height: `${(d.searches / maxSearches) * 120}px` }} />
                  <div style={{ width: 16, background: "#c4652a", borderRadius: "3px 3px 0 0", height: `${(d.borrows / maxSearches) * 120}px` }} />
                </div>
                <span style={{ fontSize: 10, color: T.textMuted }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}><div style={{ width: 12, height: 12, background: T.blue, borderRadius: 2 }} /><span style={{ fontSize: 12, color: T.textMuted }}>Searches</span></div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}><div style={{ width: 12, height: 12, background: "#c4652a", borderRadius: 2 }} /><span style={{ fontSize: 12, color: T.textMuted }}>Borrows</span></div>
          </div>
        </div>

        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>LC Class Distribution</h3>
          {lcDistribution.map((cls, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: T.text }}>Class {cls.code}: {cls.label.split("·")[0].trim()}</span>
                <span style={{ fontSize: 12, color: T.textMuted }}>{cls.count} books</span>
              </div>
              <div style={{ background: T.bgSecondary, borderRadius: 4, height: 6 }}>
                <div style={{ height: "100%", background: cls.color, borderRadius: 4, width: `${(cls.count / BOOKS.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>📚 Most Read Books</h3>
          {topBooks.map((book, i) => (
            <div key={book.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: i === 0 ? "#c4652a" : T.textMuted, fontWeight: 700, width: 20 }}>#{i+1}</span>
              <span style={{ fontSize: 22 }}>{book.cover}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{book.title}</p>
                <p style={{ fontSize: 11, color: T.textMuted }}>LC {book.lc} · DDC {book.ddc_full}</p>
              </div>
              <span style={{ fontSize: 13, color: T.textMuted }}>{book.views}</span>
            </div>
          ))}
        </div>

        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>🤖 AI Acquisition Recommendations</h3>
          <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Subjects with high search demand but low collection coverage</p>
          {acquisitionGaps.map((gap, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.text }}>{gap}</span>
              <button style={{ fontSize: 11, background: T.accentLight, color: "#c4652a", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Acquire</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ T, registeredUsers, setRegisteredUsers }) {
  const [tab, setTab] = useState("overview");
  const [books, setBooks] = useState(BOOKS);
  const [archives, setArchives] = useState(ARCHIVES);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", year: "", subject: "", ddc: "000", ddc_full: "", lc: "A", lc_full: "", cover: "📗" });

  const addBook = () => {
    if (!newBook.title) return;
    setBooks(prev => [...prev, { ...newBook, id: Date.now(), tags: [], views: 0, available: true, description: "Newly added book.", ddc_full: newBook.ddc_full || newBook.ddc }]);
    setNewBook({ title: "", author: "", year: "", subject: "", ddc: "000", ddc_full: "", lc: "A", lc_full: "", cover: "📗" });
    setShowAddBook(false);
  };

  const pending = archives.filter(a => a.status === "pending");

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["overview","books","users","approvals"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 18px", background: tab === t ? "#c4652a" : "none", border: "none", borderRadius: 8, color: tab === t ? "#fff" : T.textMuted, cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 600 : 400, textTransform: "capitalize", position: "relative" }}>
            {t}{t === "approvals" && pending.length > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#da3633", borderRadius: "50%" }} />}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[["Total Books", books.length, T.blue], ["Archives", archives.length, T.green], ["Users", registeredUsers.length, "#c4652a"], ["Pending", pending.length, T.yellow]].map(([l, v, c]) => (
              <div key={l} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 18px" }}>
                <p style={{ fontSize: 13, color: T.textMuted }}>{l}</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: c, marginTop: 4 }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>Recent Activity</h3>
            {[{ action: "New user registered", detail: "fatima.aliyu@abu.edu.ng — awaiting confirmation", time: "2 min ago" }, { action: "Document submitted", detail: "Ibadan University Annual Report 1978", time: "15 min ago" }, { action: "Book borrowed", detail: '"Things Fall Apart" by Emeka Osei', time: "1 hr ago" }, { action: "AI citation generated", detail: "Achebe — APA format", time: "2 hr ago" }].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c4652a", marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: T.text }}>{a.action}</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>{a.detail}</p>
                </div>
                <span style={{ fontSize: 12, color: T.textDim, flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "books" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: T.textMuted, fontSize: 14 }}>{books.length} books in catalog</p>
            <button onClick={() => setShowAddBook(!showAddBook)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#c4652a", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              <Icon name="plus" size={15} /> Add Book
            </button>
          </div>

          {showAddBook && (
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>Add New Book</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["title","Title *"],["author","Author(s)"],["year","Year"],["subject","Subject"],["ddc_full","Full DDC Number"],["lc_full","Full LC Number"]].map(([key, label]) => (
                  <input key={key} value={newBook[key]} onChange={e => setNewBook({ ...newBook, [key]: e.target.value })} placeholder={label} style={{ padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }} />
                ))}
                <select value={newBook.ddc} onChange={e => setNewBook({ ...newBook, ddc: e.target.value })} style={{ padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }}>
                  {DDC_CLASSES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
                </select>
                <select value={newBook.lc} onChange={e => setNewBook({ ...newBook, lc: e.target.value })} style={{ padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }}>
                  {LC_CLASSES.map(c => <option key={c.code} value={c.code}>Class {c.code} — {c.label}</option>)}
                </select>
                <select value={newBook.cover} onChange={e => setNewBook({ ...newBook, cover: e.target.value })} style={{ padding: "9px 12px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13 }}>
                  {["📗","📘","📙","📕"].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={addBook} style={{ background: "#c4652a", border: "none", borderRadius: 8, padding: "9px 24px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Add Book</button>
                <button onClick={() => setShowAddBook(false)} style={{ background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 20px", color: T.textMuted, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 80px", padding: "12px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase" }}>
              <span>Title / Author</span><span>LC · DDC</span><span>Year</span><span>Status</span><span>Actions</span>
            </div>
            {books.map(book => (
              <div key={book.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 80px", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 14, color: T.text, fontWeight: 600 }}>{book.cover} {book.title}</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>{book.author}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: "#c4652a", display: "block" }}>LC {book.lc}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>DDC {book.ddc_full}</span>
                </div>
                <span style={{ fontSize: 13, color: T.text }}>{book.year}</span>
                <span style={{ fontSize: 12, color: book.available ? T.green : T.yellow, fontWeight: 600 }}>{book.available ? "In" : "Out"}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ padding: "5px 8px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 6, color: T.textMuted, cursor: "pointer" }}><Icon name="edit" size={13} /></button>
                  <button onClick={() => setBooks(prev => prev.filter(b => b.id !== book.id))} style={{ padding: "5px 8px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 6, color: T.red, cursor: "pointer" }}><Icon name="trash" size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 80px 80px 80px", padding: "12px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase" }}>
            <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Reads</span>
          </div>
          {registeredUsers.map(user => (
            <div key={user.id} style={{ display: "grid", gridTemplateColumns: "1fr 180px 80px 80px 80px", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#c4652a,#8b3a1a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{user.name[0]}</div>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 600 }}>{user.name}</span>
              </div>
              <span style={{ fontSize: 12, color: T.textMuted }}>{user.email}</span>
              <span style={{ fontSize: 12, background: user.role === "admin" ? T.accentLight : T.blueLight, color: user.role === "admin" ? "#c4652a" : T.blue, padding: "3px 8px", borderRadius: 6, fontWeight: 600, textAlign: "center" }}>{user.role}</span>
              <span style={{ fontSize: 11, color: user.confirmed ? T.green : T.yellow, fontWeight: 600 }}>{user.confirmed ? "✓ Active" : "⏳ Pending"}</span>
              <span style={{ fontSize: 13, color: T.text }}>{user.reads}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "approvals" && (
        <div>
          <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 16 }}>{pending.length} document{pending.length !== 1 ? "s" : ""} awaiting review</p>
          {pending.length === 0 ? (
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ color: T.textMuted }}>All documents have been reviewed.</p>
            </div>
          ) : pending.map(doc => (
            <div key={doc.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 36 }}>📄</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>{doc.title}</h4>
                  <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>{doc.type} · {doc.date} · {doc.size}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {doc.keywords.map(k => <span key={k} style={{ fontSize: 11, background: T.bgSecondary, color: T.textMuted, padding: "2px 8px", borderRadius: 4 }}>#{k}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setArchives(prev => prev.map(a => a.id === doc.id ? { ...a, status: "approved" } : a))} style={{ padding: "8px 16px", background: T.greenLight, border: `1px solid ${T.green}40`, borderRadius: 8, color: T.green, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>✓ Approve</button>
                  <button onClick={() => setArchives(prev => prev.filter(a => a.id !== doc.id))} style={{ padding: "8px 16px", background: T.bgSecondary, border: `1px solid ${T.border}`, borderRadius: 8, color: T.red, cursor: "pointer", fontSize: 13 }}>✗ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ T, currentUser, savedBooks }) {
  const saved = BOOKS.filter(b => savedBooks.includes(b.id));
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #c4652a, #8b3a1a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700 }}>{currentUser.name[0]}</div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 4 }}>{currentUser.name}</h2>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 8 }}>{currentUser.email}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 12, background: T.accentLight, color: "#c4652a", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{currentUser.role === "admin" ? "Administrator" : "Library Member"}</span>
              <span style={{ fontSize: 12, background: T.greenLight, color: T.green, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>✓ Verified</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[["Member Since", currentUser.joined], ["Books Read", currentUser.reads], ["Saved Items", savedBooks.length]].map(([l, v]) => (
            <div key={l} style={{ background: T.bgSecondary, borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#c4652a", marginBottom: 4 }}>{v}</p>
              <p style={{ fontSize: 12, color: T.textMuted }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>🔖 Saved Books</h3>
        {saved.length === 0 ? (
          <p style={{ color: T.textMuted, fontSize: 14 }}>No saved books yet. Browse the library to bookmark items.</p>
        ) : saved.map(book => {
          const lcInfo = LC_CLASSES.find(c => c.code === book.lc);
          return (
            <div key={book.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 28 }}>{book.cover}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{book.title}</p>
                <p style={{ fontSize: 12, color: T.textMuted }}>{book.author} · {book.year}</p>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {lcInfo && <span style={{ fontSize: 10, background: lcInfo.color + "20", color: lcInfo.color, padding: "2px 6px", borderRadius: 4 }}>LC {book.lc}</span>}
                  <span style={{ fontSize: 10, background: T.accentLight, color: "#c4652a", padding: "2px 6px", borderRadius: 4 }}>DDC {book.ddc_full}</span>
                </div>
              </div>
              <span style={{ fontSize: 11, background: T.accentLight, color: "#c4652a", padding: "3px 10px", borderRadius: 20, height: "fit-content" }}>{book.subject}</span>
            </div>
          );
        })}
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 16 }}>🤖 AI Recommendations For You</h3>
        {BOOKS.filter(b => !savedBooks.includes(b.id)).slice(0, 4).map(book => (
          <div key={book.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 24 }}>{book.cover}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{book.title}</p>
              <p style={{ fontSize: 11, color: T.textMuted }}>{book.author} · {book.subject} · LC {book.lc}</p>
            </div>
            <span style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>● Available</span>
          </div>
        ))}
      </div>
    </div>
  );
}
