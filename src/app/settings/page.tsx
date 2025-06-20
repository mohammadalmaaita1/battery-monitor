
import Header from '@/components/layout/header';
import SettingsDisplay from '@/components/settings-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-grow">
      <Header connectionStatus="initial" pageTitle="Application Settings" /> {/* Placeholder connectionStatus */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Application Settings</h2>
            <p className="text-muted-foreground">Configure frontend behavior and view backend information.</p>
        </div>
        
        <SettingsDisplay />

        {/* Removed the Backend Configuration card as it's handled within SettingsDisplay */}
        {/*
        <Card className="mt-8 shadow-lg">
            <CardHeader>
                <CardTitle>Backend Configuration (Read-only)</CardTitle>
                <CardDescription>
                    Information about the connected backend system. These values are set on the server.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Backend configuration details will appear here once fetched.</p>
            </CardContent>
        </Card>
        */}
         <footer className="py-6 text-center text-muted-foreground text-xs border-t mt-12">
            <p>&copy; {new Date().getFullYear()} Battery Sensei. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
    
