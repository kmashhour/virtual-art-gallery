import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CollectionPage = () => {
  const { id } = useParams();
  const [collectionName, setCollectionName] = useState("");
  const [artworkIds, setArtworkIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/collections/${id}/artworks`);
        if (!res.ok) {
          throw new Error(`Kon artworks voor collectie ${id} niet ophalen`);
        }

        const data = await res.json();

        if (data.collectionName) {
          setCollectionName(data.collectionName);
        } else {
          setCollectionName(`Collectie #${id}`);
        }

        const metObjectIds = data.metObjectIds || [];
        setArtworkIds(metObjectIds);
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Er ging iets mis bij het ophalen van de artworks voor deze collectie"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [id]);

  return (
    <section className="p-8">
      <Link to="/collections" className="text-blue-600 underline text-sm">
        ← Terug naar collecties
      </Link>

      <h1 className="text-3xl font-bold mb-4 mt-4">
        {collectionName || `Collectie #${id}`}
      </h1>

      {loading && <p>Artworks worden geladen...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {artworkIds.length === 0 ? (
            <p>Deze collectie bevat nog geen kunstwerken.</p>
          ) : (
            <ul className="space-y-2 mt-4">
              {artworkIds.map((metId) => (
                <li key={metId}>
                  <Link
                    to={`/art/${metId}`}
                    className="text-blue-600 underline text-sm"
                  >
                    Kunstwerk #{metId}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};

export default CollectionPage;

