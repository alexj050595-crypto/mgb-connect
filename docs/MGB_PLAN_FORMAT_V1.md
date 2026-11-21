# MGB Connect – Plan-Dateiformat (Version 2)

## Ziel und technische Form

Eine .mgb-Datei ist UTF-8-kodiertes JSON mit einer versionierten Hülle. Sie enthält Termine und die Namenskürzel aus dem Quellplan, aber keine installationsgebundenen Supabase-IDs.

- Dateiendung: .mgb
- MIME-Typ: application/vnd.mgb-connect.plan+json
- Kennung: format = "mgb-connect-plan"
- Version: schemaVersion = 2
- Quellformate: pdf, xlsx, manual, mgb
- Maximal 500 Termine und 80 Kürzel pro Termin.

## Datenmodell

Die Datei enthält createdAt, optional sourceFileName, sourceFormat und appointments.

Jeder Termin enthält title, dateISO (YYYY-MM-DD), time (HH:MM), notes (Textliste), assignedNames (Liste aller Kürzel) und optional points (ganze Zahl von 0 bis 1000; Standardwert 0).

Die vier Namensspalten werden zusammengeführt; ihre Position hat keine fachliche Bedeutung. Ein Termin ohne Kürzel bleibt erhalten und wird als nicht zugewiesener Eintrag importiert.

Die Quelldateien enthalten keine verlässlichen Angaben zu Ort, Leiter oder Punkten. Diese Werte werden nicht erfunden: Ort und Leiter bleiben leer, Punkte starten mit 0 und können in der Vorschau bearbeitet werden. Hinweise werden in das vorhandene Feld Treffpunkt/Hinweis übernommen.

## Kürzel-Zuordnung

- Gespeichert wird das normalisierte vollständige Kürzel mit einer Profil-ID.
- Nachname und Initiale dienen nur als Vorschlag für mögliche Profile.
- Auch ein einzelner Kandidat muss beim ersten Mal ausdrücklich bestätigt werden.
- Bei mehreren Treffern wird manuell ausgewählt.
- Nur bestätigte Zuordnungen werden dauerhaft gespeichert.
- .mgb-Dateien enthalten weiterhin nur Kürzel, keine Profil-IDs.

## Importregeln

1. Quelldatei und Dateigröße werden geprüft.
2. PDF-/Excel-Daten landen in einer bearbeitbaren Vorschau.
3. Pro zugewiesener Person wird ein Datenbankeintrag erzeugt. Termine ohne Personen bleiben als nicht zugewiesener Eintrag erhalten.
4. Importierte Einträge erhalten den Status scheduled.
5. Vorhandene Dienste werden nicht überschrieben; Duplikate führen zum Abbruch.
6. Der Import erfolgt transaktional: alles oder nichts.
7. Demo- und echte Daten bleiben getrennt.

Version 1 war ein nicht produktiver Entwurf. Die aktuelle Version 2 verwendet das Terminmodell mit einer Liste von Kürzeln. Unbekannte Versionen werden abgelehnt.

## Quellimport (PDF und Excel)

Die Importseite verarbeitet zusätzlich direkt:
- `.xlsx` und `.xls`: erstes Tabellenblatt, Datum in Spalte B, Uhrzeit in Spalte C, Hinweise in A:C und Namenskürzel in D:G. Fortsetzungszeilen ohne neues Datum werden dem vorherigen Termin zugeordnet. Datumsangaben innerhalb eines Hinweises (z. B. eine Probenzeit) starten keinen neuen Dienst.
- `.pdf`: auslesbare Textebene mit Datum/Uhrzeit und positionsbasierten Textzeilen. Die erkannten Namen und Hinweise werden in die Vorschau übernommen.

PDF-Dateien ohne Textebene (reine Scans) benötigen OCR. OCR ist derzeit nicht enthalten; solche Dateien werden mit einer verständlichen Fehlermeldung abgelehnt. Handschriftliche Ergänzungen und ungewöhnliche Kürzelformate müssen in jedem Fall in der Vorschau geprüft werden. Die Originaldateien werden nicht an einen externen KI-Dienst gesendet.
