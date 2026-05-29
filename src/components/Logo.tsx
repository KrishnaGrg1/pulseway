import { Link } from "@tanstack/react-router";
import logo from "/pulsewayfavicon.svg";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="logo-link" aria-label="Pulseway home">
      <div className="logo-mark">
        <img src={logo} alt="Pulseway" className="h-7 w-7 md:h-8 md:w-8" />
        {!compact && <span className="logo-wordmark">Pulseway</span>}
      </div>
    </Link>
  );
}
