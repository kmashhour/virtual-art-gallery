import { useEffect, useState } from "react";
import CollectionListings from "../components/CollectionListings";

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

        // Verwacht: array van collecties met minimaal:
        // { id, name, description, category }
        setCollections(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Er ging iets mis bij het ophalen van de collecties");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Art Collections</h1>
      <p className="mb-4">
        Blader door de beschikbare collecties in de virtuele kunstgalerij.
      </p>

      {loading && <p>Collecties worden geladen...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <CollectionListings collections={collections} />
      )}
    </section>
  );
};

export default CollectionsPage;
