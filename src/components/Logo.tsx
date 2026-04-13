import { Link } from "@tanstack/react-router";
import logo from "/pulsewayfavicon.svg";
export default function Logo() {
  return (
    <Link to="/">
      <div className="logo-mark">
        <img src={logo} alt="Pulseway" className="w-8 h-8" />
        <span className="logo-mark">Pulseway</span>
      </div>
    </Link>
  );
}
