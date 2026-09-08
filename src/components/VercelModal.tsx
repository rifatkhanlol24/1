import React, { useState } from 'react';
import { X, Globe, Check, Copy, Terminal, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VercelModal: React.FC = () => {
  const { isVercelModalOpen, setIsVercelModalOpen, lang, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isVercelModalOpen) return null;

  const vercelConfig = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const copyConfig = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(vercelConfig);
      setCopied(true);
      showToast(lang === 'bn' ? 'vercel.json কনফিগ কপি করা হয়েছে!' : 'vercel.json copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {lang === 'bn' ? 'GitHub ও Vercel ডেপ্লয়মেন্ট গাইড' : 'GitHub & Vercel Deployment'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {lang === 'bn' ? 'তাত্ক্ষণিক ফ্রি হোস্টিং নির্দেশিকা' : '1-Click Free Hosting Ready'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVercelModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {lang === 'bn'
              ? 'আপনার প্রজেক্টের রুটে `vercel.json` প্রস্তুত রয়েছে!'
              : '`vercel.json` SPA configuration is pre-configured and active!'}
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
            <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>{lang === 'bn' ? 'GitHub-এ কোড পুশ করুন' : 'Push Code to GitHub'}</span>
            </p>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] pl-6 font-mono">
              git add . && git commit -m "Social media app" && git push origin main
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
            <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>{lang === 'bn' ? 'Vercel ড্যাশবোর্ডে ইমপোর্ট করুন' : 'Import in Vercel'}</span>
            </p>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] pl-6">
              Go to <strong>vercel.com/new</strong>, connect your GitHub account, and pick this repository.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
            <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>{lang === 'bn' ? 'স্বয়ংক্রিয় বিল্ড ও ডেপ্লয়' : 'Auto Build & Deploy'}</span>
            </p>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] pl-6">
              Framework Preset: <strong>Vite</strong>. Output Directory: <strong>dist</strong>. Click <strong>Deploy</strong> and your app will be live with a global CDN!
            </p>
          </div>
        </div>

        {/* vercel.json snippet */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-mono">
              vercel.json
            </span>
            <button
              onClick={copyConfig}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-2xl bg-neutral-900 text-neutral-200 text-[11px] font-mono overflow-x-auto border border-neutral-800">
            {vercelConfig}
          </pre>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsVercelModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow"
          >
            {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
