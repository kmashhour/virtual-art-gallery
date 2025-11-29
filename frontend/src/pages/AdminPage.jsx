import { useEffect, useState } from "react";

const AdminPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);

        // hier zonder ?published=true → alle collecties
        const res = await fetch("/api/collections");
        if (!res.ok) {
          throw new Error("Kon collecties niet ophalen");
        }

        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Er ging iets mis bij het ophalen van de collecties"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleNewCollection = () => {
    alert("Nieuwe collectie aanmaken is nog niet geïmplementeerd.");
  };

  const handleEdit = (id) => {
    alert(`Bewerken van collectie ${id} is nog niet geïmplementeerd.`);
  };

  const handleTogglePublish = (id, isPublished) => {
    alert(
      `Publicatiestatus wijzigen (nu: ${
        isPublished ? "gepubliceerd" : "niet gepubliceerd"
      }) voor collectie ${id} is nog niet geïmplementeerd.`
    );
  };

  return (
    <main className="site-main">
      <section id="admin" className="page page--admin">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Beheer collecties</h1>
            <p className="page-header__subtitle">
              Overzicht van alle collecties, inclusief publicatiestatus. Knoppen
              zijn nu nog alleen ter illustratie van de interface.
            </p>
          </div>
        </header>

        {loading && <p>Collecties worden geladen...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="admin-toolbar">
              <button
                type="button"
                className="button button--primary js-new-collection-button"
                onClick={handleNewCollection}
              >
                + Nieuwe collectie
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table admin-table--collections js-collections-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Naam</th>
                    <th>Gepubliceerd</th>
                    <th>Bijgewerkt</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.length === 0 ? (
                    <tr>
                      <td colSpan={5}>Er zijn nog geen collecties in de database.</td>
                    </tr>
                  ) : (
                    collections.map((collection) => (
                      <tr key={collection.id} data-collection-id={collection.id}>
                        <td>{collection.id}</td>
                        <td>{collection.name}</td>
                        <td>
                          {collection.is_published ? (
                            <span className="badge badge--published">
                              Gepubliceerd
                            </span>
                          ) : (
                            <span className="badge badge--draft">
                              Niet gepubliceerd
                            </span>
                          )}
                        </td>
                        <td>
                          {collection.updated_at ||
                            collection.updatedAt ||
                            collection.created_at ||
                            "-"}
                        </td>
                        <td className="admin-table__actions">
                          <button
                            type="button"
                            className="button button--small js-edit-collection-button"
                            onClick={() => handleEdit(collection.id)}
                          >
                            Bewerken
                          </button>
                          <button
                            type="button"
                            className="button button--small button--ghost js-toggle-publish-button"
                            onClick={() =>
                              handleTogglePublish(
                                collection.id,
                                collection.is_published
                              )
                            }
                          >
                            {collection.is_published
                              ? "Depubliceer"
                              : "Publiceer"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default AdminPage;
