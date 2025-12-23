import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ username, password });
      navigate("/admin");
    } catch (e) {
      setError(e.message || "Inloggen mislukt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="site-main">
      <section className="page">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Inloggen</h1>
            <p className="page-header__subtitle">
              Log in om het admin-paneel te gebruiken.
            </p>
          </div>
        </header>

        {error && <p className="text-red-600">{error}</p>}

        <form className="comments-section" onSubmit={onSubmit}>
          <label className="comment-form__label" htmlFor="username">
            Gebruikersnaam
          </label>
          <input
            id="username"
            className="search-group__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
          />

          <div style={{ height: "0.8rem" }} />

          <label className="comment-form__label" htmlFor="password">
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            className="search-group__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div style={{ marginTop: "1rem" }}>
            <button className="button button--primary" disabled={submitting}>
              {submitting ? "Bezig..." : "Inloggen"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
