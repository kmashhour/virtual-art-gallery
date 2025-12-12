import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/collections?published=true");

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

  return (
    <main className="site-main">
      <section id="collections" className="page page--collections">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Geselecteerde collecties</h1>
            <p className="page-header__subtitle">
              Bekijk zorgvuldig samengestelde collecties uit de collectie van
              het museum.
            </p>
          </div>
        </header>

        {loading && <p>Collecties worden geladen...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && collections.length === 0 && (
          <p>Er zijn nog geen collecties beschikbaar.</p>
        )}

        {!loading && !error && collections.length > 0 && (
          <div className="collections-grid">
            {collections.map((collection) => (
              <article
                key={collection.id}
                className="collection-card"
              >
                <div className="collection-card__image-wrapper">
                  <img
                    src={collection.cover_image_url || "src/assets/images/cypresses.png"}
                    alt={collection.name}
                    className="collection-card__image"
                    loading="lazy"
                    onError={(e) => {
                    e.currentTarget.src = "src/assets/images/cypresses.png";
                    }}
                  />
                </div>
                <div className="collection-card__body">
                  <h2 className="collection-card__title">
                    {collection.name}
                  </h2>
                  <p className="collection-card__description">
                    {collection.description || "Geen beschrijving beschikbaar."}
                  </p>
                  <div className="collection-card__meta">
                    <span className="collection-card__category">
                      {collection.category || "Collectie"}
                    </span>
                    <span className="collection-card__count">
                      Kunstwerken
                    </span>
                  </div>
                  <Link
                    to={`/collections/${collection.id}`}
                    className="button button--primary collection-card__link"
                  >
                    Bekijk collectie
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default CollectionsPage;
