# BNMIT attendance connector

Prototype adapter; live portal verification is still required. No passwords are collected or stored. The extension reads only the signed-in BNMIT portal tab and fetches same-origin course attendance pages. No attendance is sent to a third-party server.

1. Run BunkIt at http://localhost:5173.
2. Open chrome://extensions (or edge://extensions), enable Developer mode, and choose Load unpacked → this connector folder.
3. Copy the extension ID into BunkIt's Connect portal panel.
4. Sign in directly at https://bnmit-students.contineo.in/webfiles/ and open the attendance overview containing all course links.
5. Press Sync attendance. With a saved connector ID, BunkIt also attempts sync on app launch.

The parser expects `task=attendencelist&courseId=…` links and numeric `.cn-attend`/`#cn-attend`, `.cn-absent`/`#cn-absent` elements, based on the earlier portal discussion. Any unexpected page structure is rejected without changing saved data. A signed-out session, CAPTCHA, or portal layout change must be resolved in the portal itself. The current prototype requires the overview tab to remain open and supports desktop Chromium browsers. Continuous background syncing and mobile integration are not implemented.

For deployment, add the exact trusted BunkIt production origin to both manifest externally_connectable and the ALLOWED set. Never use a wildcard origin.
