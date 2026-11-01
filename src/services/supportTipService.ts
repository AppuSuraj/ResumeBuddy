export const SUPPORT_MODAL_EVENT = 'resumebuddy_download_success';

export function triggerSupportTipModal(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SUPPORT_MODAL_EVENT));
  }
}

