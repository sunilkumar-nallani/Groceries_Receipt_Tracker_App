"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, History, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/scan", label: "Scan", icon: Camera },
        { href: "/history", label: "History", icon: History },
        { href: "/insights", label: "Insights", icon: BarChart2 },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 w-full bg-background border-t-2 border-border pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-150",
                                isActive ? "text-primary dark:text-primary" : "text-muted-foreground hover:bg-muted/50 rounded-xl m-1"
                            )}
                        >
                            <div className={cn(
                                "flex flex-col items-center justify-center w-full h-full rounded-2xl border-2 border-transparent transition-all",
                                isActive && "border-primary/20 bg-primary/10"
                            )}>
                                <Icon className={cn(
                                    "transition-all",
                                    isActive ? "w-7 h-7 stroke-[2.5px]" : "w-6 h-6 stroke-2"
                                )} />
                                {isActive && <span className="text-[11px] font-bold tracking-wide mt-0.5">{link.label}</span>}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
