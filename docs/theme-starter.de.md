# Eigenes AI-Toolkit-Design

Dieses Paket enthält alle 33 unterstützten UI-Texturrollen und alle 123
Farb-, Schrift- und Komponentenvariablen. Auch die großen Hintergründe sind
enthalten. Du brauchst kein weiteres Theme und keine Entwicklungswerkzeuge.
Als Ausgangspunkt dient das UCP-Design mit Monsterfishs Originalgrafiken.

## Loslegen

1. Den kompletten Ordner `monsterfish-theme` nach
   `%APPDATA%\AI Toolkit\themes\` kopieren.
2. Die Tauri-Vorschau von AI Toolkit neu starten und unter
   **Bearbeiten → Design → Monsterfish Theme** auswählen.
3. Dateien bearbeiten und zum Neuladen den Editor neu starten.

Bei einem eigenen Datenordner liegt `themes` in diesem Datenordner. Für weitere
Designs den Ordner kopieren und Ordnername sowie `id` in `theme.json` gemeinsam
ändern. Die ID verwendet Kleinbuchstaben und Bindestriche; `name` ist der frei
wählbare Anzeigename. `default` und `ucp` sind reserviert.

## Was du bearbeiten kannst

- **`textures/`**: Bilder für Hintergründe, Buttons, Tabs, Rahmen, Eingabefelder,
  Checkboxen, Pfeile, Schieberegler und Scrollbalken. Ein Bild wird überall für
  dieselbe Rolle verwendet. `TEXTURE-ROLES.md` listet jede Zuordnung auf.
- **`variables.css`**: alle Farben, Schriftfamilien und angebotenen Formwerte.
  Nur bestehende Variablen im `:root`-Block ändern. Die Reihenfolge ist
  Grundpalette → Bedeutung → Komponente; verknüpfte Werte folgen automatisch.
  Unter `--component-toolbar-*` stehen die Hintergrund- und Abstandsregeln der
  Werkzeugleiste, unter `--component-toolbar-group-*` deren Gruppenrahmen.
  Im UCP-Ausgangspunkt sind `border-width` und `accent-width` jeweils `0px`,
  `surface` ist `transparent` und `shadow` ist `none`: kein zusätzlicher Kasten
  um die Buttons. Für Rahmen z. B. `border-width: 1px` und `radius: 6px`
  einstellen. `gap` trennt Gruppen bzw. Buttons, `padding-block` und
  `padding-inline` bestimmen Innenabstände. Die Logik bleibt unverändert.
- **`theme.json`**: Name, Bildzuweisungen und Skalierung. `cover` füllt eine
  Fläche, `contain` erhält das vollständige Bild, `tile` kachelt, `frame`
  skaliert Rahmen in neun Abschnitten. `slice` bestimmt die Bildabschnitte,
  `width` die Rahmenbreite bei frei skalierbaren Rahmen, `fill` die Verwendung
  der Bildmitte. Tabs verwenden eine feste Breite von 8 px, Kategorien 2 px;
  horizontale Scrollleisten behalten ihre vorhandene Rahmengeometrie.
  Zustandsbilder teilen die Geometrie ihres Normalzustands.
- **`tokens.json`**: vollständige optionale Entwicklerquelle der Variablen.
  Für Bildtausch und direkte Änderungen in `variables.css` nicht erforderlich.
  Der Editor liest `variables.css`; Änderungen an Tokens müssen erst generiert
  werden. `theme.schema.json` beschreibt die unterstützte Konfiguration.

Bildgrößen und Rahmenwerte zunächst beibehalten. Keine Texte in Buttons
einzeichnen: Beschriftungen und Übersetzungen kommen vom Editor. Normal-,
Hover- und gedrückten Zustand zusammen gestalten und den Textkontrast prüfen.
Schriftfamilien wählen installierte Systemschriften; Schriftdateien lädt ein
Theme nicht nach. Anschließend den ganzen Ordner als ZIP weitergeben und die
Herkunft der enthaltenen Grafiken in `ATTRIBUTION.md` erhalten bzw. ergänzen.

## Umfang

Das Paket enthält alle derzeit vom Theme-System angebotenen Einstellungen
und Grafiken in einem Ordner. Dekoration und die angebotenen Abstandsregeln
gehören zum Theme. Reihenfolge, Andocken und Umbruchlogik der Arbeitsbereiche,
Bedienlogik und Barrierefreiheit bleiben Aufgabe des Editors; eigene
CSS-Selektoren oder Skripte sind nicht vorgesehen.
Kategoriefarben und Kartenfarben beschreiben Inhalte und gehören nicht zum
Theme. Spielsprites und Übersetzungen werden separat verwaltet. Die eingebauten
Standardwerte dienen weiterhin als Rückfall bei beschädigten eigenen Dateien.
