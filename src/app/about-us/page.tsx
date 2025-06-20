
import Header from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Github, Linkedin, Mail } from 'lucide-react'; // Example icons

export default function AboutUsPage() {
  const teamMembers = [
    {
      name: 'Mohammad Almaaita',
      role: 'Team Leader / Full-Stack Engineer',
      description: "Spearheaded the project from conception to deployment, architecting and implementing the responsive Next.js frontend and the robust Python Flask backend, ensuring seamless API integration and optimal system performance.",
      avatarSrc: 'https://c.top4top.io/p_3458pjgp62.jpg',
      avatarFallback: 'MA',
      dataAiHint: 'profile person',
    },
    {
      name: 'Zead Shalash',
      role: 'Embedded Systems Engineer & Hardware Specialist',
      description: "Directed the hardware design, sensor selection (PCF8591 ADC), and physical implementation. Led the I2C communication interface between the ADC and the backend for accurate and reliable battery cell data acquisition.",
      avatarSrc: 'https://d.top4top.io/p_3458i17ri3.jpg',
      avatarFallback: 'ZS',
      dataAiHint: 'profile engineer',
    },
    {
      name: 'Abdalrahman Abualrous',
      role: 'Backend Engineer / API Development & Data Processing Officer',
      description: "Developed critical backend API endpoints using Python Flask, focusing on efficient data processing, storage interactions, and ensuring robust data transfer mechanisms for the application.",
      avatarSrc: 'https://b.top4top.io/p_34583mtm11.jpg',
      avatarFallback: 'AA',
      dataAiHint: 'profile developer',
    },
    {
      name: 'Ala\'a Awwad',
      role: 'Database Administrator (DB Admin)',
      description: "Designed and implemented the MariaDB database schema, focusing on efficient data storage, indexing strategies, and reliable retrieval of historical voltage data for analysis.",
      avatarSrc: 'https://f.top4top.io/p_3458798mg1.png',
      avatarFallback: 'AW',
      dataAiHint: 'profile data',
    },
  ];

  return (
    <div className="flex flex-col flex-grow">
      <Header connectionStatus="initial" pageTitle="About Us" /> {/* Placeholder connectionStatus */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">About Battery Monitor</CardTitle>
            <CardDescription>Learn more about our project, its goals, and the dedicated team behind it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Project Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                Battery Monitor is a real-time lithium battery monitoring system designed to provide users with
                detailed insights into the health and performance of multi-cell battery packs. Our core features
                include a live voltage dashboard, historical data logging and charting, CSV data export,
                and AI-powered diagnostic report generation. The system utilizes a Raspberry Pi with a PCF8591 ADC
                to read cell voltages, a Python Flask backend to process and serve data, and a Next.js frontend
                for a responsive and user-friendly interface.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Our Goals</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 pl-5">
                <li>Provide accurate, real-time voltage monitoring for up to 4 battery cells.</li>
                <li>Offer a clear and intuitive dashboard for easy visualization of battery status.</li>
                <li>Enable users to track voltage trends over time through historical data.</li>
                <li>Facilitate data analysis by allowing users to download voltage readings in CSV format.</li>
                <li>Leverage AI to generate diagnostic reports and provide insights into battery health.</li>
                <li>Create a reliable and educational tool for battery enthusiasts and professionals.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Meet the Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {teamMembers.map((member) => (
                  <Card key={member.name} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300 bg-secondary/30 dark:bg-secondary/10">
                    <CardHeader className="flex flex-col items-center text-center">
                      <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                        <AvatarImage src={member.avatarSrc} alt={member.name} data-ai-hint={member.dataAiHint} />
                        <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl text-foreground">{member.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed text-center">
                        {member.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
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
