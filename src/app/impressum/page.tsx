import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#070707] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"><ArrowLeft size={17} />Zurück zu den Einstellungen</Link>
        <p className="mt-10 text-sm uppercase tracking-[0.2em] text-amber-300/75">MGB Connect</p>
        <h1 className="mt-2 text-4xl font-black">Impressum</h1>
        <div className="mt-8 space-y-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 leading-7 text-white/75 sm:p-8">
          <section><h2 className="text-lg font-bold text-white">Messdiener Gemeinschaft Baumberg</h2><p>Kath. Kirchengemeinde St. Gereon und Dionysius<br />Von-Ketteler-Str. 12<br />40789 Monheim am Rhein</p><p className="mt-3">E-Mail: <a className="text-amber-200 hover:underline" href="mailto:webmaster@mgbonline.de">webmaster@mgbonline.de</a><br />Telefon: 02173 / 965972</p></section>
          <section><h2 className="font-bold text-white">Rechtliche Angaben</h2><p>Körperschaft des öffentlichen Rechts</p><p>Vertreten durch Pfarrer Burkhard Hoffmann<br />Franz-Boehm-Str. 6<br />40789 Monheim am Rhein<br />Telefon: 02173 1014910<br />Telefax: 02173 10149129</p></section>
          <section><h2 className="font-bold text-white">Verantwortlicher im Datenschutz</h2><p>Erzbistum Köln<br />KKG St. Gereon und Dionysius<br />Franz-Boehm-Str. 6<br />40789 Monheim am Rhein<br />Deutschland</p><p>Telefon: 02173 1014910<br />E-Mail: <a className="text-amber-200 hover:underline" href="mailto:pastoralbuero-monheim@kkmonheim.de">pastoralbuero-monheim@kkmonheim.de</a></p></section>
          <section><h2 className="font-bold text-white">Datenschutzbeauftragter</h2><p>Edgar Thiel (betrieblicher Datenschutzbeauftragter)<br />Erzbistum Köln, Generalvikariat<br />Marzellenstr. 32<br />50668 Köln<br />Deutschland</p><p>Telefon: 0221 1642 1640<br />E-Mail: <a className="text-amber-200 hover:underline" href="mailto:edgar.thiel@erzbistum-koeln.de">edgar.thiel@erzbistum-koeln.de</a></p></section>
          <p className="border-t border-white/10 pt-5 text-sm text-white/45">Die Angaben wurden aus dem bestehenden MGB-Impressum übernommen. Bitte lasst sie vor dem öffentlichen Einsatz durch die Kirchengemeinde prüfen.</p>
          <a href="https://mgbonline.wordpress.com/impressum/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100">Original-Impressum öffnen <ExternalLink size={15} /></a>
          <Link href="/datenschutz" className="block text-sm font-semibold text-amber-200 hover:text-amber-100">Zu den Datenschutzhinweisen</Link>
        </div>
      </div>
    </main>
  );
}
