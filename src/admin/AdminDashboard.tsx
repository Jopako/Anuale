import {
  useEffect,
  useState,
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL;

type Question = {
  id: number;
  year: string;
  date: string | null;
  clues: string[];
};

type FormData = {
  year: string;
  date: string;
  clues: string[];
};

const emptyForm: FormData = {
  year: "",
  date: "",
  clues: [
    "",
    "",
    "",
    "",
  ],
};

function AdminDashboard() {
  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [formData, setFormData] =
    useState<FormData>(
      emptyForm
    );

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  async function fetchQuestions() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "anuale_admin_token"
        );

      if (!token) {
        window.location.href =
          "/anuale-admin";

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/questions`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.status === 401) {
        localStorage.removeItem(
          "anuale_admin_token"
        );

        window.location.href =
          "/anuale-admin";

        return;
      }

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as perguntas."
        );
      }

      const data: Question[] =
        await response.json();

      setQuestions(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao carregar perguntas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  function handleLogout() {
    localStorage.removeItem(
      "anuale_admin_token"
    );

    window.location.href =
      "/anuale-admin";
  }

  function openCreateForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(
    question: Question
  ) {
    setEditingId(question.id);

    setFormData({
      year: question.year,
      date: question.date ?? "",
      clues: [
        question.clues[0] ?? "",
        question.clues[1] ?? "",
        question.clues[2] ?? "",
        question.clues[3] ?? "",
      ],
    });

    setFormError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
  }

  function updateClue(
    index: number,
    value: string
  ) {
    setFormData((prev) => {
      const clues = [
        ...prev.clues,
      ];

      clues[index] = value;

      return {
        ...prev,
        clues,
      };
    });
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setFormError("");
    setSuccess("");
    setSaving(true);

    try {
      const token =
        localStorage.getItem(
          "anuale_admin_token"
        );

      if (!token) {
        window.location.href =
          "/anuale-admin";

        return;
      }

      const isEditing =
        editingId !== null;

      const url = isEditing
        ? `${API_URL}/api/admin/questions/${editingId}`
        : `${API_URL}/api/admin/questions`;

      const response =
        await fetch(url, {
          method: isEditing
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            year: formData.year,
            date: formData.date,
            clues: formData.clues,
          }),
        });

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "anuale_admin_token"
        );

        window.location.href =
          "/anuale-admin";

        return;
      }

      const data:
        | {
            message: string;
            question: Question;
          }
        | {
            error: string;
          } = await response.json();

      if (!response.ok) {
        throw new Error(
          "error" in data
            ? data.error
            : "Erro ao salvar pergunta."
        );
      }

      setSuccess(
        isEditing
          ? "Pergunta atualizada com sucesso."
          : "Pergunta criada com sucesso."
      );

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);

      await fetchQuestions();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Erro ao salvar pergunta."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    question: Question
  ) {
    const confirmed =
      window.confirm(
        `Tem certeza que deseja excluir a pergunta do ano ${question.year}?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(question.id);
    setError("");
    setSuccess("");

    try {
      const token =
        localStorage.getItem(
          "anuale_admin_token"
        );

      if (!token) {
        window.location.href =
          "/anuale-admin";

        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/admin/questions/${question.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "anuale_admin_token"
        );

        window.location.href =
          "/anuale-admin";

        return;
      }

      const data:
        | {
            message: string;
          }
        | {
            error: string;
          } = await response.json();

      if (!response.ok) {
        throw new Error(
          "error" in data
            ? data.error
            : "Erro ao excluir pergunta."
        );
      }

      setSuccess(
        "Pergunta excluída com sucesso."
      );

      await fetchQuestions();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao excluir pergunta."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-brand">
              ANUALE
            </span>

            <h1>
              Painel Administrativo
            </h1>

            <p>
              Gerencie as perguntas e
              desafios do jogo.
            </p>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </header>

        {success && (
          <div className="admin-success">
            {success}
          </div>
        )}

        {showForm && (
          <section className="admin-form-section">
            <div className="admin-form-header">
              <div>
                <h2>
                  {editingId !== null
                    ? "Editar pergunta"
                    : "Nova pergunta"}
                </h2>

                <p>
                  Preencha os dados do
                  desafio.
                </p>
              </div>

              <button
                type="button"
                className="admin-close-button"
                onClick={closeForm}
                disabled={saving}
              >
                Fechar
              </button>
            </div>

            <form
              className="admin-question-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="year">
                    Ano
                  </label>

                  <input
                    id="year"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={
                      formData.year
                    }
                    onChange={(
                      event
                    ) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          year:
                            event.target.value
                              .replace(
                                /\D/g,
                                ""
                              ),
                        })
                      )
                    }
                    placeholder="Ex.: 2010"
                    required
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="date">
                    Data do desafio
                  </label>

                  <input
                    id="date"
                    type="date"
                    value={
                      formData.date
                    }
                    onChange={(
                      event
                    ) =>
                      setFormData(
                        (prev) => ({
                          ...prev,
                          date:
                            event.target.value,
                        })
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-clues">
                {formData.clues.map(
                  (
                    clue,
                    index
                  ) => (
                    <div
                      className="admin-field"
                      key={index}
                    >
                      <label
                        htmlFor={`clue-${index}`}
                      >
                        Dica {index + 1}
                      </label>

                      <textarea
                        id={`clue-${index}`}
                        value={clue}
                        onChange={(
                          event
                        ) =>
                          updateClue(
                            index,
                            event
                              .target
                              .value
                          )
                        }
                        placeholder={`Digite a dica ${index + 1}`}
                        rows={3}
                        required
                      />
                    </div>
                  )
                )}
              </div>

              {formError && (
                <div className="admin-form-error">
                  {formError}
                </div>
              )}

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Salvando..."
                    : editingId !== null
                      ? "Salvar alterações"
                      : "Cadastrar pergunta"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="admin-questions-section">
          <div className="admin-section-header">
            <div>
              <h2>
                Perguntas
              </h2>

              <p>
                {questions.length}{" "}
                {questions.length === 1
                  ? "pergunta cadastrada"
                  : "perguntas cadastradas"}
              </p>
            </div>

            {!showForm && (
              <button
                type="button"
                className="admin-primary-button"
                onClick={
                  openCreateForm
                }
              >
                + Nova pergunta
              </button>
            )}
          </div>

          {loading && (
            <div className="admin-state">
              Carregando perguntas...
            </div>
          )}

          {error && (
            <div className="admin-state admin-state-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            questions.length ===
              0 && (
              <div className="admin-state">
                Nenhuma pergunta
                cadastrada.
              </div>
            )}

          {!loading &&
            !error &&
            questions.length >
              0 && (
              <div className="admin-question-list">
                {questions.map(
                  (question) => (
                    <article
                      key={
                        question.id
                      }
                      className="admin-question-card"
                    >
                      <div className="admin-question-info">
                        <div className="admin-question-id">
                          #
                          {
                            question.id
                          }
                        </div>

                        <div className="admin-question-main">
                          <div className="admin-question-title">
                            <h3>
                              {
                                question.year
                              }
                            </h3>

                            <span>
                              {
                                question.date
                                  ? new Date(
                                      `${question.date}T00:00:00`
                                    ).toLocaleDateString(
                                      "pt-BR"
                                    )
                                  : "Sem data"
                              }
                            </span>
                          </div>

                          <span className="admin-question-clues">
                            {
                              question
                                .clues
                                .length
                            }{" "}
                            dicas
                          </span>
                        </div>
                      </div>

                      <div className="admin-question-actions">
                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() =>
                            openEditForm(
                              question
                            )
                          }
                          disabled={
                            deletingId !==
                            null
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() =>
                            handleDelete(
                              question
                            )
                          }
                          disabled={
                            deletingId ===
                            question.id
                          }
                        >
                          {deletingId ===
                          question.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;