import { useParams, Link } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";

const ArtPage = () => {
  const { id } = useParams(); // string, bv "10"
  const { isFavorite, toggleFavorite } = useFavorites();

  const art = {
    id, // zelfde type als we in favorites opslaan
    title: `Titel van kunstwerk #${id}`,
    artist: "Onbekende kunstenaar",
    year: "Jaartal onbekend",
    technique: "Techniek onbekend",
    description:
      "Hier komt straks de echte beschrijving van het kunstwerk uit de database/API.",
    image: "/placeholder.png", // tijdelijke lokale placeholder
  };


  return (
    <section className="p-8 max-w-3xl mx-auto">
      <Link to="/collections" className="text-blue-600 underline text-sm">
        ← Terug naar collecties
      </Link>

      <div className="mt-4">
        <h1 className="text-3xl font-bold mb-2">{art.title}</h1>
        <p className="text-lg text-gray-700 mb-1">{art.artist}</p>
        <p className="text-sm text-gray-500 mb-4">
          {art.year} · {art.technique}
        </p>

        <button
          onClick={() => toggleFavorite(art.id)}
          className="mb-4 px-4 py-2 border rounded-md text-sm"
        >
          {isFavorite(art.id)
            ? "★ Verwijder uit favorieten"
            : "☆ Voeg toe aan favorieten"}
        </button>

        {/* img mag, maar hoeft even niet */}
        {/* <img
          src={art.image}
          alt={art.title}
          className="w-full h-auto rounded mb-4"
        /> */}

        <p className="text-base text-gray-800 mb-6">{art.description}</p>
      </div>
    </section>
  );
};

export default ArtPage;
