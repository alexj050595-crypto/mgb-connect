import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#070707] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"><ArrowLeft size={17} />Zurück zu den Einstellungen</Link>
        <p className="mt-10 text-sm uppercase tracking-[0.2em] text-amber-300/75">MGB Connect</p>
        <h1 className="mt-2 text-4xl font-black">Datenschutzhinweise</h1>
        <div className="mt-8 space-y-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 leading-7 text-white/70 sm:p-8">
          <p>MGB Connect unterstützt die Organisation der Messdiener-Gemeinschaft. Dabei werden personenbezogene Daten verarbeitet, soweit dies für Benutzerkonten, Dienstplanung, Kommunikation und die Nutzung der App erforderlich ist.</p>
          <section><h2 className="text-lg font-bold text-white">Verantwortliche Stelle</h2><p>Erzbistum Köln – KKG St. Gereon und Dionysius<br />Franz-Boehm-Str. 6<br />40789 Monheim am Rhein<br />E-Mail: <a className="text-amber-200 hover:underline" href="mailto:pastoralbuero-monheim@kkmonheim.de">pastoralbuero-monheim@kkmonheim.de</a></p></section>
          <section><h2 className="text-lg font-bold text-white">Welche Daten können verarbeitet werden?</h2><p>Je nach bereitgestellten Funktionen sind dies insbesondere Name, Geburtsdatum, Anschrift, Telefonnummer, E-Mail-Adresse, Kontodaten, Rolle und Status innerhalb der Gemeinschaft sowie Dienst-, Tausch-, Anwesenheits- und Punktedaten.</p></section>
          <section><h2 className="text-lg font-bold text-white">Eingesetzte technische Dienste</h2><ul className="list-disc space-y-2 pl-5"><li><strong className="text-white">Supabase:</strong> Authentifizierung, Sitzungsverwaltung und Datenbankbetrieb.</li><li><strong className="text-white">Vercel:</strong> Hosting und technische Bereitstellung der Webanwendung.</li><li><strong className="text-white">Brevo:</strong> Versand transaktionaler E-Mails, insbesondere zur Kontobestätigung.</li></ul></section>
          <section><h2 className="text-lg font-bold text-white">Zwecke und Speicherdauer</h2><p>Die Verarbeitung dient der Bereitstellung und Absicherung der App sowie der Organisation der Messdiener-Gemeinschaft. Konkrete Rechtsgrundlagen, Speicherfristen, Auftragsverarbeitungsverträge und mögliche Drittlandübermittlungen müssen durch den Verantwortlichen anhand der tatsächlich gebuchten Anbieter- und Kontoeinstellungen festgelegt und geprüft werden.</p></section>
          <section><h2 className="text-lg font-bold text-white">Technisch notwendige Speicherung</h2><p>Für die Anmeldung und den Betrieb können technisch notwendige Sitzungsinformationen im Browser gespeichert werden. Diese sind für die geschützten Kontofunktionen erforderlich.</p></section>
          <section><h2 className="text-lg font-bold text-white">Deine Datenschutzrechte</h2><p>Für Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung oder weitere Datenschutzanliegen wende dich bitte an die verantwortliche Stelle oder den Datenschutzbeauftragten. Bei Konten von Kindern und Jugendlichen sollte die zuständige erwachsene Ansprechperson der Gemeinde einbezogen werden.</p></section>
          <section><h2 className="text-lg font-bold text-white">Datenschutzbeauftragter</h2><p>Edgar Thiel, Erzbistum Köln, Generalvikariat<br />Marzellenstr. 32, 50668 Köln<br />Telefon: 0221 1642 1640<br />E-Mail: <a className="text-amber-200 hover:underline" href="mailto:edgar.thiel@erzbistum-koeln.de">edgar.thiel@erzbistum-koeln.de</a></p></section>
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-sm leading-6 text-white/65">Wichtiger Hinweis: Diese Seite ist eine technische Erstinformation und noch keine abschließend geprüfte Datenschutzerklärung für MGB Connect. Insbesondere Rechtsgrundlagen, konkrete Speicherfristen, Anbieterstandorte, Drittlandtransfers und Verträge müssen von der Kirchengemeinde bzw. ihrem Datenschutzbeauftragten bestätigt werden. Die bestehende Datenschutzerklärung der Gemeinde bleibt maßgeblich, soweit sie auf diese Anwendung anwendbar ist.</div>
          <a href="https://mgbonline.wordpress.com/impressum/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100">Datenschutzangaben auf der MGB-Website öffnen <ExternalLink size={15} /></a>
          <Link href="/impressum" className="block text-sm font-semibold text-amber-200 hover:text-amber-100">Zum Impressum</Link>
        </div>
      </div>
    </main>
  );
}
