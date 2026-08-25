import React, { useEffect, useState } from 'react';
import { 
  Lock, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  HardDrive, 
  Sparkles,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { ToolLandingContent } from '../lib/seoLandingData';

interface ToolLandingPageProps {
  content: ToolLandingContent;
  onLaunchTool: (toolId: string, subTool?: string) => void;
  onBackToHome: () => void;
}

export const ToolLandingPage: React.FC<ToolLandingPageProps> = ({
  content,
  onLaunchTool,
  onBackToHome
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Dynamic document title update for SEO & browser history
    document.title = content.metaTitle;
    
    // Update meta description if meta tag exists
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', content.metaDescription);
    }

    // Scroll to top upon landing
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = 'GS Softwares | 100% Private In-Browser File & Photo Studio';
    };
  }, [content]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content.h1,
        text: content.metaDescription,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
      {/* Top Navigation & Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold opacity-75 hover:opacity-100 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Studio Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="neu-button px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-all"
            title="Share this tool"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="neu-card p-6 sm:p-10 rounded-3xl space-y-6 relative overflow-hidden text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Client-Side WebAssembly
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Zero Server Uploads
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {content.h1}
          </h1>
          <p className="text-lg sm:text-xl font-bold text-cyan-400 opacity-95">
            {content.tagline}
          </p>
        </div>

        <p className="text-sm sm:text-base font-normal opacity-90 leading-relaxed max-w-3xl">
          {content.introParagraph}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={() => onLaunchTool(content.toolId, content.subTool)}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <span>{content.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 text-xs font-semibold opacity-75 justify-center sm:justify-start">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Forever</span>
            <span className="flex items-center gap-1"><HardDrive className="w-4 h-4 text-cyan-400" /> Works Offline</span>
          </div>
        </div>
      </header>

      {/* Mechanism & Architecture Section */}
      <section className="space-y-6 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {content.howItWorksTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.howItWorksParagraphs.map((p, idx) => (
            <div key={idx} className="neu-card p-6 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-cyan-400 font-bold text-xs">
                0{idx + 1}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                {p}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Privacy Matters Section */}
      <section className="neu-card p-6 sm:p-8 rounded-3xl space-y-4 border-l-4 border-l-cyan-500 text-left">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wide">
          <ShieldCheck className="w-5 h-5" />
          <h3>{content.whyPrivacyTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
          {content.whyPrivacyParagraph}
        </p>
      </section>

      {/* Step-by-Step Instructions */}
      <section className="space-y-6 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {content.stepsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {content.steps.map((s, idx) => (
            <div key={idx} className="neu-card p-6 rounded-2xl space-y-3 relative flex flex-col justify-between">
              <div className="space-y-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center">
                  {s.step}
                </span>
                <h4 className="text-base font-bold tracking-tight">
                  {s.title}
                </h4>
                <p className="text-xs opacity-75 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target FAQs (PAA Query Optimization) */}
      <section className="space-y-6 text-left">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs font-semibold opacity-70">
            Answers to common questions regarding local browser execution, security, and formats.
          </p>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="neu-card rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-4 hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm opacity-85 leading-relaxed border-t border-slate-500/10 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="neu-card p-8 sm:p-12 rounded-3xl text-center space-y-6">
        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black">
            Ready to process your files securely?
          </h3>
          <p className="text-xs sm:text-sm opacity-75">
            Instant results. Zero server uploads. Absolute privacy guaranteed by local browser execution.
          </p>
        </div>

        <button
          onClick={() => onLaunchTool(content.toolId, content.subTool)}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
        >
          <span>{content.actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </article>
  );
};
