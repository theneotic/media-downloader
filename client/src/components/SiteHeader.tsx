import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { policyNavigation, primaryNavigation } from "@/lib/siteContent";
import { Search, Sparkles } from "lucide-react";
import React from "react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

export function SiteHeader() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="relative z-20 mx-auto max-w-7xl px-5 pt-5 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/70 px-3 py-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,188,71,0.25)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-mono-ui text-[9px] tracking-[0.2em] text-primary">MEDIA UTILITY</span>
            <span className="block text-sm font-extrabold tracking-tight">Background Removex</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs font-semibold sm:order-2 sm:w-auto sm:border-0 sm:pt-0" aria-label="Primary navigation">
          <div className="flex items-center gap-1">
            {primaryNavigation.map((item) => (
              <a key={item.href} href={item.href} className="rounded-lg px-2.5 py-2 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {policyNavigation.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-2 py-2 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{item.label}</Link>)}
          </div>
        </nav>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          <form onSubmit={submitSearch} className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.035] px-2 sm:flex" role="search">
            <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search Background Removex"
              placeholder="Search"
              className="h-8 w-20 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/80 lg:w-28"
            />
          </form>
          {isAuthenticated ? (
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 font-mono-ui text-[9px] tracking-[0.1em] text-muted-foreground md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#55e38c] shadow-[0_0_10px_#55e38c]" /> CONTROL ROOM READY
            </span>
          ) : (
            <Button type="button" onClick={() => startLogin()} disabled={authLoading} variant="outline" className="h-9 rounded-xl border-white/15 bg-white/[0.035] px-3 text-xs hover:bg-white/[0.08]">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
