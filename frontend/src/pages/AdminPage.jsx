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

  // nieuw: formulier tonen/verbergen
  const [showForm, setShowForm] = useState(false);

  // nieuw: artworks beheer per collectie
  const [selectedId, setSelectedId] = useState(null); // collection id
  const [artworkIds, setArtworkIds] = useState([]); // [{met_object_id, sort_order}]
  const [artworkInput, setArtworkInput] = useState("");
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [artworksError, setArtworksError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/collections", { credentials: "include" });
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

  // nieuw: start new -> formulier open
  const startNew = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  // nieuw: edit -> formulier open
  const startEdit = (c) => {
    setForm({
      id: c.id,
      name: c.name ?? "",
      description: c.description ?? "",
      category: c.category ?? "",
      cover_image_url: c.cover_image_url ?? "",
    });
    setShowForm(true);
  };

  // nieuw: annuleren -> formulier dicht
  const cancelForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

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
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Opslaan mislukt");

      await load();
      cancelForm(); // na opslaan dicht
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
        credentials: "include",
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
        credentials: "include",
      });
      if (!res.ok) throw new Error("Verwijderen mislukt");

      // als verwijderde collectie geselecteerd was: reset
      if (selectedId === c.id) {
        setSelectedId(null);
        setArtworkIds([]);
        setArtworkInput("");
      }

      await load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Verwijderen mislukt");
    }
  };

  // =========================
  // Optie A: Artworks beheren per collectie
  // =========================

  const loadArtworksForCollection = async (collectionId) => {
    try {
      setArtworksLoading(true);
      setArtworksError(null);

      const res = await fetch(`/api/admin/collections/${collectionId}/artworks`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Kon collectie-artworks niet ophalen");

      const data = await res.json();
      setArtworkIds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setArtworksError(e.message || "Er ging iets mis");
      setArtworkIds([]);
    } finally {
      setArtworksLoading(false);
    }
  };

  const openArtworksManager = (c) => {
    setSelectedId(c.id);
    setArtworkInput("");
    loadArtworksForCollection(c.id);
  };

  const addArtworkId = async () => {
    const value = artworkInput.trim();
    if (!selectedId) return;
    if (!value) {
      alert("Vul een MET Object ID in");
      return;
    }

    try {
      const res = await fetch(`/api/admin/collections/${selectedId}/artworks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ met_object_id: value }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Toevoegen mislukt");
      }

      setArtworkInput("");
      await loadArtworksForCollection(selectedId);
    } catch (e) {
      console.error(e);
      alert(e.message || "Toevoegen mislukt");
    }
  };

  const deleteArtworkId = async (met_object_id) => {
    if (!selectedId) return;
    const ok = confirm(`Verwijderen uit collectie? (MET ID: ${met_object_id})`);
    if (!ok) return;

    try {
      const res = await fetch(
        `/api/admin/collections/${selectedId}/artworks/${met_object_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Verwijderen mislukt");
      }

      await loadArtworksForCollection(selectedId);
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
              Voeg collecties toe, bewerk ze en wijzig publicatiestatus. (Optie A: beheer MET object IDs per collectie)
            </p>
          </div>
        </header>

        {loading && <p>Bezig met laden...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="admin-toolbar" style={{ display: "flex", gap: "0.8rem" }}>
          <button type="button" className="button button--primary" onClick={startNew}>
            + Nieuwe collectie
          </button>

          {showForm && (
            <button type="button" className="button button--ghost" onClick={cancelForm}>
              Sluiten
            </button>
          )}
        </div>

        {/*Formulier alleen tonen als showForm true */}
        {showForm && (
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
                placeholder="Bijv. Japanse prenten (Ukiyo-e)"
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
                placeholder="Bijv. Prenten"
              />

              <div style={{ height: "0.8rem" }} />

              <label className="comment-form__label">Cover afbeelding URL (optioneel)</label>
              <input
                className="search-group__input"
                value={form.cover_image_url}
                onChange={onChange("cover_image_url")}
                placeholder="Laat leeg voor automatisch (eerste artwork)"
              />

              <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.9rem" }}>
                <button type="submit" className="button button--primary">
                  {isEditing ? "Opslaan" : "Toevoegen"}
                </button>
                <button type="button" className="button button--ghost" onClick={cancelForm}>
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        )}

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
                        onClick={() => openArtworksManager(c)}
                      >
                        Kunstwerken
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

        {/* Optie A: Kunstwerken beheer panel */}
        {selectedId && (
          <div style={{ marginTop: "1.4rem" }}>
            <div className="comments-section">
              <h2 className="comments-section__title">
                Kunstwerken in collectie #{selectedId}
              </h2>

              {artworksLoading && <p>Bezig met laden...</p>}
              {artworksError && <p className="text-red-600">{artworksError}</p>}

              <div style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
                <input
                  className="search-group__input"
                  value={artworkInput}
                  onChange={(e) => setArtworkInput(e.target.value)}
                  placeholder="MET Object ID (bijv. 436121)"
                />
                <button type="button" className="button button--primary" onClick={addArtworkId}>
                  Toevoegen
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setSelectedId(null);
                    setArtworkIds([]);
                    setArtworkInput("");
                  }}
                >
                  Sluiten
                </button>
              </div>

              <div style={{ marginTop: "1rem" }}>
                {(!artworksLoading && artworkIds.length === 0) ? (
                  <p>Geen kunstwerken gekoppeld.</p>
                ) : (
                  <ul className="comments-list">
                    {artworkIds.map((x) => (
                      <li key={x.met_object_id} className="comments-list__item">
                        <article className="comment-card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>MET ID: {x.met_object_id}</div>
                            {x.sort_order !== null && x.sort_order !== undefined && (
                              <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                                sort_order: {x.sort_order}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="button button--small button--ghost"
                            onClick={() => deleteArtworkId(x.met_object_id)}
                          >
                            Verwijder
                          </button>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p style={{ marginTop: "0.8rem", opacity: 0.7 }}>
                Tip: Voeg alleen MET IDs toe waarvan je zeker weet dat er een afbeelding is (hasImages=true).
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminPage;
