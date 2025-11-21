import { useParams } from 'react-router-dom';

const CollectionPage = () => {
  const { id } = useParams();

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Collectie #{id}</h1>
      <p>Hier komen straks de kunstwerken van deze collectie.</p>
    </section>
  );
};

export default CollectionPage;
