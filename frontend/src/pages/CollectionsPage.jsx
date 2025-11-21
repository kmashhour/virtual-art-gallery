import CollectionListings from '../components/CollectionListings';

const dummyCollections = [
  {
    id: 1,
    name: 'Impressionistische Meesters',
    description: 'Een selectie van impressionistische schilderijen.',
    category: 'Schilderkunst',
  },
  {
    id: 2,
    name: 'Moderne Beelden',
    description: 'Abstracte en moderne sculpturen uit de 20e eeuw.',
    category: 'Beeldhouwkunst',
  },
  {
    id: 3,
    name: 'Fotografie Highlights',
    description: 'Iconische foto’s uit verschillende periodes.',
    category: 'Fotografie',
  },
];

const CollectionsPage = () => {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Art Collections</h1>
      <p className="mb-4">
        Blader door de beschikbare collecties in de virtuele kunstgalerij.
      </p>
      <CollectionListings collections={dummyCollections} />
    </section>
  );
};

export default CollectionsPage;

 