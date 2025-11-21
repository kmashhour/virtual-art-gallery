import CollectionListing from './CollectionListing';

const CollectionListings = ({ collections }) => {
  if (!collections || collections.length === 0) {
    return <p>Er zijn nog geen collecties beschikbaar.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionListing key={collection.id} collection={collection} />
      ))}
    </div>
  );
};

export default CollectionListings;
