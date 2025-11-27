import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";

const FavoritesPage = () => {
  const { favorites } = useFavorites(); // lijst van ids (strings)
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // als er geen favorieten zijn, niks ophalen
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
          if (!res.ok) {
            throw new Error(`Kon object ${id} niet ophalen`);
          }
          const data = await res.json();
          return {
            id,
            title: data.title,
            artist: data.artistDisplayName,
            thumb: data.primaryImageSmall,
          };
        });

        const results = await Promise.all(promises);
        setArtworks(results);
      } catch (err) {
        console.error("Fout bij ophalen favorieten:", err);
        // Als iets misgaat: gewoon de lijst leeg laten
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  if (!favorites || favorites.length === 0) {
    return (
      <section className="p-8">
        <h1 className="text-3xl font-bold mb-4">Mijn favorieten</h1>
        <p>Je hebt nog geen favoriete kunstwerken.</p>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mijn favorieten</h1>

      {loading && <p>Favorieten worden geladen...</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {artworks.map((art) => (
          <article
            key={art.id}
            className="border rounded-md p-4 shadow-sm bg-white"
          >
            <h2 className="text-lg font-semibold mb-1">
              {art.title || `Kunstwerk #${art.id}`}
            </h2>

            {art.artist && (
              <p className="text-sm text-gray-700 mb-2">{art.artist}</p>
            )}

            {art.thumb ? (
              <img
                src={art.thumb}
                alt={art.title}
                className="w-full h-auto rounded mb-3"
              />
            ) : (
              <p className="text-xs text-gray-500 mb-3">
                Geen afbeelding beschikbaar.
              </p>
            )}

            <Link
              to={`/art/${art.id}`}
              className="text-blue-600 underline text-sm"
            >
              Bekijk details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FavoritesPage;

