import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { trpc } from "@/lib/trpc";
import {
  Apple,
  ArrowRight,
  Check,
  ChevronDown,
  FileAudio,
  Gauge,
  Info,
  Link2,
  Loader2,
  Music2,
  Play,
  RotateCcw,
  ShieldCheck,
  TerminalSquare,
  Youtube,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type Source = "youtube" | "spotify" | "appleMusic";

const sourceOptions: Array<{
  id: Source;
  label: string;
  eyebrow: string;
  description: string;
  accent: string;
  badge: string;
  icon: typeof Youtube;
}> = [
  {
    id: "youtube",
    label: "YouTube",
    eyebrow: "AUTHORIZED MEDIA",
    description: "Video, playlists, channels, and MP3 extraction.",
    accent: "bg-[#ff4d40] text-white",
    badge: "DOWNLOAD",
    icon: Youtube,
  },
  {
    id: "spotify",
    label: "Spotify",
    eyebrow: "CATALOG CONNECTION",
    description: "Playlist inspection, track metadata, and service links.",
    accent: "bg-[#1ed760] text-[#081d10]",
    badge: "METADATA",
    icon: Music2,
  },
  {
    id: "appleMusic",
    label: "Apple Music",
    eyebrow: "CATALOG CONNECTION",
    description: "Album and playlist metadata with official playback links.",
    accent: "bg-[#ffd2e8] text-[#351426]",
    badge: "METADATA",
    icon: Apple,
  },
];

const providerCopy: Record<Source, { placeholder: string; tip: string }> = {
  youtube: {
    placeholder: "Paste a video, playlist, or channel URL",
    tip: "For playlists and channels, select a collection scope before preparing the job.",
  },
  spotify: {
    placeholder: "Paste an open.spotify.com track, album, or playlist URL",
    tip: "Spotify links are inspected for catalog metadata and an official playback destination.",
  },
  appleMusic: {
    placeholder: "Paste a music.apple.com track, album, or playlist URL",
    tip: "Apple Music links are inspected for catalog metadata and an official playback destination.",
  },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-mono-ui text-[10px] font-medium tracking-[0.16em] text-muted-foreground">{children}</span>;
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        aria-label={label}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || min)))}
      />
    </label>
  );
}

