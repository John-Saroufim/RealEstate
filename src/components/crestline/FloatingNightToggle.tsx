import { NightModeSwitch } from "@/components/crestline/NightModeSwitch";

/** For auth/misc pages without CrestlineNavbar */
export function FloatingNightToggle() {
  return (
    <div className="fixed top-24 right-4 z-[60] flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/90">
      <span className="mr-2 hidden text-xs font-medium text-slate-600 sm:inline">Night</span>
      <NightModeSwitch id="crestline-night-floating" />
    </div>
  );
}
