import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AuthMode = "login" | "register";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("Max Mustermann");
  const [email, setEmail] = useState("max@test.de");
  const [password, setPassword] = useState("test123");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      navigate("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentifizierung fehlgeschlagen."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="hero">
        <nav className="top-nav">
          <Link to="/">Zurück zur Übersicht</Link>
        </nav>

        <div className="hero__content">
          <p className="hero__eyebrow">QuestBoard Login</p>
          <h1>{mode === "login" ? "Einloggen" : "Registrieren"}</h1>
          <p className="hero__text">
            Testuser: max@test.de mit Passwort test123
          </p>
        </div>
      </header>

      <section className="content-section auth-section">
        <div className="section-heading">
          <p>Authentifizierung</p>
          <h2>{mode === "login" ? "Login" : "Registrierung"}</h2>
        </div>

        {errorMessage && <p className="error-state">{errorMessage}</p>}

        <form className="project-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Dein Name"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="max@test.de"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="test123"
            />
          </div>

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading
              ? "Bitte warten..."
              : mode === "login"
                ? "Einloggen"
                : "Registrieren"}
          </button>
        </form>

        <button
          className="secondary-button auth-switch"
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Noch kein Account? Registrieren"
            : "Schon Account? Einloggen"}
        </button>
      </section>
    </main>
  );
}