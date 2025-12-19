import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";

const FALLBACK_IMG = "src/assets/images/cypresses.png";

const CollectionPage = () => {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [collectionName, setCollectionName] = useState(`Collectie #${id}`);
  const [metObjectIds, setMetObjectIds] = useState([]);

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // (optioneel) simpele zoekfilters op de pagina
  const [qTitle, setQTitle] = useState("");
  const [qArtist, setQArtist] = useState("");

  // 1) haal eerst IDs uit jouw backend
  useEffect(() => {
    const loadIds = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/collections/${id}/artworks`);
        if (!res.ok) throw new Error("Kon collectiegegevens niet ophalen");

        const data = await res.json();

        // jouw response-shape:
        // { collectionId, collectionName, metObjectIds: [...] }
        setCollectionName(data.collectionName || `Collectie #${id}`);
        setMetObjectIds(Array.isArray(data.metObjectIds) ? data.metObjectIds : []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Er ging iets mis");
      } finally {
        setLoading(false);
      }
    };

    loadIds();
  }, [id]);

  // 2) haal daarna MET details op basis van IDs
  useEffect(() => {
    if (metObjectIds.length === 0) {
      setArtworks([]);
      return;
    }

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchOne = async (objectId) => {
          const res = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
          );
          if (!res.ok) return null;

          const a = await res.json();
          return {
            met_object_id: String(a.objectID),
            title: a.title || `Kunstwerk #${objectId}`,
            artist: a.artistDisplayName || "Onbekende kunstenaar",
            year: a.objectDate || "",
            image: a.primaryImageSmall || a.primaryImage || FALLBACK_IMG,
          };
        };

        // concurrency limiter (minder stress op MET)
        const limit = 6;
        const results = [];
        for (let i = 0; i < metObjectIds.length; i += limit) {
          const chunk = metObjectIds.slice(i, i + limit);
          const chunkRes = await Promise.all(chunk.map(fetchOne));
          results.push(...chunkRes.filter(Boolean));
        }

        setArtworks(results);
      } catch (e) {
        console.error(e);
        setError(e.message || "Kon kunstwerken niet ophalen");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [metObjectIds]);

  const filtered = useMemo(() => {
    const t = qTitle.trim().toLowerCase();
    const a = qArtist.trim().toLowerCase();

    return artworks.filter((x) => {
      const okTitle = !t || (x.title || "").toLowerCase().includes(t);
      const okArtist = !a || (x.artist || "").toLowerCase().includes(a);
      return okTitle && okArtist;
    });
  }, [artworks, qTitle, qArtist]);

  return (
    <main className="site-main">
      <section className="page page--collection-detail">
        <header className="page-header page-header--with-back">
          <div className="page-header__left">
            <Link to="/collections" className="back-link">
              &larr; Terug naar collecties
            </Link>
            <h1 className="page-header__title">{collectionName}</h1>
            <p className="page-header__subtitle">
              Blader door de kunstwerken in deze collectie.
            </p>
          </div>

          <div className="page-header__right">
            <div className="search-group">
              <label className="search-group__label" htmlFor="search-title">
                Zoeken op titel
              </label>
              <input
                id="search-title"
                type="text"
                className="search-group__input"
                placeholder="Zoek op titel..."
                value={qTitle}
                onChange={(e) => setQTitle(e.target.value)}
              />
            </div>

            <div className="search-group">
              <label className="search-group__label" htmlFor="search-artist">
                Zoeken op kunstenaar
              </label>
              <input
                id="search-artist"
                type="text"
                className="search-group__input"
                placeholder="Zoek op kunstenaar..."
                value={qArtist}
                onChange={(e) => setQArtist(e.target.value)}
              />
            </div>
          </div>
        </header>

        {loading && <p>Kunstwerken worden geladen...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && metObjectIds.length === 0 && (
          <p>Deze collectie bevat nog geen kunstwerken.</p>
        )}

        {!loading && !error && metObjectIds.length > 0 && filtered.length === 0 && (
          <p>Geen resultaten voor je zoekopdracht.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="artworks-grid">
            {filtered.map((a) => (
              <article key={a.met_object_id} className="artwork-card">
                <div className="artwork-card__image-wrapper">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="artwork-card__image"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  />
                </div>

                <div className="artwork-card__body">
                  <h2 className="artwork-card__title">{a.title}</h2>
                  <p className="artwork-card__artist">{a.artist}</p>
                  <p className="artwork-card__year">{a.year}</p>

                  <div className="artwork-card__actions">
                    <Link to={`/art/${a.met_object_id}`} className="button button--ghost">
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
                      <span className="button__text">Favoriet</span>
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
