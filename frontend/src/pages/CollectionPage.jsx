import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";

const CollectionPage = () => {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/collections/${id}/artworks`);
        if (!res.ok) throw new Error("Kon kunstwerken niet ophalen");
        const data = await res.json();
        setArtworks(data);
      } catch (e) {
        console.error(e);
        setError(e.message || "Er ging iets mis");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <main className="site-main">
      <section className="page page--collection-detail">
        <header className="page-header page-header--with-back">
          <div className="page-header__left">
            <Link to="/collections" className="back-link">
              &larr; Terug naar collecties
            </Link>
            <h1 className="page-header__title">Collectie #{id}</h1>
            <p className="page-header__subtitle">
              Blader door de kunstwerken in deze collectie.
            </p>
          </div>
        </header>

        {loading && <p>Kunstwerken worden geladen...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && artworks.length === 0 && (
          <p>Deze collectie bevat nog geen kunstwerken.</p>
        )}

        {!loading && !error && artworks.length > 0 && (
          <div className="artworks-grid">
            {artworks.map((a) => (
              <article key={a.met_object_id} className="artwork-card">
                <div className="artwork-card__image-wrapper">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="artwork-card__image"
                    loading="lazy"
                  />
                </div>

                <div className="artwork-card__body">
                  <h2 className="artwork-card__title">{a.title}</h2>
                  <p className="artwork-card__artist">{a.artist}</p>
                  <p className="artwork-card__year">{a.year}</p>

                  <div className="artwork-card__actions">
                    <Link
                      to={`/art/${a.met_object_id}`}
                      className="button button--ghost"
                    >
                      Details
                    </Link>

                    <button
                      type="button"
                      className="button button--icon"
                      onClick={() => toggleFavorite(a.met_object_id)}
                    >
                      <span className="button__icon-heart" aria-hidden="true">
                        {isFavorite(a.met_object_id) ? "♥" : "♡"}
                      </span>
                      <span className="button__text">
                        {isFavorite(a.met_object_id) ? "Favoriet" : "Favoriet"}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default CollectionPage;
