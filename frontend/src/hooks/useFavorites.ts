import { useState, useEffect } from "react";

interface FavoriteStory {
  id: string;
  title: string;
  creator: string;
  createdAt: string;
  addedAt: string;
}

const FAVORITES_STORAGE_KEY = "shapesaga_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStory[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
      setFavorites([]);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites]);

  const addToFavorites = (story: Omit<FavoriteStory, "addedAt">) => {
    const favoriteStory: FavoriteStory = {
      ...story,
      addedAt: new Date().toISOString(),
    };

    setFavorites((prev) => {
      // Check if story is already in favorites
      if (prev.some((fav) => fav.id === story.id)) {
        return prev;
      }
      return [...prev, favoriteStory];
    });
  };

  const removeFromFavorites = (storyId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== storyId));
  };

  const isFavorite = (storyId: string): boolean => {
    return favorites.some((fav) => fav.id === storyId);
  };

  const toggleFavorite = (story: Omit<FavoriteStory, "addedAt">) => {
    if (isFavorite(story.id)) {
      removeFromFavorites(story.id);
    } else {
      addToFavorites(story);
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  };
}
