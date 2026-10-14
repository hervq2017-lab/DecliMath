// Capture d'écran de l'application (Chrome sans fenêtre) pour chaque thème. Usage : node scripts/_shot.mjs <route> <role>
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const route = process.argv[2] ?? "/exercices";
const role = process.argv[3] ?? "student";
const out = process.env.SHOT_DIR ?? "C:/Users/LENOVO/AppData/Local/Temp/shots";
mkdirSync(out, { recursive: true });
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--remote-debugging-port=9333", "--user-data-dir=" + out + "/profile", "--window-size=1440,900", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let list;
  for (let k = 0; k < 40; k++) { try { list = await (await fetch("http://127.0.0.1:9333/json")).json(); if (list.length) break; } catch { /* attente */ } await sleep(250); }
  ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
  await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:5173/" });
  await sleep(1500);
  const now = Date.now(), DAY = 864e5;
  const users = [
    { id: "p1", role: "parent", name: "Maman", email: "p@x.ci", password: "x", country: "CI", inviteCode: "ABC123", createdAt: now - 9 * DAY, lastLogin: now - 3600e3 },
    { id: "s1", role: "student", name: "Business", email: "hervq2017@gmail.com", password: "x", country: "BJ", level: "3e", parentId: "p1", placed: true, createdAt: now - 5 * DAY, lastLogin: now - 1800e3, prefs: { dailyGoal: 15, dyslexia: false, reduceMotion: true } },
    { id: "a1", role: "admin", name: "Admin", email: "a@x.ci", password: "x", country: "CI", createdAt: now - 20 * DAY, lastLogin: now },
  ];
  const att = (i) => ({ id: "t" + i, studentId: "s1", templateId: "t", notionId: "maths:3e:x", ctx: "c", seed: i, correct: i % 3 !== 0, helpLevel: 0, solutionViewed: false, solutionViewedBeforeAttempt: false, kind: "practice", ts: now - i * 3600e3 });
  const state = { users, sessionId: role === "student" ? "s1" : role === "parent" ? "p1" : "a1", attempts: Array.from({ length: 12 }, (_, i) => att(i)), checks: [], exams: [], papers: [], validated: {}, solutionMode: {}, goals: {}, payments: [], audit: [] };
  const themes = (process.env.THEMES ?? "nuit,ocean,clair,soleil").split(",");
  for (const th of themes) {
    const st = JSON.parse(JSON.stringify(state));
    if (role === "student") st.users[1].prefs.theme = th;
    if (role === "parent") st.users[0].prefs = { dailyGoal: 15, dyslexia: false, reduceMotion: true, theme: th };
    if (role === "admin") st.users[2].prefs = { dailyGoal: 15, dyslexia: false, reduceMotion: true, theme: th };
    await send("Runtime.evaluate", { expression: `localStorage.setItem("reussite-terminale-v2", ${JSON.stringify(JSON.stringify(st))}); history.replaceState(null, "", ${JSON.stringify(route)}); location.reload();` });
    await sleep(2200);
    if (process.env.OPEN_MENU) { await send("Runtime.evaluate", { expression: `document.querySelector(".user-menu summary")?.click()` }); await sleep(400); }
    if (process.env.OPEN_BELL) { await send("Runtime.evaluate", { expression: `document.querySelector(".bell")?.click()` }); await sleep(400); }
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}/${role}-${route.replace(/\W+/g, "_")}-${th}.png`, Buffer.from(shot.data, "base64"));
  }
  console.log("ok", out);
} finally { chrome.kill(); process.exit(0); }
