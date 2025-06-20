
import Header from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col flex-grow">
      <Header connectionStatus="initial" pageTitle="Terms of Service" /> {/* Placeholder connectionStatus */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Terms of Service</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the
              Battery Monitor application (the "Service") operated by the Battery Monitor Team ("us", "we", or "our").
            </p>
            <p>
              Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. USE OF THE SERVICE</h2>
              <p>
                Battery Monitor is provided "as is" for monitoring and diagnostic purposes related to lithium battery cells.
                You are responsible for ensuring the correct setup of hardware and software components.
                Incorrect use or interpretation of data may lead to undesired outcomes.
                Always exercise caution when working with electrical systems and batteries.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. AI DIAGNOSTICS</h2>
              <p>
                The AI diagnostic feature uses a Large Language Model (LLM) via Genkit. The information provided by the AI
                is for informational purposes only and should not be considered a definitive or professional diagnosis.
                Always consult with qualified professionals for critical decisions.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. DATA ACCURACY AND LIABILITY</h2>
              <p>
                While we strive to provide accurate data, we make no warranties regarding the accuracy, reliability,
                or completeness of any information provided by the Service. We shall not be liable for any damages
                arising from the use or inability to use the Service, or from reliance on any information provided.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. INTELLECTUAL PROPERTY</h2>
              <p>
                The Service and its original content (excluding user-provided data and third-party logos/trademarks),
                features, and functionality are and will remain the exclusive property of the Battery Monitor Team and its licensors.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. MODIFICATIONS TO SERVICE</h2>
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the Service or any part of it
                with or without notice.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. GOVERNING LAW</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the relevant jurisdiction,
                without regard to its conflict of law provisions.
              </p>
            </section>
             <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. CONTACT US</h2>
              <p>
                If you have any questions about these Terms, please contact us.
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
