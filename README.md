# BunkIt — rebuild

A fresh React 19 / TypeScript / Vite student workspace. The notebook and simulated AI have been removed.

## Run

```sh
corepack yarn install --frozen-lockfile
corepack yarn dev --host 0.0.0.0 --port 5173
```

Build with `corepack yarn build`. The production frontend is generated in `dist/`.

## Implemented

- Distinct graphite / acid-green design with a real WebGL attendance orbit, responsive navigation, pointer-driven 3D card tilt, transitions, reduced-motion handling, and a CSS fallback when WebGL is unavailable.
- Fixed 85% attendance threshold with integer-safe bunk/recovery calculations and a true saved-sync timestamp. Empty state never pretends to be live attendance.
- Timetable creation, ordering by time, and deletion.
- Deadline creation, completion, overdue display, and deletion. Background push notifications are not implemented.
- Subject materials as links or uploaded files up to 25 MB. Uploaded files use IndexedDB; other records use browser-local storage.
- Desktop BNMIT connector prototype. See `connector/README.md` for installation and current limitations. No daily manual attendance entry and no portal credential collection.

## Still needs live verification

Portal synchronization cannot be certified without a signed-in BNMIT attendance overview. The connector derives its initial selectors from the earlier discussion, rejects unexpected pages, and preserves saved data on failure. A deployed origin must be explicitly added to its allowlist after the actual hosting URL is known.

Data is local to the browser. No shared account, cross-device sync, background reminder service, or college backend integration is claimed. The new `bunkit.v2.*` keys avoid overwriting the original application's storage.

## Accessibility / performance

The WebGL animation is capped near 30fps, uses a capped pixel ratio, and skips rendering offscreen or in background tabs. Reduced-motion preferences stop orbit motion and hover tilt. Its numeric attendance result is rendered as normal HTML; the canvas is decorative and hidden from assistive technology. Keyboard focus indicators are provided for interactive controls.
