# Official release updates

The top-bar button checks Schlossgespensty/AI-Toolkit releases/latest on startup
and at each wall-clock hour. Main-process caching coalesces windows; failed checks
retry no more than once per minute. No background downloads or modal alerts.
Only stable semantic versions newer than app.getVersion() are offered; PR branch
commits and the fork's releases are not consulted.

Click downloads the single Windows ZIP, requires GitHub's SHA256 asset digest,
verifies size/hash, and prepares supported runtime files. The existing unsaved-work
Save/Discard/Cancel flow runs after download. Other Toolkit windows must be closed.
Cancel leaves the verified download ready to retry. No app closes until preparation
succeeds and the user finishes the unsaved-work flow.

A detached Windows helper waits for the process to exit, locks destination files,
backs them up, installs the runtime, verifies hashes and restarts the same EXE path.
Failure restores changed files and records error.txt beside the backup. Existing
config definitions update only when they still match the old bundled definitions;
customized config and user/project files are preserved. Unknown archive layouts,
missing checksums, unsupported platforms and multiple ambiguous ZIPs fail clearly.
The helper and backup live under userData/release-updates; the permanent taskbar
shortcut is unchanged. The manual local staged-build helper remains separate.
