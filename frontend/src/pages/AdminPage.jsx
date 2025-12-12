import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  category: "",
  cover_image_url: "",
};

const AdminPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const isEditing = useMemo(() => form.id !== null, [form.id]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/collections");
      if (!res.ok) throw new Error("Kon admin collecties niet ophalen");
      const data = await res.json();
      setCollections(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const startNew = () => setForm(emptyForm);

  const startEdit = (c) =>
    setForm({
      id: c.id,
      name: c.name ?? "",
      description: c.description ?? "",
      category: c.category ?? "",
      cover_image_url: c.cover_image_url ?? "",
    });

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Naam is verplicht");
      return;
    }

    try {
      const url = isEditing
        ? `/api/admin/collections/${form.id}`
        : `/api/admin/collections`;

      const method = isEditing ? "PUT" : "POST";

      const body = isEditing
        ? {
            name: form.name,
            description: form.description,
            category: form.category,
            cover_image_url: form.cover_image_url,
          }
        : {
            name: form.name,
            description: form.description,
            category: form.category,
            cover_image_url: form.cover_image_url,
            is_published: 0,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Opslaan mislukt");

      await load();
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
      alert(e.message || "Opslaan mislukt");
    }
  };

  const togglePublish = async (c) => {
    try {
      const res = await fetch(`/api/admin/collections/${c.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !c.is_published }),
      });
      if (!res.ok) throw new Error("Publiceren mislukt");
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Publiceren mislukt");
    }
  };

  const remove = async (c) => {
    const ok = confirm(`Weet je zeker dat je "${c.name}" wilt verwijderen?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/collections/${c.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Verwijderen mislukt");
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Verwijderen mislukt");
    }
  };

  return (
    <main className="site-main">
      <section className="page page--admin">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Beheer collecties</h1>
            <p className="page-header__subtitle">
              Voeg collecties toe, bewerk ze en wijzig publicatiestatus.
            </p>
          </div>
        </header>

        {loading && <p>Bezig met laden...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="admin-toolbar" style={{ display: "flex", gap: "0.8rem" }}>
          <button type="button" className="button button--primary" onClick={startNew}>
            + Nieuwe collectie
          </button>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <form className="comments-section" onSubmit={save}>
            <h2 className="comments-section__title" style={{ marginBottom: "0.8rem" }}>
              {isEditing ? `Bewerk collectie #${form.id}` : "Nieuwe collectie"}
            </h2>

            <label className="comment-form__label">Naam</label>
            <input
              className="search-group__input"
              value={form.name}
              onChange={onChange("name")}
              placeholder="Bijv. Modern Art Highlights"
            />

            <div style={{ height: "0.8rem" }} />

            <label className="comment-form__label">Omschrijving</label>
            <textarea
              className="comment-form__textarea"
              value={form.description}
              onChange={onChange("description")}
              placeholder="Korte beschrijving..."
            />

            <label className="comment-form__label">Categorie</label>
            <input
              className="search-group__input"
              value={form.category}
              onChange={onChange("category")}
              placeholder="Bijv. Modern"
            />

            <div style={{ height: "0.8rem" }} />

            <label className="comment-form__label">Cover afbeelding URL</label>
            <input
              className="search-group__input"
              value={form.cover_image_url}
              onChange={onChange("cover_image_url")}
              placeholder="https://..."
            />

            <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.9rem" }}>
              <button type="submit" className="button button--primary">
                {isEditing ? "Opslaan" : "Toevoegen"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={startNew}
                >
                  Annuleren
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-table-wrapper" style={{ marginTop: "1.4rem" }}>
          <table className="admin-table admin-table--collections">
            <thead>
              <tr>
                <th>ID</th>
                <th>Naam</th>
                <th>Gepubliceerd</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={4}>Geen collecties gevonden.</td>
                </tr>
              ) : (
                collections.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>
                      {c.is_published ? (
                        <span className="badge badge--published">Gepubliceerd</span>
                      ) : (
                        <span className="badge badge--draft">Niet gepubliceerd</span>
                      )}
                    </td>
                    <td className="admin-table__actions">
                      <button
                        type="button"
                        className="button button--small"
                        onClick={() => startEdit(c)}
                      >
                        Bewerken
                      </button>
                      <button
                        type="button"
                        className="button button--small button--ghost"
                        onClick={() => togglePublish(c)}
                      >
                        {c.is_published ? "Depubliceer" : "Publiceer"}
                      </button>
                      <button
                        type="button"
                        className="button button--small button--ghost"
                        onClick={() => remove(c)}
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminPage;
