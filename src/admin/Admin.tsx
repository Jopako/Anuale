import {
  useState,
} from "react";

import "./admin.css";

const API_URL =
  import.meta.env.VITE_API_URL;

type LoginResponse = {
  token: string;
};

function Admin() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (!API_URL) {
        throw new Error(
          "VITE_API_URL não foi definida."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

    const data: LoginResponse | { error: string } = await response.json();

if (!response.ok) {
  setError("error" in data ? data.error : "Erro ao fazer login.");
  return;
}

if (!("token" in data)) {
  setError("Token não recebido.");
  return;
}

localStorage.setItem("anuale_admin_token", data.token);

window.location.href = "/anuale-admin/dashboard";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-brand">
          <span>ANUALE</span>

          <small>
            ADMINISTRATION
          </small>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>
              Painel Administrativo
            </h1>

            <p>
              Entre para gerenciar os
              desafios do ANUALE.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="admin-login-form"
          >
            <div className="admin-field">
              <label htmlFor="username">
                Usuário
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                autoComplete="username"
                placeholder="Digite seu usuário"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="password">
                Senha
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <p className="admin-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading
                ? "Entrando..."
                : "Entrar"}
            </button>
          </form>
        </div>

        <p className="admin-footer">
          ANUALE • Área restrita
        </p>
      </div>
    </main>
  );
}

export default Admin;