// Import all custom function components
import SpotifySearchCard from './SpotifySearchCard.vue';
import SpotifyPlaylistCard from './SpotifyPlaylistCard.vue';

// Registry map of function names to components
const FunctionRegistry = {
  // Spotify API functions
  'spotify_search_song': SpotifySearchCard,
  'spotify_search_album': SpotifySearchCard,
  'spotify_search_artist': SpotifySearchCard,
  'spotify_get_playlist_by_name': SpotifyPlaylistCard,
  'spotify_get_playlist_by_id': SpotifyPlaylistCard,
};

/**
 * Get the appropriate component for a function name
 * 
 * @param {string} functionName - The name of the function
 * @returns {Component|null} - The Vue component or null if not found
 */
export function getComponentForFunction(functionName) {
  return FunctionRegistry[functionName] || null;
}

/**
 * Check if a custom component exists for a function
 * 
 * @param {string} functionName - The name of the function
 * @returns {boolean} - True if a component exists, false otherwise
 */
export function hasCustomComponent(functionName) {
  return functionName in FunctionRegistry;
}

export default FunctionRegistry; 