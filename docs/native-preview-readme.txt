AI Toolkit - native preview
===========================

This experimental build uses Tauri/Rust and the operating system WebView.
The editor, Default/UCP themes and all interface languages are included.
Game artwork is read from your selected game installation and its active packs;
no Firefly unit or isometric building sprites are shipped in this download.
Original permitted editor artwork is included without resizing or lossy changes.

Windows 10/11 x64
----------------
The setup EXE is recommended for first-time installation. If Microsoft Edge
WebView2 Runtime is missing, setup downloads its official bootstrapper. This
separate Microsoft runtime download is not part of the Toolkit package size.
The portable ZIP assumes WebView2 is already installed. Extract the entire ZIP
into one folder; do not run the executable while it is still inside the ZIP.

The editor keeps existing AI Toolkit settings, recent projects, groups and
shortcuts. Editable config/*.json files remain next to the executable. Keep
those files when moving the portable installation. Existing project and game
formats are unchanged by theme or language selection.
The setup installer adds missing config defaults without overwriting any existing
config files. Uninstalling leaves that editable config folder intact.

The first migration from an Electron build requires this setup or a manual ZIP
installation: older updaters require Electron's app.asar package. Native preview
updates use the normal portable ZIP. Never replace files while the editor is
running. The native updater checks the selected release and download checksum.

Themes and interface languages are selected under Edit. Stronghold Crusader
Definitive Edition import/export does not require DE artwork to be installed;
full map backgrounds currently require a supported classic game installation.

Source and issues
-----------------
Official project: https://github.com/Schlossgespensty/AI-Toolkit
Experimental preview: https://github.com/Krarilotus/AI-Toolkit
This is a test preview, not an official upstream release.
See THIRD_PARTY_NOTICES.txt for dependency licenses and artwork attribution.
