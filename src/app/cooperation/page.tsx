
import Header from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Linkedin } from 'lucide-react';

export default function CooperationPage() {
  const acknowledgements = [
    {
      name: 'Dr. Ali Al-Zayoud',
      role: 'CTO of ExelX',
      contribution: 'For his strategic vision and industry expertise.',
      linkedin: 'https://www.linkedin.com/in/ali-abdelrahman-90603b77/',
      avatarSrc: 'https://h.top4top.io/p_3454zz5i71.jpeg',
      avatarFallback: 'AZ',
      dataAiHint: 'profile business'
    },
    {
      name: 'Dr. Sami Al-Dalahmeh',
      role: 'Head of the Electrical Engineering Department at Al-Zaytoonah University',
      contribution: 'For his academic leadership and unwavering support for student projects.',
      linkedin: 'https://www.linkedin.com/in/sami-aldalahmeh-75ba728/',
      avatarSrc: 'https://i.top4top.io/p_3454fouxx2.jpeg',
      avatarFallback: 'SD',
      dataAiHint: 'profile academic'
    },
  ];

  return (
    <div className="flex flex-col flex-grow">
      <Header connectionStatus="initial" pageTitle="Our Cooperation" /> {/* Placeholder connectionStatus */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Our Cooperation</CardTitle>
            <CardDescription>
              Highlighting the valuable partnership between Al-Zaytoonah University of Jordan and ExelX.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="text-center">
                <Image
                    src="https://k.top4top.io/p_34515d0hd1.jpg"
                    alt="University and Company Partnership"
                    width={700}
                    height={300}
                    className="rounded-lg shadow-md mx-auto mb-6 object-contain"
                    data-ai-hint="university company"
                />
            </section>
            <section>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Battery Monitor project is a testament to the successful collaboration and shared vision
                between Al-Zaytoonah University of Jordan and ExelX. This partnership aims to foster innovation,
                practical learning, and the development of cutting-edge technological solutions.
              </p>
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Acknowledgements</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We extend our sincere gratitude for the invaluable support and guidance from:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
                {acknowledgements.map((person) => (
                  <Card key={person.name} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 bg-secondary/30 dark:bg-secondary/10">
                    <CardHeader className="flex flex-col items-center text-center">
                      <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                        <AvatarImage src={person.avatarSrc} alt={person.name} data-ai-hint={person.dataAiHint}/>
                        <AvatarFallback>{person.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl text-foreground">{person.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">{person.role}</CardDescription>
                       <Link href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} LinkedIn Profile`} className="mt-2">
                          <Linkedin size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                        </Link>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed text-center">
                        {person.contribution}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This project was implemented under their esteemed agreement, underscoring a commitment to bridging
                academia and industry for impactful outcomes.
              </p>
            </section>

            <section className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 mt-10">
                <div className="text-center p-4 rounded-lg shadow-md bg-secondary/30 dark:bg-secondary/10 hover:shadow-xl transition-shadow duration-300">
                    <Image
                        src="https://i.top4top.io/p_3451krr6q1.jpg" 
                        alt="Al-Zaytoonah University Logo"
                        width={180}
                        height={60}
                        className="mx-auto mb-3 object-contain"
                        data-ai-hint="university logo"
                    />
                    <Button asChild variant="outline">
                        <Link href="https://www.zuj.edu.jo/" target="_blank" rel="noopener noreferrer">
                        Visit Al-Zaytoonah University
                        </Link>
                    </Button>
                </div>
                <div className="text-center p-4 rounded-lg shadow-md bg-secondary/30 dark:bg-secondary/10 hover:shadow-xl transition-shadow duration-300">
                    <Image
                        src="https://j.top4top.io/p_3451vg8a12.jpg" 
                        alt="ExelX Logo"
                        width={150}
                        height={60}
                        className="mx-auto mb-3 object-contain bg-gray-700 dark:bg-gray-800 p-2 rounded" 
                        data-ai-hint="company logo"
                    />
                    <Button asChild variant="outline">
                        <Link href="https://exelx.net/" target="_blank" rel="noopener noreferrer">
                        Visit ExelX
                        </Link>
                    </Button>
                </div>
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
