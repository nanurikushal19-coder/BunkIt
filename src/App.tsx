import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OrbitScene } from "./OrbitScene";
import { DepthCard } from "./DepthCard";
import { saveFile, downloadFile, deleteFile } from "./materialFiles";
import {
  GraduationCap,
  CalendarDays,
  Bell,
  Library,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  FileText,
} from "lucide-react";
import "./rebuild.css";
import { status } from "./utils/attendance";

type Subject = { id: string; name: string; attended: number; missed: number };
type Class = {
  id: string;
  name: string;
  day: string;
  start: string;
  end: string;
};
type Task = { id: string; title: string; due: string; done: boolean };
type Material = {
  id: string;
  title: string;
  url: string;
  subject: string;
  fileName?: string;
};
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const NAV = [
  { id: "attendance", label: "Attendance", icon: GraduationCap },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "deadlines", label: "Deadlines", icon: Bell },
  { id: "materials", label: "Materials", icon: Library },
];
function useSaved<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError("");
    } catch {
      setError(
        "Your browser could not save changes. Keep this tab open and free some storage.",
      );
    }
  }, [key, value]);
  return [value, setValue, error] as const;
}
const uid = () => crypto.randomUUID();
const field = (f: FormData, k: string) => String(f.get(k) || "").trim();
function App() {
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState("attendance");
  const [subjects, setSubjects, e1] = useSaved<Subject[]>(
    "bunkit.v2.subjects",
    [],
  );
  const [classes, setClasses, e2] = useSaved<Class[]>("bunkit.v2.classes", []);
  const [tasks, setTasks, e3] = useSaved<Task[]>("bunkit.v2.tasks", []);
  const [materials, setMaterials, e4] = useSaved<Material[]>(
    "bunkit.v2.materials",
    [],
  );
  const [synced, setSynced] = useSaved<string>("bunkit.v2.synced", "");
  const [extension, setExtension] = useSaved<string>("bunkit.v2.extension", "");
  const [notice, setNotice] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [setup, setSetup] = useState(false);
  const [day, setDay] = useState(DAYS[(new Date().getDay() + 6) % 7]);
  const risky = subjects.filter((s) => status(s).need > 0).length;
  const attended = subjects.reduce((a, s) => a + s.attended, 0),
    total = subjects.reduce((a, s) => a + s.attended + s.missed, 0);
  async function sync() {
    setNotice("");
    const chrome = (window as any).chrome;
    if (!extension || !chrome?.runtime?.sendMessage) {
      setSetup(true);
      return;
    }
    setConnecting(true);
    try {
      const response: any = await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () =>
            reject(
              new Error(
                "Portal sync timed out. Open your attendance page and try again.",
              ),
            ),
          45000,
        );
        chrome.runtime.sendMessage(
          extension,
          { type: "BUNKIT_SYNC" },
          (r: any) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError)
              reject(
                new Error(
                  "BunkIt connector is unavailable. Check its extension ID and reload this page.",
                ),
              );
            else resolve(r);
          },
        );
      });
      if (response?.error) throw new Error(response.error);
      if (!Array.isArray(response?.subjects) || !response.subjects.length)
        throw new Error(
          "No attendance data found. Open the attendance page inside the BNMIT portal.",
        );
      if (
        !response.subjects.every(
          (s: any) =>
            typeof s.id === "string" &&
            typeof s.name === "string" &&
            Number.isSafeInteger(s.attended) &&
            s.attended >= 0 &&
            Number.isSafeInteger(s.missed) &&
            s.missed >= 0,
        )
      )
        throw new Error(
          "The portal returned an unexpected format. Your saved attendance has been preserved.",
        );
      setSubjects(response.subjects);
      setSynced(new Date().toISOString());
      setSetup(false);
      setNotice("Attendance synced from your BNMIT portal.");
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Sync failed. Please try again.",
      );
    } finally {
      setConnecting(false);
    }
  }
  useEffect(() => {
    if (extension) void sync();
  }, []);
  function remove<T extends { id: string }>(
    items: T[],
    id: string,
    set: (v: T[]) => void,
  ) {
    if (window.confirm("Delete this item?"))
      set(items.filter((i) => i.id !== id));
  }
  return (
    <div className="bunkit">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("attendance");
          }}
        >
          <span className="brandmark">
            <GraduationCap />
          </span>
          BunkIt<span className="brand-period">.</span>
        </a>
        <span className="edition">STUDENT OS / 02</span>
        <nav aria-label="Main navigation">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "navitem active" : "navitem"}
              aria-current={tab === n.id ? "page" : undefined}
              onClick={() => setTab(n.id)}
            >
              <n.icon size={20} />
              <span>{n.label}</span>
              {n.id === "deadlines" && tasks.some((t) => !t.done) && (
                <b>{tasks.filter((t) => !t.done).length}</b>
              )}
            </button>
          ))}
        </nav>
        <a
          className="portal-top"
          href="https://bnmit-students.contineo.in/webfiles/"
          target="_blank"
          rel="noreferrer"
        >
          BNMIT PORTAL <ArrowUpRight size={15} />
        </a>
      </aside>
      <main>
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span>{" "}
            {NAV.find((n) => n.id === tab)?.label}
          </span>
          <span className="date">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="page"
            initial={
              reducedMotion ? false : { opacity: 0, y: 18, filter: "blur(5px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          >
            <div className="page-heading">
              <div>
                <p className="eyebrow">MAKE ROOM FOR LIFE.</p>
                <h1>
                  {tab === "attendance"
                    ? "Bunk responsibly."
                    : tab === "timetable"
                      ? "Your week, sorted."
                      : tab === "deadlines"
                        ? "Beat the deadline."
                        : tab === "materials"
                          ? "All in one place."
                          : "Your workspace."}
                </h1>
                <p className="subtitle">
                  {tab === "attendance"
                    ? "Know when you can bunk. Know when you really can’t."
                    : tab === "timetable"
                      ? "A little structure for the beautifully unstructured."
                      : tab === "deadlines"
                        ? "Future you would appreciate finishing these."
                        : tab === "materials"
                          ? "The good stuff. Minus the group-chat archaeology."
                          : "Your workspace."}
                </p>
              </div>
              {tab === "attendance" && (
                <button
                  className="primary"
                  onClick={sync}
                  disabled={connecting}
                >
                  <RefreshCw
                    size={17}
                    className={connecting ? "spinning" : ""}
                  />
                  {connecting ? "Syncing…" : "Sync attendance"}
                </button>
              )}
            </div>
            {(notice || e1 || e2 || e3 || e4) && (
              <div role="status" className="notice">
                {notice || e1 || e2 || e3 || e4}
              </div>
            )}
            {tab === "attendance" && (
              <>
                <section className="attendance-stage">
                  <div className="orbit-panel">
                    <div className="orbit-caption">
                      <span>ATTENDANCE ORBIT</span>
                      <span>
                        {synced ? "01 / SAVED SNAPSHOT" : "01 / TARGET"}
                      </span>
                    </div>
                    <OrbitScene
                      percent={total ? (attended / total) * 100 : 85}
                    />
                    <div className="orbit-number">
                      <strong>
                        {total ? ((attended / total) * 100).toFixed(1) : "85"}
                        <span>%</span>
                      </strong>
                      <small>{total ? "YOUR ATTENDANCE" : "YOUR TARGET"}</small>
                    </div>
                    <div className="orbit-footer">
                      <span>
                        {synced ? "LAST SYNC SAVED" : "AWAITING FIRST SYNC"}
                      </span>
                      <span>DRAG TO ROTATE ↗</span>
                    </div>
                  </div>
                  <section className="stats">
                    <div>
                      <span>Overall attendance</span>
                      <strong>
                        {total ? ((attended / total) * 100).toFixed(1) : "—"}
                        <small>{total ? "%" : ""}</small>
                      </strong>
                      <p>
                        {total
                          ? `${attended} of ${total} classes attended`
                          : "Connect your portal to begin"}
                      </p>
                    </div>
                    <div>
                      <span>Required attendance</span>
                      <strong>
                        85<small>%</small>
                      </strong>
                      <p>Applied to every subject</p>
                    </div>
                    <div>
                      <span>Subjects to watch</span>
                      <strong>
                        {subjects.length ? String(risky).padStart(2, "0") : "—"}
                      </strong>
                      <p>
                        {risky
                          ? "Time to show up, bossu."
                          : subjects.length
                            ? "You’re keeping up. Nice."
                            : "Waiting for your attendance"}
                      </p>
                    </div>
                  </section>
                </section>
                <div className="section-heading">
                  <h2>
                    Your subjects{" "}
                    <span className="count">{subjects.length}</span>
                  </h2>
                  <small>
                    {synced
                      ? `Last synced ${new Date(synced).toLocaleString("en-IN")}`
                      : "Not synced yet"}
                  </small>
                </div>
                {subjects.length ? (
                  <div className="subject-grid">
                    {subjects.map((s, i) => {
                      const v = status(s);
                      return (
                        <DepthCard className="subject" key={s.id}>
                          <div className="subject-top">
                            <span className="subject-number">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className={v.need ? "pill danger" : "pill"}>
                              {v.total
                                ? v.need
                                  ? "Needs attention"
                                  : "On track"
                                : "No classes yet"}
                            </span>
                          </div>
                          <h3>{s.name}</h3>
                          <div className="subject-main">
                            <div className="numbers">
                              <span>
                                <b>{s.attended}</b> Attended
                              </span>
                              <span>
                                <b>{s.missed}</b> Missed
                              </span>
                              <span>
                                <b>{v.total}</b> Total classes
                              </span>
                            </div>
                            <div
                              className="ring"
                              style={{
                                background: `conic-gradient(${v.need ? "#ff9c9c" : "#fff"} ${v.percent}%, #343437 0)`,
                              }}
                            >
                              <span>
                                {v.percent.toFixed(1)}
                                <small>%</small>
                              </span>
                            </div>
                          </div>
                          <div className="subject-footer">
                            {!v.total
                              ? "Waiting for the first class."
                              : v.need
                                ? `Attend the next ${v.need} classes to reach 85%.`
                                : v.skip
                                  ? `You can bunk the next ${v.skip} classes.`
                                  : "On the line. Attend your next class."}
                          </div>
                        </DepthCard>
                      );
                    })}
                  </div>
                ) : (
                  <section className="empty-state">
                    <div className="empty-icon">
                      <GraduationCap size={30} />
                    </div>
                    <h2>Let’s get your attendance.</h2>
                    <p>
                      Connect to your signed-in BNMIT portal.
                      <br />
                      Your subject counts come from college—no daily entry.
                    </p>
                    <button className="primary" onClick={() => setSetup(true)}>
                      Connect BNMIT <ArrowUpRight size={17} />
                    </button>
                    <small>Your credentials stay in the college portal.</small>
                  </section>
                )}
                <div className="footnote">
                  <span>85% is the line. Keep a little breathing room.</span>
                  <a
                    href="https://bnmit-students.contineo.in/webfiles/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open college portal <ArrowUpRight size={14} />
                  </a>
                </div>
                {setup && (
                  <section className="panel connection">
                    <div className="section-heading">
                      <h2>Connect your portal</h2>
                      <button
                        className="text-button"
                        onClick={() => setSetup(false)}
                      >
                        Close
                      </button>
                    </div>
                    <p>
                      The desktop connector reads attendance from your signed-in
                      BNMIT tab. Install the bundled <code>connector</code>{" "}
                      folder through your browser’s “Load unpacked” extension
                      option, then paste its extension ID below.
                    </p>
                    <p className="muted">
                      Connector status: built, awaiting verification against a
                      real portal session. Keep the attendance page open for
                      sync.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setNotice(
                          "Connector ID saved. Click Sync attendance to connect.",
                        );
                      }}
                    >
                      <label>
                        Connector extension ID
                        <input
                          pattern="[a-p]{32}"
                          required
                          value={extension}
                          onChange={(e) => setExtension(e.target.value.trim())}
                          placeholder="32-character extension ID"
                        />
                      </label>
                      <button className="primary">Save connector</button>
                    </form>
                  </section>
                )}
              </>
            )}
            {tab === "timetable" && (
              <>
                <div className="daytabs">
                  {DAYS.map((d) => (
                    <button
                      className={day === d ? "selected" : ""}
                      key={d}
                      onClick={() => setDay(d)}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="two-col">
                  <section className="panel">
                    <h2>{day}</h2>
                    {classes.filter((c) => c.day === day).length ? (
                      classes
                        .filter((c) => c.day === day)
                        .sort((a, b) => a.start.localeCompare(b.start))
                        .map((c) => (
                          <div className="list-row" key={c.id}>
                            <span className="time">
                              {c.start}
                              <small>{c.end}</small>
                            </span>
                            <strong>{c.name}</strong>
                            <button
                              aria-label={`Delete ${c.name}`}
                              onClick={() => remove(classes, c.id, setClasses)}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="empty-copy">
                        Nothing scheduled. Add your classes for {day}.
                      </p>
                    )}
                  </section>
                  <section className="panel">
                    <h2>Add a class</h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        if (field(f, "end") <= field(f, "start")) {
                          setNotice("End time must be after the start time.");
                          return;
                        }
                        setClasses([
                          ...classes,
                          {
                            id: uid(),
                            name: field(f, "name"),
                            day,
                            start: field(f, "start"),
                            end: field(f, "end"),
                          },
                        ]);
                        e.currentTarget.reset();
                        setNotice("Class added.");
                      }}
                    >
                      <label>
                        Subject
                        <input
                          name="name"
                          required
                          maxLength={100}
                          placeholder="e.g. Data Structures"
                        />
                      </label>
                      <div className="input-row">
                        <label>
                          Starts
                          <input name="start" type="time" required />
                        </label>
                        <label>
                          Ends
                          <input name="end" type="time" required />
                        </label>
                      </div>
                      <button className="primary">
                        <Plus size={17} />
                        Add to {day}
                      </button>
                    </form>
                  </section>
                </div>
              </>
            )}
            {tab === "deadlines" && (
              <div className="two-col">
                <section className="panel">
                  <h2>
                    On your plate{" "}
                    <span className="count">
                      {tasks.filter((t) => !t.done).length}
                    </span>
                  </h2>
                  {tasks.length ? (
                    tasks
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(a.done) - Number(b.done) ||
                          a.due.localeCompare(b.due),
                      )
                      .map((t) => (
                        <div className="list-row" key={t.id}>
                          <button
                            className={t.done ? "check done" : "check"}
                            aria-label={
                              t.done
                                ? `Reopen ${t.title}`
                                : `Complete ${t.title}`
                            }
                            onClick={() =>
                              setTasks(
                                tasks.map((x) =>
                                  x.id === t.id ? { ...x, done: !x.done } : x,
                                ),
                              )
                            }
                          >
                            {t.done && <Check size={16} />}
                          </button>
                          <div className="grow">
                            <strong className={t.done ? "strike" : ""}>
                              {t.title}
                            </strong>
                            <small
                              className={
                                !t.done &&
                                new Date(t.due).getTime() < Date.now()
                                  ? "overdue"
                                  : ""
                              }
                            >
                              {!t.done && new Date(t.due).getTime() < Date.now()
                                ? "Overdue · "
                                : ""}
                              {new Date(t.due).toLocaleString("en-IN")}
                            </small>
                          </div>
                          <button
                            aria-label={`Delete ${t.title}`}
                            onClick={() => remove(tasks, t.id, setTasks)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ))
                  ) : (
                    <p className="empty-copy">
                      No deadlines yet. Suspiciously peaceful.
                    </p>
                  )}
                  <p className="muted">
                    Deadlines appear here while you use BunkIt. Background
                    notifications are not connected yet.
                  </p>
                </section>
                <section className="panel">
                  <h2>Add a deadline</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      setTasks([
                        ...tasks,
                        {
                          id: uid(),
                          title: field(f, "title"),
                          due: field(f, "due"),
                          done: false,
                        },
                      ]);
                      e.currentTarget.reset();
                    }}
                  >
                    <label>
                      What’s due?
                      <input
                        required
                        name="title"
                        maxLength={200}
                        placeholder="Assignment, exam, submission…"
                      />
                    </label>
                    <label>
                      When?
                      <input name="due" type="datetime-local" required />
                    </label>
                    <button className="primary">
                      <Plus size={17} />
                      Add deadline
                    </button>
                  </form>
                </section>
              </div>
            )}
            {tab === "materials" && (
              <div className="two-col">
                <section className="panel">
                  <h2>Subject materials</h2>
                  {materials.length ? (
                    materials.map((m) => (
                      <div className="list-row" key={m.id}>
                        <FileText size={24} />
                        <div className="grow">
                          <a
                            href={m.fileName ? "#download" : m.url}
                            target={m.fileName ? undefined : "_blank"}
                            rel="noreferrer"
                            onClick={
                              m.fileName
                                ? (e) => {
                                    e.preventDefault();
                                    downloadFile(m.id, m.fileName!).catch((e) =>
                                      setNotice(e.message),
                                    );
                                  }
                                : undefined
                            }
                          >
                            {m.title} {m.fileName ? "↓" : "↗"}
                          </a>
                          <small>{m.subject}</small>
                        </div>
                        <button
                          aria-label={`Delete ${m.title}`}
                          onClick={() => {
                            if (confirm("Delete this resource?")) {
                              (m.fileName
                                ? deleteFile(m.id)
                                : Promise.resolve()
                              )
                                .then(() =>
                                  setMaterials(
                                    materials.filter((x) => x.id !== m.id),
                                  ),
                                )
                                .catch(() =>
                                  setNotice(
                                    "Could not delete the saved file. Try again.",
                                  ),
                                );
                            }
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-copy">
                      Upload notes and PDFs, or save links to your class
                      resources.
                    </p>
                  )}
                </section>
                <section className="panel">
                  <h2>Add a resource</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const f = new FormData(form);
                      const url = field(f, "url");
                      const file = f.get("file") as File;
                      const id = uid();
                      if (!file?.size && !/^https?:\/\//i.test(url)) {
                        setNotice(
                          "Upload a file or enter an https:// or http:// URL.",
                        );
                        return;
                      }
                      if (file?.size > 25 * 1024 * 1024) {
                        setNotice("Choose a file smaller than 25 MB.");
                        return;
                      }
                      try {
                        if (file?.size) await saveFile(id, file);
                        setMaterials((prev) => [
                          ...prev,
                          {
                            id,
                            title: field(f, "title"),
                            url: file?.size ? "" : url,
                            subject: field(f, "subject"),
                            fileName: file?.size ? file.name : undefined,
                          },
                        ]);
                        form.reset();
                        setNotice("Resource saved on this browser.");
                      } catch {
                        setNotice(
                          "The file could not be saved. Check your browser storage and try again.",
                        );
                      }
                    }}
                  >
                    <label>
                      Title
                      <input name="title" required maxLength={200} />
                    </label>
                    <label>
                      Subject
                      <input name="subject" required maxLength={100} />
                    </label>
                    <label>
                      Resource URL
                      <input name="url" type="url" placeholder="https://…" />
                    </label>
                    <label>
                      Or upload a file (up to 25 MB)
                      <input name="file" type="file" />
                    </label>
                    <button className="primary">
                      <Plus size={17} />
                      Save resource
                    </button>
                  </form>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <footer className="app-footer">
          <strong>BUNKIT.</strong>
          <span>BUILT FOR THE HOURS BETWEEN CLASSES.</span>
          <small>Saved on this browser</small>
        </footer>
      </main>
    </div>
  );
}
export default App;
