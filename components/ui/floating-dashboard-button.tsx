"use client"

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface FloatingDashboardButtonProps {
  className?: string;
}

export function FloatingDashboardButton({ className }: FloatingDashboardButtonProps) {
  const pathname = usePathname();
  if (pathname === '/dashboard') return null;

  return (
    <Link
      href="/dashboard"
      aria-label="Vai alla Dashboard"
      className={cn(
        "fixed bottom-6 right-6 md:bottom-8 md:right-8",
        "z-50",
        "h-14 w-14",
        "opacity-90 hover:opacity-100",
        "bg-primary hover:bg-primary/90",
        "rounded-full",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
    >
      <Image
        src="/appuntoai_logo.png"
        alt="Dashboard"
        width={32}
        height={32}
        className="object-contain"
      />
    </Link>
  );
}
