import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-background" aria-hidden="true">
        <div className="auth-bg-base" />
        <div className="auth-bg-animation">
          <span className="bg-orb orb-one" />
          <span className="bg-orb orb-two" />
          <span className="bg-orb orb-three" />
        </div>
        <div className="auth-bg-blur" />
      </div>

      <nav className="auth-navbar">
        <div className="auth-navbar-inner">
          <Link to="/" className="brand-title">
            Resume Scanner
          </Link>
        </div>
      </nav>

      <main className="auth-main">
        <section className="auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </section>
      </main>

      <footer className="auth-footer">All rightts reserved by darkpheonix 444</footer>
    </div>
  );
}