import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main className="site-main">
      <section className="page page--home">
        <header className="page-header">
          <div>
            <h1 className="page-header__title">Virtuele Kunstgalerij</h1>
            <p className="page-header__subtitle">
              Ontdek zorgvuldig samengestelde collecties en kunstwerken uit de
              collectie van The Metropolitan Museum of Art.
            </p>
          </div>
        </header>

        <div className="collections-grid">
          {/* Blok 1: Collecties */}
          <article className="collection-card">
            <div className="collection-card__body">
              <h2 className="collection-card__title">Blader door collecties</h2>
              <p className="collection-card__description">
                Bekijk thematische collecties die zijn opgebouwd uit objecten
                van The Met en samengesteld voor deze virtuele galerij.
              </p>
              <div className="collection-card__meta">
                <span className="collection-card__category">Ontdekken</span>
                <span className="collection-card__count">Collecties</span>
              </div>
              <Link
                to="/collections"
                className="button button--primary collection-card__link"
              >
                Naar collecties
              </Link>
            </div>
          </article>

          {/* Blok 2: Favorieten */}
          <article className="collection-card">
            <div className="collection-card__body">
              <h2 className="collection-card__title">Mijn favorieten</h2>
              <p className="collection-card__description">
                Bewaar kunstwerken die je aanspreken en bekijk ze later terug in
                één persoonlijk overzicht.
              </p>
              <div className="collection-card__meta">
                <span className="collection-card__category">Persoonlijk</span>
                <span className="collection-card__count">Favorieten</span>
              </div>
              <Link
                to="/favorites"
                className="button button--ghost collection-card__link"
              >
                Naar favorieten
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default HomePage;

