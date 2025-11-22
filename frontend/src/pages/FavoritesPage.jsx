import { Link } from "react-router-dom";
// later kun je hier useFavorites importeren als je die weer wilt gebruiken

const dummyFavorites = [
  { id: 10, title: "Titel van kunstwerk #10" },
  { id: 11, title: "Titel van kunstwerk #11" },
];

const FavoritesPage = () => {
  // Voor nu werken we met dummy data.
  // Later kunnen we hier je echte favorieten (useFavorites of backend) tonen.

  const favorites = dummyFavorites;

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
      <ul className="space-y-2">
        {favorites.map((art) => (
          <li key={art.id}>
            <Link
              to={`/art/${art.id}`}
              className="text-blue-600 underline text-sm"
            >
              {art.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FavoritesPage;
