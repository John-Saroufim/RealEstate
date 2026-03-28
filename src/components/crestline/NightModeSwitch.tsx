import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Uiverse sun/moon toggle (satyamchaudharydev) — wired to next-themes `class="dark"`.
 */
export function NightModeSwitch({ id = "crestline-night-mode" }: { id?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  if (!mounted) {
    return (
      <span
        className="crestline-night-switch crestline-night-switch--placeholder inline-block align-middle"
        style={{ width: "3.5em", height: "2em" }}
        aria-hidden
      />
    );
  }

  return (
    <label htmlFor={id} className="crestline-night-switch inline-flex cursor-pointer align-middle" title={isDark ? "Night mode on" : "Night mode off"}>
      <input
        id={id}
        type="checkbox"
        checked={isDark}
        onChange={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      />
      <span className="crestline-night-slider" />
    </label>
  );
}
