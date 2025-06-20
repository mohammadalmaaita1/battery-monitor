
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Settings,
  Info,
  Users,
  ShieldCheck,
  FileText,
  Wifi,
  WifiOff,
  CircleSlash,
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/components/battery-monitor'; 

interface SidebarNavProps {
  connectionStatus: ConnectionStatus; 
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about-us', label: 'About Us', icon: Info },
  { href: '/cooperation', label: 'Cooperation', icon: Users },
  { href: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
  { href: '/terms-of-service', label: 'Terms of Service', icon: FileText },
];

export function SidebarNav({ connectionStatus }: SidebarNavProps) {
  const pathname = usePathname();

  const getConnectionInfo = () => {
    if (connectionStatus === undefined) return { icon: <CircleSlash className="h-5 w-5 text-gray-400" />, text: "Status Unknown", title: "API Status Unknown" };

    switch (connectionStatus) {
      case 'connected':
        return { icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, text: "Connected", title: "API Connected (Initial data)" };
      case 'streaming':
        return { icon: <Zap className="h-5 w-5 text-green-400 animate-pulse" />, text: "Live Stream", title: "Connected to Live API Stream" };
      case 'connecting':
        return { icon: <Wifi className="h-5 w-5 text-yellow-500 animate-pulse" />, text: "Connecting...", title: "Connecting to API..." };
      case 'polling': 
        return { icon: <Wifi className="h-5 w-5 text-yellow-400 animate-pulse" />, text: "Polling...", title: "Polling API..." };
      case 'error':
        return { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, text: "Offline", title: "API Connection Error" };
      default: // initial or any other unhandled status
        return { icon: <CircleSlash className="h-5 w-5 text-gray-400" />, text: "Status Unknown", title: "API Status Unknown" };
    }
  };
  
  const { icon, text, title } = getConnectionInfo();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="p-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <Image
            src="https://c.top4top.io/p_3451ceapr1.png"
            alt="Battery Monitor Logo"
            width={32}
            height={32}
            className="object-contain rounded"
          />
          <span
            data-sidebar="logo-text"
            className="text-xl font-semibold text-foreground group-data-[collapsible=icon]/sidebar-wrapper:hidden"
          >
            Battery Monitor
          </span>
        </Link>
        <div className="ml-auto group-data-[collapsible=icon]/sidebar-wrapper:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <Separator className="bg-sidebar-border group-data-[collapsible=icon]/sidebar-wrapper:mx-0" />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                variant={pathname === item.href ? 'default' : 'ghost'}
                className={cn(
                  'justify-start w-full',
                  pathname === item.href ? 'bg-primary/20 text-primary hover:bg-primary/30 font-semibold' : 'hover:bg-sidebar-accent'
                )}
                tooltip={{
                  children: item.label,
                  side: 'right',
                  align: 'center',
                }}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-5 w-5 shrink-0" />
                  <span className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="bg-sidebar-border group-data-[collapsible=icon]/sidebar-wrapper:mx-0" />
      <SidebarFooter className="p-4 flex items-center justify-between" title={title}>
         <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            {text}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
