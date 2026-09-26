// Allow only the local BunkIt app. Add a production origin only after it is known.
const ALLOWED = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (
      !sender.url ||
      !ALLOWED.has(new URL(sender.url).origin) ||
      message?.type !== "BUNKIT_SYNC"
    )
      return false;
    (async () => {
      try {
        const tabs = await chrome.tabs.query({
          url: "https://bnmit-students.contineo.in/*",
        });
        if (!tabs.length)
          throw new Error(
            "Open the BNMIT portal and sign in, then open your attendance page.",
          );
        const tab = tabs.find((t) => t.active) || tabs[0];
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async () => {
            function count(root, name) {
              const el = root.querySelector("." + name + ",#" + name);
              if (!el) return null;
              const raw = el.getAttribute("data-value") || el.textContent;
              const match = raw?.trim().match(/^\d+$/);
              return match ? Number(match[0]) : null;
            }
            function parse(doc, url, title) {
              const attended = count(doc, "cn-attend"),
                missed = count(doc, "cn-absent");
              if (attended === null || missed === null) return null;
              const id = new URL(url).searchParams.get("courseId");
              if (!id) return null;
              return {
                id,
                name: title?.trim() || `Course ${id}`,
                attended,
                missed,
              };
            }
            const links = [...document.querySelectorAll("a[href]")].filter(
              (a) => {
                const u = new URL(a.href, location.href);
                return (
                  u.origin === location.origin &&
                  u.searchParams.get("task") === "attendencelist" &&
                  u.searchParams.has("courseId")
                );
              },
            );
            const seen = new Set();
            const subjects = [];
            for (const a of links) {
              const u = new URL(a.href);
              const id = u.searchParams.get("courseId");
              if (seen.has(id)) continue;
              seen.add(id);
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 8000);
              let response;
              try {
                response = await fetch(u.href, {
                  credentials: "same-origin",
                  signal: controller.signal,
                });
              } finally {
                clearTimeout(timer);
              }
              if (!response.ok)
                throw new Error(
                  "A course attendance page could not be loaded.",
                );
              const doc = new DOMParser().parseFromString(
                await response.text(),
                "text/html",
              );
              const item = parse(doc, u.href, a.textContent);
              if (!item)
                throw new Error(
                  "The attendance page format differs from the saved example. No saved data was changed.",
                );
              subjects.push(item);
            }
            // Do not overwrite a complete snapshot with just the currently open subject.
            if (!subjects.length)
              throw new Error(
                "Open the attendance overview with all subject links. The portal parser still needs verification against your page.",
              );
            return subjects;
          },
        });
        const subjects = result[0]?.result;
        if (!Array.isArray(subjects) || !subjects.length)
          throw new Error(
            "No complete attendance snapshot found. Open the attendance overview and try again.",
          );
        sendResponse({ subjects });
      } catch (e) {
        sendResponse({ error: e.message || "Portal sync failed." });
      }
    })();
    return true;
  },
);
