import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Base = {
  variant?: "default" | "hero";
  className?: string;
  children: React.ReactNode;
};

type AsLink = Base & { to: string; onClick?: () => void };
type AsButton = Base & { type?: "button" | "submit"; disabled?: boolean };

export type ContactPropertiesRippleProps = AsLink | AsButton;

function isLink(p: ContactPropertiesRippleProps): p is AsLink {
  return "to" in p && typeof p.to === "string";
}

/**
 * Uiverse cssbuttons-io ripple CTA for contact / property inquiry flows.
 * Pass `to` for a Link, or omit `to` and use `type`/`disabled` for a button.
 */
export function ContactPropertiesRippleButton(props: ContactPropertiesRippleProps) {
  const { variant = "default", className, children } = props;
  const cls = cn("contact-ripple-btn", variant === "hero" && "contact-ripple-btn--hero", className);

  if (isLink(props)) {
    return (
      <Link to={props.to} onClick={props.onClick} className={cls}>
        {children}
      </Link>
    );
  }

  const { type = "submit", disabled } = props;
  return (
    <button type={type} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
