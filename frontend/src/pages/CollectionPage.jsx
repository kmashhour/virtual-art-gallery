import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ArtListings from "../components/ArtListings";

const CollectionPage = () => {
  const { id } = useParams();
  const [artworks, setArtworks] = useState([]);
  const [collectionName, setCollectionName] = useState("");
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
        // Verwacht: { collectionName, artworks: [...] }
        // Of alleen een array. We zijn een beetje defensief:

        if (Array.isArray(data)) {
          // data is direct de lijst van artworks
          setArtworks(
            data.map((item) => ({
              id: item.met_object_id || item.id,
              title: item.title,
              artist: item.artist || item.artistDisplayName,
              image: item.image || item.primaryImageSmall,
            }))
          );
        } else {
          // data: { collectionName, artworks: [...] }
          if (data.collectionName) {
            setCollectionName(data.collectionName);
          }
          if (Array.isArray(data.artworks)) {
            setArtworks(
              data.artworks.map((item) => ({
                id: item.met_object_id || item.id,
                title: item.title,
                artist: item.artist || item.artistDisplayName,
                image: item.image || item.primaryImageSmall,
              }))
            );
          }
        }
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

      {!loading && !error && <ArtListings artworks={artworks} />}
    </section>
  );
};

export default CollectionPage;
