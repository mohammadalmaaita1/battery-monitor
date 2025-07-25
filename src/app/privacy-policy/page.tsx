
import Header from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col flex-grow">
      <Header connectionStatus="initial" pageTitle="Privacy Policy" /> {/* Placeholder connectionStatus */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Welcome to Battery Monitor. We are committed to protecting your personal information and your right to privacy.
              If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information,
              please contact us.
            </p>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. INFORMATION WE COLLECT</h2>
              <p>
                As Battery Monitor is primarily a local data monitoring tool interfacing with your hardware and optionally using
                a Genkit AI flow for diagnostics, we generally do not collect personal information directly through the application
                unless you voluntarily provide it (e.g., user context for AI diagnostics).
                The voltage data read from your battery cells is processed locally or sent to a backend you control.
                Data sent to AI models via Genkit is subject to the privacy policies of the AI model provider (e.g., Google).
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. HOW WE USE YOUR INFORMATION</h2>
              <p>
                Any information you provide (like user context for AI diagnostics) is used solely for the purpose of
                providing the requested service. Voltage data is used for display, historical logging, and diagnostics.
                We do not sell or share your personal data with third parties for marketing purposes.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. DATA STORAGE AND SECURITY</h2>
              <p>
                Voltage data is stored in a local MariaDB database configured on your backend system.
                Frontend settings may be stored in your browser's local storage.
                You are responsible for securing your backend environment and database.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. YOUR PRIVACY RIGHTS</h2>
              <p>
                Since we primarily process data you provide or that is generated by your hardware, your main rights
                involve managing your local data (e.g., clearing database entries, clearing browser storage).
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. CHANGES TO THIS PRIVACY NOTICE</h2>
              <p>
                We may update this privacy notice from time to time. The updated version will be indicated by an updated
                "Last updated" date and the updated version will be effective as soon as it is accessible.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. CONTACT US</h2>
              <p>
                If you have questions or comments about this notice, you may contact us through the information
                provided on the "About Us" page.
              </p>
            </section>
          </CardContent>
        </Card>
        <footer className="py-6 text-center text-muted-foreground text-xs border-t mt-12">
          <p>&copy; {new Date().getFullYear()} Battery Monitor. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
