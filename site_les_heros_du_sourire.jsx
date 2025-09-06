import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Single-file React component (default export)
// Usage: Drop into a Create React App / Vite project and ensure TailwindCSS is configured.
// - Tailwind required for styling
// - framer-motion should be installed (optional animation)

export default function LesHerossDuSourireApp() {
  const [form, setForm] = useState({
    fullname: "",
    tiktok: "",
    age: "",
    country: "",
    why: "",
    videoLink: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [applications, setApplications] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const ADMIN_PASSWORD = "admin123"; // change this before production

  useEffect(() => {
    const raw = localStorage.getItem("lhs_applications");
    if (raw) setApplications(JSON.parse(raw));
  }, []);

  function validate() {
    const e = {};
    if (!form.fullname.trim()) e.fullname = "Veuillez entrer votre nom complet.";
    if (!form.tiktok.trim()) e.tiktok = "Indiquez votre pseudo TikTok (ex: @monpseudo).";
    if (!form.age || Number(form.age) < 13) e.age = "Vous devez avoir au moins 13 ans.";
    if (!form.country.trim()) e.country = "Indiquez votre pays.";
    if (!form.why.trim() || form.why.trim().length < 20)
      e.why = "Expliquez en quelques mots pourquoi vous voulez rejoindre (min 20 caractères).";
    if (form.videoLink && !isValidURL(form.videoLink)) e.videoLink = "Lien vidéo invalide.";
    if (!form.agree) e.agree = "Vous devez accepter le règlement du team.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function isValidURL(s) {
    try { new URL(s); return true; } catch { return false; }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const app = {
      id: Date.now(),
      fullname: form.fullname.trim(),
      tiktok: form.tiktok.trim(),
      age: form.age,
      country: form.country,
      why: form.why.trim(),
      videoLink: form.videoLink.trim(),
      submittedAt: new Date().toISOString(),
    };
    const next = [app, ...applications];
    setApplications(next);
    localStorage.setItem("lhs_applications", JSON.stringify(next));
    setSaved(true);
    setForm({ fullname: "", tiktok: "", age: "", country: "", why: "", videoLink: "", agree: false });
    downloadJSON(app, `candidature_${app.tiktok.replace(/[^a-z0-9_-]/gi, "_")}_${app.id}.json`);
    setTimeout(() => setSaved(false), 3500);
  }

  function downloadJSON(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openAdmin() {
    if (adminPass === ADMIN_PASSWORD) { setAdminOpen(true); setAdminPass(""); } 
    else { alert("Mot de passe administrateur incorrect. (Astuce: changez le mot de passe dans le code avant prod.)"); }
  }

  function exportCSV() {
    if (!applications.length) return alert("Aucune candidature à exporter.");
    const keys = ["id", "fullname", "tiktok", "age", "country", "why", "videoLink", "submittedAt"];
    const lines = [keys.join(",")];
    for (const a of applications) {
      const row = keys.map(k => `"${String(a[k] ?? "").replace(/\"/g, '""')}"`).join(",");
      lines.push(row);
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `les_heros_du_sourire_candidatures_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    if (!confirm("Supprimer toutes les candidatures locales ? Cette action est irréversible.")) return;
    localStorage.removeItem("lhs_applications");
    setApplications([]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6 flex flex-col items-center">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Les Héros du Sourire</h1>
            <p className="text-sm text-slate-600">Rejoins la team TikTok — remplis ta candidature ci-dessous.</p>
          </div>
          <div className="text-right">
            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })} className="px-3 py-1 rounded-md border text-sm">Candidatures</button>
          </div>
        </div>
      </motion.header>

      <main className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Formulaire de candidature</h2>
          <p className="text-sm text-slate-500 mb-4">Remplis honnêtement — on regardera toutes les candidatures.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nom complet</label>
              <input name="fullname" value={form.fullname} onChange={handleChange} className="mt-1 block w-full rounded-md border p-2" />
              {errors.fullname && <p className="text-xs text-red-600 mt-1">{errors.fullname}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Pseudo TikTok</label>
              <input name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="@monpseudo" className="mt-1 block w-full rounded-md border p-2" />
              {errors.tiktok && <p className="text-xs text-red-600 mt-1">{errors.tiktok}</p>}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">Âge</label>
                <input name="age" value={form.age} onChange={handleChange} type="number" min="0" className="mt-1 block w-full rounded-md border p-2" />
                {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Pays</label>
                <input name="country" value={form.country} onChange={handleChange} className="mt-1 block w-full rounded-md border p-2" />
                {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Pourquoi veux-tu rejoindre ?</label>
              <textarea name="why" value={form.why} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border p-2" />
              {errors.why && <p className="text-xs text-red-600 mt-1">{errors.why}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Lien vers une vidéo (TikTok / Instagram)</label>
              <input name="videoLink" value={form.videoLink} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full rounded-md border p-2" />
              {errors.videoLink && <p className="text-xs text-red-600 mt-1">{errors.videoLink}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input id="agree" name="agree" type="checkbox" checked={form.agree} onChange={handleChange} />
              <label htmlFor="agree" className="text-sm">J'accepte le règlement interne du team.</label>
            </div>
            {errors.agree && <p className="text-xs text-red-600">{errors.agree}</p>}
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">Envoyer la candidature</button>
              <button type="button" onClick={() => { navigator.clipboard.writeText(JSON.stringify(form)); alert('Candidature copiée au presse-papier (JSON)'); }} className="px-3 py-2 rounded-lg border">Copier JSON</button>
              <button type="button" onClick={() => downloadJSON(form, 'candidature_brouillon.json')} className="px-3 py-2 rounded-lg border">Télécharger brouillon</button>
            </div>
            {saved && <p className="text-sm text-green-700">Candidature envoyée — merci ! Un fichier a été téléchargé en local.</p>}
          </form>
          <hr className="my-4" />
          <p className="text-xs text-slate-500">Astuce: vous pouvez héberger cette page sur Vercel/Netlify. Pour recevoir les candidatures par e‑mail ou via Google Sheets, connectez-la à un backend (ex: Formspree, Make/Integromat ou un petit webhook).</p>
        </section>

        <aside className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-2">À propos du team</h3>
          <p className="text-sm text-slate-600 mb-4">Les Héros du Sourire cherchent des créateurs bienveillants, créatifs et motivés pour rejoindre des projets TikTok collaboratifs axés sur la bonne humeur.</p>
          <ul className="text-sm space-y-2 mb-4">
            <li>• Contenus positifs et familiaux</li>
            <li>• Collaboration régulière (challenges, duets)</li>
            <li>• Respect du code de conduite du team</li>
          </ul>
          <div className="mb-4">
            <label className="block text-sm font-medium">Admin — mot de passe</label>
            <div className="flex gap-2 mt-2">
              <input value={adminPass} onChange={(e) => setAdminPass(e.target.value)} type="password" className="flex-1 rounded-md border p-2" placeholder="mot de passe admin" />
              <button onClick={openAdmin} className="px-3 py-2 rounded-lg border">Ouvrir</button>
            </div>
            <p className="text-xs text-slate-400 mt-2">(mot de passe par défaut: <strong>admin123</strong>)</p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-slate-500">Actions admin:</p>
            <div className="flex gap-2 mt-2">
              <button onClick={exportCSV} className="px-3 py-2 rounded-lg border">Exporter CSV</button>
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(applications)); alert('Toutes candidatures copiées en JSON'); }} className="px-3 py-2 rounded-lg border">Copier toutes</button>
              <button onClick={clearAll} className="px-3 py-2 rounded-lg border">Supprimer tout</button>
            </div>
          </div>
        </aside>

        {adminOpen && (
          <section className="bg-white p-6 rounded-2xl shadow-md md:col-span-2">
            <h2 className="text-xl font-semibold">Panel administrateur — Candidatures ({applications.length})</h2>
            <div className="mt-4 space-y-3">
              {applications.length === 0 && <p className="text-sm text-slate-500">Aucune candidature enregistrée.</p>}
              {applications.map(a => (
                <article key={a.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{a.fullname} — {a.tiktok}</div>
                      <div className="text-xs text-slate-500">{a.country} • {a.age} ans — {new Date(a.submittedAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm">
                      <button onClick={() => downloadJSON(a, `candidature_${a.tiktok}_${a.id}.json`)} className="px-2 py-1 border rounded">JSON</button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{a.why}</p>
                  {a.videoLink && <p className="mt-2 text-xs"><a href={a.videoLink} target="_blank" rel="noreferrer" className="underline">Voir la vidéo</a></p>}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-8 text-xs text-slate-400">© Les Héros du Sourire — Page générée automatiquement</footer>
    </div>
  );
}
