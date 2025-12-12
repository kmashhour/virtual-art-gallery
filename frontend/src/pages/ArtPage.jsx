import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useFavorites from "../hooks/useFavorites";

const formatNlDateTime = (value) => {
  if (!value) return "";
  // SQLite geeft "YYYY-MM-DD HH:MM:SS"
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("nl-NL", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const ArtPage = () => {
  const { id } = useParams(); // MET object ID als string
  const { isFavorite, toggleFavorite } = useFavorites();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Comments-state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Kunstwerk ophalen bij The Met
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );

        if (!res.ok) {
          throw new Error("Kon kunstwerk niet ophalen van Met API");
        }

        const data = await res.json();
        setArtwork(data);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Er ging iets mis bij ophalen van dit kunstwerk"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  // Comments ophalen uit eigen backend
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        setCommentsError(null);

        const res = await fetch(`/api/artworks/${id}/comments`);
        if (!res.ok) {
          throw new Error("Kon opmerkingen niet ophalen");
        }

        const data = await res.json();
        setComments(
          data.map((c) => ({
            id: c.id,
            text: c.comment_text,
            dateTime: formatNlDateTime(c.created_at),
          }))
        );
      } catch (err) {
        console.error(err);
        setCommentsError(
          err.message || "Er ging iets mis bij het ophalen van opmerkingen"
        );
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  const handleToggleFavorite = () => {
    toggleFavorite(id);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    try {
      const res = await fetch(`/api/artworks/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Kon opmerking niet opslaan");
      }

      const saved = await res.json();

      const newComment = {
        id: saved.id,
        text: saved.comment_text,
        dateTime: formatNlDateTime(saved.created_at),
      };

      //zichtbaar maken bovenaan de lijst
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Er ging iets mis bij het opslaan van de opmerking. Probeer later opnieuw."
      );
    }
  };

  if (loading) {
    return (
      <main className="site-main">
        <p>Kunstwerk wordt geladen...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="site-main">
        <p className="text-red-600">{error}</p>
        <p>
          Probeer het later opnieuw of kies een ander kunstwerk via de
          collecties.
        </p>
      </main>
    );
  }

  if (!artwork) {
    return (
      <main className="site-main">
        <p>Geen gegevens voor dit kunstwerk gevonden.</p>
      </main>
    );
  }

  const title = artwork.title || `Kunstwerk #${id}`;
  const artist = artwork.artistDisplayName || "Onbekende kunstenaar";
  const year = artwork.objectDate || "Jaartal onbekend";
  const medium = artwork.medium || "Techniek onbekend";
  const dimensions = artwork.dimensions || "Afmetingen onbekend";
  const image = artwork.primaryImage || artwork.primaryImageSmall || "";
  const description =
    artwork.creditLine ||
    "Er is nog geen beschrijving beschikbaar voor dit kunstwerk.";
  const objectUrl = artwork.objectURL;

  return (
    <main className="site-main">
      <section id="artwork-detail" className="page page--artwork-detail">
        {/* Header */}
        <header className="page-header page-header--with-back">
          <div className="page-header__left">
            <Link to="/collections" className="back-link">
              &larr; Terug naar collecties
            </Link>
            <h1 className="page-header__title">{title}</h1>
            <p className="page-header__subtitle">
              {artist}
              {year ? `, ${year}` : ""}
            </p>
          </div>
          <div className="page-header__right">
            <button
              type="button"
              className="button button--icon"
              onClick={handleToggleFavorite}
            >
              <span className="button__icon-heart" aria-hidden="true">
                {isFavorite(id) ? "♥" : "♡"}
              </span>
              <span className="button__text">
                {isFavorite(id)
                  ? "In favorieten"
                  : "Voeg toe aan favorieten"}
              </span>
            </button>
          </div>
        </header>

        {/* Hoofd layout. afbeelding + info */}
        <div className="artwork-detail-layout">
          <div className="artwork-detail-layout__image">
            {image ? (
              <img
                src={image}
                alt={title}
                className="artwork-detail__image"
              />
            ) : (
              <p>Geen afbeelding beschikbaar.</p>
            )}
          </div>

          <div className="artwork-detail-layout__info">
            <dl className="artwork-meta">
              <div className="artwork-meta__row">
                <dt className="artwork-meta__label">Kunstenaar</dt>
                <dd className="artwork-meta__value">{artist}</dd>
              </div>
              <div className="artwork-meta__row">
                <dt className="artwork-meta__label">Jaar</dt>
                <dd className="artwork-meta__value">{year}</dd>
              </div>
              <div className="artwork-meta__row">
                <dt className="artwork-meta__label">Techniek</dt>
                <dd className="artwork-meta__value">{medium}</dd>
              </div>
              <div className="artwork-meta__row">
                <dt className="artwork-meta__label">Afmetingen</dt>
                <dd className="artwork-meta__value">{dimensions}</dd>
              </div>
            </dl>

            <div className="artwork-description">
              <h2 className="artwork-description__title">Beschrijving</h2>
              <p className="artwork-description__text">{description}</p>

              {objectUrl && (
                <p
                  className="artwork-description__text"
                  style={{ marginTop: "0.8rem" }}
                >
                  Bekijk dit kunstwerk op de website van The Met:&nbsp;
                  <a
                    href={objectUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2f4f90", textDecoration: "underline" }}
                  >
                    open in nieuwe tab
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <section className="comments-section">
          <h2 className="comments-section__title">Opmerkingen</h2>

          {commentsLoading && <p>Opmerkingen worden geladen...</p>}
          {commentsError && (
            <p className="text-red-600">{commentsError}</p>
          )}

          {!commentsLoading && !commentsError && comments.length === 0 && (
            <p>Er zijn nog geen opmerkingen bij dit kunstwerk.</p>
          )}

          {!commentsLoading && !commentsError && comments.length > 0 && (
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comments-list__item">
                  <article className="comment-card">
                    <header className="comment-card__header">
                      <span className="comment-card__author">
                        Bezoeker 1
                      </span>
                      <span className="comment-card__date">
                        {comment.dateTime}
                      </span>
                    </header>
                    <p className="comment-card__text">{comment.text}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <form
            className="comment-form"
            onSubmit={handleSubmitComment}
          >
            <label className="comment-form__label" htmlFor="comment-text">
              Voeg een opmerking toe
            </label>
            <textarea
              id="comment-text"
              className="comment-form__textarea"
              placeholder="Deel je gedachten over dit kunstwerk..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="button button--primary comment-form__submit"
            >
              Opmerking plaatsen
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default ArtPage;
