import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Integritet och cookies",
  description:
    "Hur Receptbok hanterar personuppgifter, cookies och lokal lagring — inklusive inloggning via Supabase.",
};

export default function IntegritetPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <article className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Juridisk information
          </p>
          <h1 className="mt-2 text-4xl font-bold text-stone-950">
            Integritetspolicy
          </h1>
          <p className="mt-4 text-sm text-stone-500">
            Senast uppdaterad: 15 juni 2026
          </p>

          <section className="mt-8 space-y-4 text-stone-700 leading-8">
            <h2 className="text-xl font-semibold text-stone-950">
              1. Vem ansvarar för dina uppgifter?
            </h2>
            <p>
              Receptbok drivs av Eleonora Nocentini. För frågor om
              personuppgifter kan du kontakta{" "}
              <a
                href="mailto:eleonora.nocentini@gmail.com"
                className="font-medium text-emerald-700 hover:text-emerald-900"
              >
                eleonora.nocentini@gmail.com
              </a>
              .
            </p>

            <h2 className="text-xl font-semibold text-stone-950">
              2. Vilka uppgifter samlas in?
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Konto:</strong> e-postadress och lösenord (hashat) när du
                registrerar dig via Supabase Auth.
              </li>
              <li>
                <strong>Profil:</strong> valfritt visningsnamn kopplat till ditt
                konto.
              </li>
              <li>
                <strong>Recept och favoriter:</strong> recept du skapar och
                recept du sparar som favoriter när du är inloggad.
              </li>
              <li>
                <strong>Teknisk data:</strong> IP-adress, webbläsartyp och
                felrapporter kan behandlas vid drift och felsökning.
              </li>
            </ul>
            <p>
              Du kan använda receptbiblioteket utan konto. Då lagras inget konto
              hos oss, men viss data kan sparas lokalt i din webbläsare (se
              cookies nedan).
            </p>

            <h2 className="text-xl font-semibold text-stone-950">
              3. Varför behandlar vi uppgifterna?
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Tillhandahålla inloggning och sparade favoriter.</li>
              <li>Låta inloggade användare skapa och hantera egna recept.</li>
              <li>Driva, säkra och förbättra tjänsten.</li>
              <li>Felsöka tekniska problem i produktion.</li>
            </ul>
            <p>
              Rättslig grund är i huvudsak fullgörande av avtal (ditt konto) och
              berättigat intresse (drift, säkerhet och förbättring av tjänsten).
            </p>

            <h2 className="text-xl font-semibold text-stone-950">
              4. Var lagras uppgifterna?
            </h2>
            <p>
              Konto- och receptdata lagras i Supabase (PostgreSQL). Webbplatsen
              hostas av Netlify. Felrapportering kan ske via Sentry (EU-region
              när det är aktiverat). Dessa leverantörer behandlar data som
              personuppgiftsbiträden enligt sina egna villkor.
            </p>

            <h2 className="text-xl font-semibold text-stone-950">
              5. Hur länge sparas uppgifterna?
            </h2>
            <p>
              Konto och innehåll sparas tills du ber oss radera kontot eller tills
              du själv tar bort innehåll. Tekniska loggar och felrapporter
              behålls normalt en kortare tid enligt respektive tjänsts
              inställningar.
            </p>

            <h2 className="text-xl font-semibold text-stone-950">
              6. Dina rättigheter
            </h2>
            <p>Du har rätt att:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>begära tillgång till dina uppgifter,</li>
              <li>begära rättelse eller radering,</li>
              <li>invända mot viss behandling,</li>
              <li>lämna klagomål till Integritetsskyddsmyndigheten (IMY).</li>
            </ul>
            <p>
              För att radera ditt konto eller exportera dina uppgifter, kontakta{" "}
              <a
                href="mailto:eleonora.nocentini@gmail.com"
                className="font-medium text-emerald-700 hover:text-emerald-900"
              >
                eleonora.nocentini@gmail.com
              </a>
              .
            </p>
          </section>

          <section id="cookies" className="mt-12 space-y-4 text-stone-700 leading-8">
            <h2 className="text-2xl font-bold text-stone-950">Cookies och lokal lagring</h2>
            <p>
              Receptbok använder inte cookies för reklam eller spårning mellan
              webbplatser. Vi använder däremot nödvändiga cookies och lokal
              lagring för att tjänsten ska fungera.
            </p>

            <div className="overflow-x-auto">
              <table className="mt-4 w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-2 pr-4 font-semibold text-stone-950">Typ</th>
                    <th className="py-2 pr-4 font-semibold text-stone-950">Syfte</th>
                    <th className="py-2 font-semibold text-stone-950">Lagringstid</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-stone-100">
                    <td className="py-3 pr-4">Sessionscookies (Supabase Auth)</td>
                    <td className="py-3 pr-4">Håller dig inloggad mellan sidvisningar.</td>
                    <td className="py-3">Tills du loggar ut eller cookien löper ut.</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="py-3 pr-4">localStorage</td>
                    <td className="py-3 pr-4">
                      Lokala receptutkast, favorit-cache och cookie-meddelande.
                    </td>
                    <td className="py-3">Tills du rensar webbläsardata.</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="py-3 pr-4">sessionStorage</td>
                    <td className="py-3 pr-4">Snabbare laddning av receptlistan under besöket.</td>
                    <td className="py-3">Tills fliken stängs.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Service worker (PWA)</td>
                    <td className="py-3 pr-4">Cachar statiska resurser för snabbare åtkomst.</td>
                    <td className="py-3">Enligt cache-version i appen.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Nödvändiga cookies kan inte stängas av utan att inloggning slutar
              fungera. Du kan när som helst rensa cookies och lokal lagring i
              webbläsarens inställningar.
            </p>
          </section>

          <p className="mt-10 text-sm text-stone-600">
            <Link href="/about" className="font-semibold text-emerald-700">
              Tillbaka till Om projektet
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
