import { Link } from 'react-router-dom';
import Card from './Card';

const HomeCards = () => {
  return (
    <section className="py-4">
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <Card>
            <h2 className="text-2xl font-bold">Ontdek de galerie</h2>
            <p className="mt-2 mb-4">
              Blader door onze virtuele collecties en ontdek bijzondere kunstwerken.
            </p>
            <Link
              to="/collections"
              className="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
            >
              Bekijk collecties
            </Link>
          </Card>

          <Card bg="bg-indigo-100">
            <h2 className="text-2xl font-bold">Jouw favorieten</h2>
            <p className="mt-2 mb-4">
              Bewaar kunstwerken die je inspireren en bekijk ze later in één overzicht.
            </p>
            <Link
              to="/favorites"
              className="inline-block bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-600"
            >
              Ga naar favorieten
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
