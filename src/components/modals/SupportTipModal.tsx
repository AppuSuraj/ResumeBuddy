import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Coffee, 
  X, 
  ExternalLink, 
  Sparkles, 
  Smartphone, 
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react';
import { SUPPORT_MODAL_EVENT } from '../../services/supportTipService';

interface TipTier {
  amount: number;
  label: string;
}

interface CopyVariant {
  id: 'A' | 'B' | 'C';
  title: string;
  body: string;
  tiers: TipTier[];
}

const COPY_VARIANTS: CopyVariant[] = [
  {
    id: 'A',
    title: 'Your resume is ready (and your wallet is untouched).',
    body: "We don't hold PDFs hostage behind sleazy ₹1,500/month recurring subscriptions. If ResumeBuddy just saved your weekend, consider fueling the developer with a coffee—or an absurdly specific Vanilla Hazelnut Iced Latte with extra cold foam and no regrets.",
    tiers: [
      { amount: 49, label: '₹49 Tapri Chai' },
      { amount: 99, label: '₹99 Filter Coffee' },
      { amount: 199, label: '₹199 Fancy Iced Latte' },
    ],
  },
  {
    id: 'B',
    title: 'Look ma, no $30 paywall!',
    body: 'Your high-res vector PDF is downloading. While the other guys demand your credit card on auto-debit forever, this runs on pure spite and caffeine. If this helped you dodge a corporate trap today, consider sponsoring a sip.',
    tiers: [
      { amount: 49, label: '₹49 Small Sip' },
      { amount: 99, label: '₹99 Solid Fuel' },
      { amount: 199, label: '₹199 Barista Status' },
    ],
  },
  {
    id: 'C',
    title: 'ATS-optimized. Downloaded. Completely free.',
    body: "Zero trackers, zero surprise paywalls right before your deadline. If this gets you past Workday's merciless bot and into an interview, balance out the universe by grabbing the developer a caffeine boost. An offering to the job hunt gods.",
    tiers: [
      { amount: 49, label: '₹49 Filter Kaapi' },
      { amount: 99, label: '₹99 Fancy Latte' },
      { amount: 199, label: '₹199 Hire Me Energy' },
    ],
  },
];

interface SupportTipModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SupportTipModal: React.FC<SupportTipModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(99);
  const [variant, setVariant] = useState<CopyVariant>(COPY_VARIANTS[0]);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isModalVisible = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledOnClose]);

  // Listen for global download success event to open modal automatically
  useEffect(() => {
    const handleDownloadSuccess = () => {
      // Pick a random copy variant every time the modal opens
      const randomIndex = Math.floor(Math.random() * COPY_VARIANTS.length);
      setVariant(COPY_VARIANTS[randomIndex]);
      setSelectedAmount(99);
      setCopiedUpi(false);

      // Graceful 600ms delay so download prompt and confetti animate first
      setTimeout(() => {
        if (!isControlled) {
          setInternalIsOpen(true);
        }
      }, 600);
    };

    window.addEventListener(SUPPORT_MODAL_EVENT, handleDownloadSuccess);
    return () => window.removeEventListener(SUPPORT_MODAL_EVENT, handleDownloadSuccess);
  }, [isControlled]);

  // When controlled isOpen changes to true, randomize variant
  useEffect(() => {
    if (controlledIsOpen) {
      const randomIndex = Math.floor(Math.random() * COPY_VARIANTS.length);
      setVariant(COPY_VARIANTS[randomIndex]);
      setSelectedAmount(99);
      setCopiedUpi(false);
    }
  }, [controlledIsOpen]);

  // Keyboard accessibility: Escape key to dismiss
  useEffect(() => {
    if (!isModalVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible, handleClose]);

  if (!isModalVisible) {
    return null;
  }

  // NPCI-Compliant UPI Deep Link Constants
  const upiId = import.meta.env.VITE_UPI_ID || 'surajsan1998@okicici';
  const payeeName = 'Suraj Suresh';
  const transactionNote = 'ResumeBuddy Coffee Fuel';
  
  // Dynamic UPI Intent payload with selected amount
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  const bmacHandle = import.meta.env.VITE_BUYMEACOFFEE_HANDLE || 'YOUR_HANDLE';
  const bmacUrl = `https://buymeacoffee.com/${bmacHandle}`;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // Fallback if clipboard API is blocked
      const textArea = document.createElement('textarea');
      textArea.value = upiId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans animate-in fade-in duration-200"
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Backdrop click dismiss area */}
      <div className="fixed inset-0 -z-10" onClick={handleClose} />

      {/* Main Modal Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative z-10 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Close Button Top-Right (Minimum 44px touch target) */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Hero Joke Typography */}
        <div className="flex flex-col items-center text-center mb-4 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-3">
            <span>☕ Support Independent Software</span>
          </div>

          <h2
            id="support-modal-title"
            className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-200 dark:via-orange-300 dark:to-amber-400 mb-3 leading-snug"
          >
            {variant.title}
          </h2>

          <div className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-left">
            {variant.body}
          </div>
        </div>

        {/* Tier Selector Buttons (Touch-friendly 44px+ targets) */}
        <div className="mb-4">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
            Choose Your Beverage Tier
          </div>
          <div className="grid grid-cols-3 gap-2">
            {variant.tiers.map((tier) => {
              const isSelected = selectedAmount === tier.amount;
              return (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => setSelectedAmount(tier.amount)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-xl text-xs font-semibold border transition flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-400 text-sky-800 dark:text-sky-200 shadow-md shadow-sky-500/15 ring-1 ring-sky-400/30'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-[11px] font-bold truncate max-w-full text-center">
                    {tier.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Vector UPI QR Container */}
        <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner mb-4">
          <div className="p-2.5 bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-sky-500/30 shadow-md">
            <QRCodeSVG
              value={upiUrl}
              size={150}
              bgColor="transparent"
              fgColor="#0284c7"
              level="M"
            />
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span>Scan with GPay, PhonePe, or Paytm to fuel the latte:</span>
            <span className="text-sky-700 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 px-2 py-0.5 rounded-full font-mono">
              ₹{selectedAmount}
            </span>
          </div>

          {/* Subtle Copy UPI ID micro-action button */}
          <button
            type="button"
            onClick={handleCopyUpiId}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 transition cursor-pointer min-h-[36px] shadow-xs"
            title="Click to copy UPI ID"
          >
            {copiedUpi ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied UPI ID!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy UPI ID: <strong className="text-sky-700 dark:text-sky-300 font-semibold">{upiId}</strong></span>
              </>
            )}
          </button>
        </div>

        {/* Direct Mobile Pay CTA (Mobile Touch Friendly 44px+ height) */}
        <div className="mb-3">
          <a
            href={upiUrl}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-[0.99] transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-sky-200" />
            <span>Pay ₹{selectedAmount} via Any UPI App</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* International Backchannel Link */}
        <div className="text-center mb-4 pt-1">
          <a
            href={bmacUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition group underline-offset-2 hover:underline min-h-[36px]"
          >
            <span>Outside India? Buy me a coffee via Card / PayPal</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition" />
          </a>
        </div>

        {/* Guilt-Free Empathetic Dismiss Action (Minimum 44px touch height) */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3">
          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-[44px] py-2.5 px-3 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer text-center flex items-center justify-center"
          >
            I&apos;m broke until payday, just give me my resume
          </button>
        </div>
      </div>
    </div>
  );
};
