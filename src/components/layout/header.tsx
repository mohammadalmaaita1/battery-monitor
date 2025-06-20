
'use client';

import { Wifi, WifiOff, CircleSlash, PanelLeft, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ConnectionStatus } from '@/components/battery-monitor';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  pageTitle?: string;
}

export default function Header({ connectionStatus, pageTitle }: HeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar();

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
    <header className="bg-card border-b sticky top-0 z-40 px-4 py-3 md:px-6 flex items-center justify-between h-16">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="h-8 w-8"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        {pageTitle && <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>}
      </div>
      <div className="flex items-center gap-2" title={title}>
        {icon}
        <span className="text-xs text-muted-foreground hidden sm:inline">{text}</span>
      </div>
    </header>
  );
}