export default function Home() {
  const [source, setSource] = useState<Source>("youtube");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [scope, setScope] = useState("video");
  const [quality, setQuality] = useState("best");
  const [workers, setWorkers] = useState(4);
  const [retries, setRetries] = useState(3);
  const [template, setTemplate] = useState("%(playlist_title)s/%(playlist_index)03d - %(title)s.%(ext)s");
  const [lastResult, setLastResult] = useState<{
    title: string;
    message: string;
    nextStep: string;
    urlRecognized: boolean;
  } | null>(null);
  const [lastJob, setLastJob] = useState<{
    id: string;
    status: string;
    createdAt: Date;
    scope: string;
    mode: string;
    outputUrl?: string | null;
  } | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const jobsQuery = trpc.media.jobs.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const selected = useMemo(
    () => sourceOptions.find((option) => option.id === source) ?? sourceOptions[0],
    [source],
  );
  const inspectMutation = trpc.media.inspect.useMutation({
    onSuccess: (result) => {
      setLastResult(result);
      toast.success(result.urlRecognized ? "Link is ready for the selected workflow." : "Link saved, but the service host does not match your selection.");
    },
    onError: (error) => toast.error(error.message),
  });
  const jobMutation = trpc.media.jobs.createYouTube.useMutation({
    onSuccess: (job) => {
      setLastJob(job);
      setLastResult({
        title: "Authorized YouTube job queued",
        message: "The job specification is stored and ready for a configured media worker to claim.",
        nextStep: "Keep this page open to follow the worker-reported status once a worker is connected.",
        urlRecognized: true,
      });
      toast.success("Authorized YouTube job queued.");
    },
    onError: (error) => toast.error(error.message),
  });
  const activeJob = useMemo(() => {
    if (!lastJob) return null;
    return jobsQuery.data?.find((job) => job.id === lastJob.id) ?? lastJob;
  }, [jobsQuery.data, lastJob]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("Paste a service URL to continue.");
      return;
    }
    if (source === "youtube") {
      if (!isAuthenticated) {
        toast.message("Sign in to save an authorized YouTube job.");
        startLogin();
        return;
      }
      jobMutation.mutate({
        url: url.trim(),
        mode,
        scope: scope as "video" | "playlist" | "channel",
        quality: quality as "best" | "1080" | "720" | "480" | "360",
        outputTemplate: template,
        workers,
        retries,
      });
      return;
    }
    inspectMutation.mutate({ source, url: url.trim() });
  };

  const resetWorkspace = () => {
    setUrl("");
    setLastResult(null);
    setLastJob(null);
    toast.message("Workspace reset.");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-noise opacity-60" />
      <div className="pointer-events-none fixed left-1/2 top-0 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[#4a49ff]/15 blur-[120px]" />

      <SiteHeader />

      <main id="workspace" className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8">
        <section className="grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1fr_330px] lg:items-end">
          <div>
            <p className="font-mono-ui text-xs tracking-[0.2em] text-primary">ONE URL. ONE CLEAR WORKFLOW.</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Route media with intent, not guesswork.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Select a source, paste a link, and configure the workflow that service actually supports. YouTube jobs are designed for authorized media. Spotify and Apple Music stay within official catalog and playback-link boundaries.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/25 bg-primary/[0.08] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold">Built with service boundaries in view</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">No DRM bypass, credential harvesting, or protected-stream extraction.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3 md:grid-cols-3" aria-label="Choose a media source">
          {sourceOptions.map((option) => {
            const Icon = option.icon;
            const active = option.id === source;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSource(option.id);
                  setLastResult(null);
                }}
                className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition duration-200 ${active ? "border-primary bg-white/[0.075] shadow-[0_14px_45px_rgba(0,0,0,0.2)]" : "border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/[0.05]"}`}
                aria-pressed={active}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${option.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono-ui rounded-full border border-white/10 px-2 py-1 text-[9px] tracking-[0.12em] text-muted-foreground">{option.badge}</span>
                </div>
                <p className="mt-6 font-mono-ui text-[10px] tracking-[0.15em] text-muted-foreground">{option.eyebrow}</p>
                <h3 className="mt-1 text-xl font-extrabold">{option.label}</h3>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{option.description}</p>
                {active && <span className="absolute bottom-0 left-0 h-1 w-full bg-primary" />}
              </button>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-card/80 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${selected.accent}`}>
                  <selected.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono-ui text-[10px] tracking-[0.16em] text-primary">SELECTED SOURCE</p>
                  <h3 className="text-xl font-extrabold">{selected.label} workspace</h3>
                </div>
              </div>
              <button type="button" onClick={resetWorkspace} className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <div className="mt-6">
              <label className="block">
                <FieldLabel>{selected.label.toUpperCase()} URL</FieldLabel>
                <div className="relative mt-2">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder={providerCopy[source].placeholder}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    aria-label={`${selected.label} URL`}
                  />
                </div>
              </label>
              <p className="mt-2 flex gap-2 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{providerCopy[source].tip}</p>
            </div>

            {source === "youtube" ? (
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <FieldLabel>OUTPUT</FieldLabel>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["video", "audio"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMode(value)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${mode === value ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-transparent text-muted-foreground hover:bg-white/[0.05]"}`}
                      >
                        {value === "video" ? <Play className="h-4 w-4" /> : <FileAudio className="h-4 w-4" />}
                        {value === "video" ? "Video" : "MP3 audio"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <FieldLabel>COLLECTION SCOPE</FieldLabel>
                  <div className="relative mt-3">
                    <select value={scope} onChange={(event) => setScope(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-background px-3 text-sm font-semibold outline-none focus:border-primary">
                      <option value="video">Single video</option>
                      <option value="playlist">Entire playlist</option>
                      <option value="channel">Channel uploads</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:col-span-2">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <label className="block">
                      <FieldLabel>QUALITY</FieldLabel>
                      <div className="relative mt-2">
                        <select value={quality} onChange={(event) => setQuality(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-background px-3 text-sm outline-none focus:border-primary">
                          <option value="best">Best available</option>
                          <option value="1080">Up to 1080p</option>
                          <option value="720">Up to 720p</option>
                          <option value="480">Up to 480p</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </label>
                    <NumberInput label="WORKERS" value={workers} onChange={setWorkers} min={1} max={16} />
                    <NumberInput label="RETRIES" value={retries} onChange={setRetries} min={0} max={10} />
                  </div>
                </div>

                <label className="block md:col-span-2">
                  <FieldLabel>FILENAME TEMPLATE</FieldLabel>
                  <input value={template} onChange={(event) => setTemplate(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 font-mono-ui text-xs text-foreground outline-none focus:border-primary" aria-label="Filename template" />
                </label>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-5">
                <div className="flex gap-3">
                  <TerminalSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">Official API connector required</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">This workflow validates the link now. Catalog metadata retrieval is ready to connect to {source === "spotify" ? "Spotify Web API credentials" : "Apple Music MusicKit credentials"}. Protected audio remains in the provider&apos;s app.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4 text-primary" />{source === "youtube" ? `${scope} · ${mode === "audio" ? "MP3" : quality} · ${workers} workers · ${retries} retries` : "Catalog metadata + official playback link"}</div>
              <Button type="submit" size="lg" disabled={inspectMutation.isPending || jobMutation.isPending} className="rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-[0_12px_30px_rgba(255,188,71,0.18)] hover:bg-primary/90">
                {inspectMutation.isPending || jobMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {source === "youtube" ? (isAuthenticated ? "Queue authorized job" : "Sign in to queue") : "Inspect link"}
              </Button>
            </div>
          </form>

          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-card/65 p-5">
              <p className="font-mono-ui text-[10px] tracking-[0.16em] text-primary">WORKFLOW STATUS</p>
              {activeJob && (
                <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/[0.08] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-ui text-[10px] tracking-[0.14em] text-primary">JOB {activeJob.id.slice(0, 8)}</span>
                    <span className="rounded-full bg-primary px-2 py-1 font-mono-ui text-[9px] font-semibold tracking-[0.12em] text-primary-foreground">{activeJob.status.toUpperCase()}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold">{activeJob.scope} · {activeJob.mode}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Created at {new Date(activeJob.createdAt).toLocaleTimeString()}. Status refreshes every five seconds while you are signed in.</p>
                  {activeJob.outputUrl && <a href={activeJob.outputUrl} className="mt-3 inline-flex text-xs font-bold text-primary underline underline-offset-4">Open completed file</a>}
                </div>
              )}
              {lastResult ? (
                <div className="mt-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-ui text-[10px] tracking-[0.1em] ${lastResult.urlRecognized ? "bg-[#55e38c]/15 text-[#8af1b0]" : "bg-primary/15 text-primary"}`}>
                    <Check className="h-3 w-3" />{lastResult.urlRecognized ? "LINK RECOGNIZED" : "CHECK SERVICE HOST"}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{lastResult.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{lastResult.message}</p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="font-mono-ui text-[10px] tracking-[0.14em] text-muted-foreground">NEXT STEP</p>
                    <p className="mt-1 text-xs leading-5 text-foreground/85">{lastResult.nextStep}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-4 text-sm leading-6 text-muted-foreground">Paste a URL and prepare the selected workflow. This panel will explain the available next step.</div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <p className="font-mono-ui text-[10px] tracking-[0.16em] text-primary">SOURCE MAP</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#ff4d40]" /><p className="text-sm"><strong>YouTube</strong><span className="block text-xs text-muted-foreground">Authorized download workflow</span></p></div>
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#1ed760]" /><p className="text-sm"><strong>Spotify</strong><span className="block text-xs text-muted-foreground">Metadata and official links</span></p></div>
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#ffd2e8]" /><p className="text-sm"><strong>Apple Music</strong><span className="block text-xs text-muted-foreground">Metadata and official links</span></p></div>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
