import { useParams } from 'react-router-dom';

const EditArt = () => {
  const { id } = useParams();

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Kunstwerk bewerken #{id}</h1>
      <p>Hier komt straks het formulier om dit kunstwerk te bewerken.</p>
    </section>
  );
};

export default EditArt;
