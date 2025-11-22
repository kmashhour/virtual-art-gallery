import { useState, useEffect } from "react";

const STORAGE_KEY = "artgallery_favorites";

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Eenmalig: laden uit localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setFavorites(parsed);
      }
    } catch (err) {
      console.error("Kon favorites niet laden", err);
    }
  }, []);

  // Schrijven naar localStorage bij iedere wijziging
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error("Kon favorites niet opslaan", err);
    }
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
