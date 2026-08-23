import { Link } from "wouter";
import { footerExploreLinks, footerPolicyLinks } from "@/lib/siteContent";
import React from "react";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-4 lg:px-8">
      <div className="grid gap-6 border-t border-white/10 py-8 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div>
          <p className="font-mono-ui text-[10px] tracking-[0.17em] text-primary">BACKGROUND REMOVEX</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">A clear source-aware workspace for authorized YouTube jobs and official music-catalog workflows.</p>
          <p className="mt-4 text-xs text-muted-foreground">© 2026 Background Removex. All rights reserved.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Explore</p>
          {footerExploreLinks.map((item) => item.href.includes("#") ? <a key={item.href} href={item.href} className="block text-muted-foreground transition hover:text-primary">{item.label}</a> : <Link key={item.href} href={item.href} className="block text-muted-foreground transition hover:text-primary">{item.label}</Link>)}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Use & privacy</p>
          {footerPolicyLinks.map((item) => <Link key={item.href} href={item.href} className="block text-muted-foreground transition hover:text-primary">{item.label}</Link>)}
        </div>
      </div>
    </footer>
  );
}
