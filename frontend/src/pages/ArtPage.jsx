import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';

const ArtPage = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Tijdelijk: dummy data op basis van het id
  const art = {
    id,
    title: `Titel van kunstwerk #${id}`,
    artist: 'Onbekende kunstenaar',
    year: 'Jaartal onbekend',
    technique: 'Techniek onbekend',
    description:
      'Hier komt straks de echte beschrijving van het kunstwerk uit de database/API.',
    image: `https://via.placeholder.com/600x400?text=Artwork+${id}`,
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    // TODO: later koppelen aan backend / localStorage
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
          onClick={handleToggleFavorite}
          className="mb-4 px-4 py-2 border rounded-md text-sm"
        >
          {isFavorite ? '★ Verwijder uit favorieten' : '☆ Voeg toe aan favorieten'}
        </button>

        <img
          src={art.image}
          alt={art.title}
          className="w-full h-auto rounded mb-4"
        />

        <p className="text-base text-gray-800 mb-6">{art.description}</p>

        {/* Hier komen later: comments, meer details, etc. */}
      </div>
    </section>
  );
};

export default ArtPage;
