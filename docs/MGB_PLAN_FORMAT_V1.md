# MGB Connect – Plan-Dateiformat (Version 1)

## Ziel

`.mgb` ist das portable Dateiformat für Messdienerpläne in MGB Connect. Eine Datei enthält strukturierte Dienste und kann unabhängig von einer konkreten MGB-Connect-Installation gespeichert und später importiert werden.

## Technische Form

- Dateiendung: `.mgb`
- Inhalt: UTF-8-kodiertes JSON
- MIME-Typ: `application/vnd.mgb-connect.plan+json`
- Kennung: `format = "mgb-connect-plan"`
- Versionierung: `schemaVersion = 1`
- Keine Skripte, Makros, eingebetteten Programme oder ausführbaren Inhalte.

Die erste Version verwendet bewusst eine einfache JSON-Datei statt eines ZIP-Containers. Ein Archiv kann später ergänzt werden, falls Originaldateien oder weitere Anlagen tatsächlich benötigt werden.

## Struktur

| Feld | Typ | Pflicht | Bedeutung |
|---|---|---:|---|
| format | String | Ja | Feste Kennung `mgb-connect-plan` |
| schemaVersion | Zahl | Ja | Aktuell `1` |
| createdAt | ISO-Datum/Zeit | Ja | Zeitpunkt der Dateierstellung |
| sourceFileName | String | Nein | Ursprünglicher Dateiname |
| sourceFormat | String | Ja | `pdf`, `docx`, `manual` oder `mgb` |
| services | Array | Ja | Dienste des Plans |

Jeder Eintrag in `services` besitzt:

| Feld | Typ | Pflicht | Bedeutung |
|---|---|---:|---|
| title | String | Ja | Dienstbezeichnung |
| dateISO | String | Ja | Datum als `YYYY-MM-DD` |
| time | String | Ja | Uhrzeit als `HH:MM` |
| location | String | Nein | Ort/Kirche |
| meeting | String | Nein | Treffpunkt oder Hinweis |
| points | Zahl | Ja | Ganze Zahl von 0 bis 1000 |
| leaderName | String | Nein | Name des Leiters |
| assignedName | String | Nein | Name des zugewiesenen Messdieners |

Namen werden absichtlich als Text gespeichert, nicht als Supabase-UUID. Beim Import werden sie gegen aktive Profile abgeglichen. Ein nicht eindeutiger oder unbekannter Name darf nicht automatisch einer Person zugeordnet werden.

## Beispiel

Siehe [beispielplan.mgb](./examples/beispielplan.mgb).

## Importregeln

1. Die Datei wird vor jeder Verarbeitung auf Formatkennung und Version geprüft.
2. Pflichtfelder, Datumswerte, Uhrzeiten, Punkte und maximale Anzahl von 500 Diensten werden validiert.
3. Doppelte Dienste werden erkannt und vor dem Import zur Prüfung angezeigt.
4. Namen werden nur bei eindeutiger Übereinstimmung zugeordnet.
5. Importierte Dienste starten mit dem Status `scheduled`. Bestehende Status wie Abmeldung, Übernahme oder Abschluss werden nicht aus einem Plan überschrieben.
6. Der Import muss vollständig erfolgreich sein oder vollständig fehlschlagen. Teilimporte sind zu vermeiden.
7. Demo-Daten und echte Dienste bleiben strikt getrennt.

## Versionsregeln

Eine inkompatible Änderung benötigt eine neue `schemaVersion`. Der Importer muss unbekannte Versionen verständlich ablehnen, statt Felder stillschweigend falsch zu interpretieren.
