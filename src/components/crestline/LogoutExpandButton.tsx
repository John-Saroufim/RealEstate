import { Link } from "react-router-dom";

/** Expand-on-hover logout control (Uiverse-style). Wrap reserves max width so nav does not reflow. */
export function LogoutExpandButton({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="logout-expand-btn-slot">
      <Link
        to="/logout"
        className="logout-expand-btn no-underline"
        aria-label="Log out"
        onClick={onNavigate}
      >
        <span className="logout-expand-btn__sign">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </span>
        <span className="logout-expand-btn__text">Log out</span>
      </Link>
    </div>
  );
}
