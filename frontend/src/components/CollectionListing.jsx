import { Link } from 'react-router-dom';

const CollectionListing = ({ collection }) => {
  return (
    <article className="border rounded-md p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{collection.name}</h2>
      <p className="text-sm text-gray-700 mb-2">{collection.description}</p>
      <p className="text-xs text-gray-500 mb-4">
        Categorie: {collection.category}
      </p>
      <Link
        to={`/collections/${collection.id}`}
        className="text-blue-600 underline text-sm"
      >
        Bekijk collectie
      </Link>
    </article>
  );
};

export default CollectionListing;
