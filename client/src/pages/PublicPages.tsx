import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { trpc } from "@/lib/trpc";
import { publicPageMetadata, searchSiteContent } from "@/lib/siteContent";
import { CheckCircle2, Clock3, FileText, Headphones, Mail, Search, ShieldCheck, Sparkles } from "lucide-react";
import React from "react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

type StaticPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  icon: typeof ShieldCheck;
  children: React.ReactNode;
};

function PublicPage({ eyebrow, title, intro, icon: Icon, children }: StaticPageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-noise opacity-60" />
      <div className="pointer-events-none fixed right-[-12rem] top-[-9rem] h-[30rem] w-[30rem] rounded-full bg-[#4a49ff]/15 blur-[120px]" />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-4xl px-5 pb-16 pt-12 lg:px-8 lg:pt-16">
        <div className="grid gap-7 md:grid-cols-[auto_1fr] md:items-start">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/25 bg-primary/[0.1] text-primary shadow-[0_18px_50px_rgba(255,188,71,0.1)]"><Icon className="h-6 w-6" /></div>
          <div>
            <p className="font-mono-ui text-xs tracking-[0.18em] text-primary">{eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{intro}</p>
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-white/10 bg-card/75 p-6 shadow-2xl shadow-black/15 backdrop-blur sm:p-9">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-white/10 py-7 first:pt-0 last:border-0 last:pb-0"><h2 className="text-xl font-extrabold">{title}</h2><div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">{children}</div></section>;
}

export function AboutPage() {
  return (
    <PublicPage {...publicPageMetadata.about} icon={Sparkles}>
      <ContentSection title="What this workspace does">
        <p>The site presents a dedicated, authenticated job-configuration flow for YouTube content that the user is authorized to download. It separately provides inspection-oriented flows for Spotify and Apple Music links.</p>
        <p>Spotify and Apple Music workflows are designed around catalog context and official service links, rather than protected-stream extraction.</p>
      </ContentSection>
      <ContentSection title="How to use it">
        <div className="grid gap-3 sm:grid-cols-3">
          {["Choose the source that matches the URL.", "Set the relevant authorized-workflow options.", "Review the outcome and continue through the supported path."].map((step, index) => <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><span className="font-mono-ui text-xs text-primary">0{index + 1}</span><p className="mt-3 text-sm font-semibold leading-5 text-foreground">{step}</p></div>)}
        </div>
      </ContentSection>
      <ContentSection title="Responsible use">
        <p>The product is structured to avoid DRM bypass, credential harvesting, and extraction of protected Spotify or Apple Music streams. Users remain responsible for ensuring that any YouTube job is authorized and lawful for their content and location.</p>
      </ContentSection>
      <div className="mt-7 flex flex-wrap gap-3"><Link href="/"><Button className="rounded-xl">Open workspace</Button></Link><Link href="/contact"><Button variant="outline" className="rounded-xl border-white/15 bg-white/[0.035]">Contact support</Button></Link></div>
    </PublicPage>
  );
}

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const submitMutation = trpc.site.contact.useMutation({
    onSuccess: () => {
      toast.success("Your message has been received.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMutation.mutate({ name, email, subject, message });
  };

  return (
    <PublicPage {...publicPageMetadata.contact} icon={Headphones}>
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.08] p-5"><Mail className="h-5 w-5 text-primary" /><h2 className="mt-3 font-extrabold">Use the support form</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Include only the details needed to understand your question. Do not send passwords, payment data, service credentials, or private media files.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="mt-3 font-extrabold">Account & content safety</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">The team cannot help bypass DRM, service safeguards, account access controls, or permissions for media you do not control.</p></div>
          <p className="text-xs leading-5 text-muted-foreground">By sending this form, you acknowledge the <Link href="/privacy" className="text-primary underline underline-offset-4">Privacy policy</Link> and <Link href="/terms" className="text-primary underline underline-offset-4">Terms of use</Link>.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:grid-cols-2" noValidate>
          <label className="block"><span className="font-mono-ui text-[10px] tracking-[0.15em] text-muted-foreground">NAME</span><input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" autoComplete="name" /></label>
          <label className="block"><span className="font-mono-ui text-[10px] tracking-[0.15em] text-muted-foreground">EMAIL</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" autoComplete="email" /></label>
          <label className="block sm:col-span-2"><span className="font-mono-ui text-[10px] tracking-[0.15em] text-muted-foreground">SUBJECT</span><input required value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
          <label className="block sm:col-span-2"><span className="font-mono-ui text-[10px] tracking-[0.15em] text-muted-foreground">MESSAGE</span><textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={7} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-background/60 px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><p className="text-xs text-muted-foreground">Messages may be reviewed to improve product support.</p><Button type="submit" disabled={submitMutation.isPending} className="rounded-xl">{submitMutation.isPending ? "Sending…" : "Send message"}</Button></div>
        </form>
      </div>
    </PublicPage>
  );
}

export function PrivacyPage() {
  return (
    <PublicPage {...publicPageMetadata.privacy} icon={ShieldCheck}>
      <ContentSection title="Information handled by the site"><p>The site processes the service URLs, job settings, and status details that a signed-in user submits for the selected workflow. The support form processes the name, email address, subject, and message that a visitor chooses to provide.</p><p>Basic service and security logs may be generated by the hosting, authentication, analytics, and infrastructure services used to operate the site.</p></ContentSection>
      <ContentSection title="Why information is used"><p>Information is used to operate the requested workflow, provide support, secure the service, diagnose errors, and understand service performance. Support messages are used to respond to the issue described and improve support operations.</p></ContentSection>
      <ContentSection title="Service boundaries"><p>Spotify and Apple Music links are handled for supported metadata and official playback-link workflows. The product does not ask visitors to submit provider passwords or retrieve protected streaming audio.</p></ContentSection>
      <ContentSection title="Your choices"><p>Do not submit information you do not want included in a support message. You may contact the site team through the support form to ask questions about the information connected to a request. Where applicable, requests will be handled under the site owner’s operational and legal obligations.</p></ContentSection>
      <ContentSection title="Policy updates"><p>As the product, infrastructure, or legal requirements change, this policy may be updated. The current version is displayed on this page.</p></ContentSection>
    </PublicPage>
  );
}

export function TermsPage() {
  return (
    <PublicPage {...publicPageMetadata.terms} icon={FileText}>
      <ContentSection title="Authorized use"><p>You may use the YouTube workflow only for content you own, control, or are otherwise authorized to download. You are responsible for ensuring that your use complies with the rights, permissions, platform terms, and laws that apply to you.</p></ContentSection>
      <ContentSection title="Restricted use"><p>You may not use the site to bypass DRM, access controls, payment restrictions, authentication safeguards, or other protective measures. Spotify and Apple Music workflows do not provide protected-audio downloading or account credential collection.</p></ContentSection>
      <ContentSection title="Accounts and submissions"><p>Keep your account access details secure. Submit accurate information when creating a job or asking for support, and do not send sensitive credentials or private content through the support form.</p></ContentSection>
      <ContentSection title="Availability"><p>Features may be changed, paused, or discontinued as the product evolves. A queued authorized-media job requires an appropriately configured external worker; a hosted interface alone does not guarantee that a media task will execute.</p></ContentSection>
      <ContentSection title="Questions"><p>Use the <Link href="/contact" className="text-primary underline underline-offset-4">contact page</Link> for questions about these terms, the privacy policy, or supported workflows.</p></ContentSection>
    </PublicPage>
  );
}

export function SearchPage() {
  const [, setLocation] = useLocation();
  const initialQuery = new URLSearchParams(window.location.search).get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const matches = useMemo(() => searchSiteContent(query), [query]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLocation(`/search?q=${encodeURIComponent(query.trim())}`); };

  return (
    <PublicPage {...publicPageMetadata.search} icon={Search}>
      <form onSubmit={submitSearch} className="flex gap-3"><label className="sr-only" htmlFor="site-search">Search the site</label><input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “privacy”, “support”, or “YouTube”" className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-background/60 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /><Button type="submit" className="rounded-xl">Search</Button></form>
      <div className="mt-8 space-y-3"><p className="font-mono-ui text-[10px] tracking-[0.15em] text-muted-foreground">{matches.length} RESULT{matches.length === 1 ? "" : "S"}</p>{matches.map((item) => <Link key={item.href} href={item.href} className="block rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-primary/40 hover:bg-primary/[0.04]"><h2 className="font-extrabold">{item.title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p></Link>)}{matches.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-muted-foreground">No matching pages yet. Try a broader search or visit the contact page for help.</div>}</div>
    </PublicPage>
  );
}
