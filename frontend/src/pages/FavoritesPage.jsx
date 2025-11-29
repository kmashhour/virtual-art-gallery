import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Als er geen favorieten zijn, niets ophalen
    if (!favorites || favorites.length === 0) {
      setArtworks([]);
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const promises = favorites.map(async (id) => {
          const res = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          );
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.objectID,
            title: data.title,
            artist: data.artistDisplayName,
            year: data.objectDate,
            image: data.primaryImageSmall,
          };
        });

        const result = await Promise.all(promises);
        setArtworks(result.filter((a) => a !== null));
      } catch (err) {
        console.error("Fout bij ophalen favorieten:", err);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  const handleRemoveFavorite = (id) => {
    toggleFavorite(id);
  };

  const hasFavorites = favorites && favorites.length > 0;

  return (
    <main className="site-main">
      <section id="favorites" className="page page--favorites">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Mijn favoriete kunstwerken</h1>
            <p className="page-header__subtitle">
              Deze kunstwerken zijn door jou gemarkeerd als favoriet tijdens
              deze sessie.
            </p>
          </div>
        </header>

        {!hasFavorites && (
          <p>Je hebt nog geen kunstwerken als favoriet opgeslagen.</p>
        )}

        {hasFavorites && loading && <p>Favorieten worden geladen...</p>}

        {hasFavorites && !loading && artworks.length === 0 && (
          <p>Er zijn (nog) geen details beschikbaar voor deze favorieten.</p>
        )}

        {hasFavorites && !loading && artworks.length > 0 && (
          <div className="artworks-grid">
            {artworks.map((art) => (
              <article key={art.id} className="artwork-card">
                <div className="artwork-card__image-wrapper">
                  {art.image ? (
                    <img
                      src={art.image}
                      alt={art.title}
                      className="artwork-card__image"
                    />
                  ) : (
                    <div
                      className="artwork-card__image"
                      style={{ backgroundColor: "#ddd" }}
                    />
                  )}
                </div>
                <div className="artwork-card__body">
                  <h2 className="artwork-card__title">
                    {art.title || `Kunstwerk #${art.id}`}
                  </h2>
                  {art.artist && (
                    <p className="artwork-card__artist">{art.artist}</p>
                  )}
                  {art.year && (
                    <p className="artwork-card__year">{art.year}</p>
                  )}

                  <div className="artwork-card__actions">
                    <Link
                      to={`/art/${art.id}`}
                      className="button button--ghost"
                    >
                      Bekijk details
                    </Link>

                    <button
                      type="button"
                      className="button button--icon"
                      onClick={() => handleRemoveFavorite(art.id)}
                    >
                      <span className="button__icon-heart" aria-hidden="true">
                        ♥
                      </span>
                      <span className="button__text">Verwijder favoriet</span>
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

export default FavoritesPage;
