// Import all custom function components
import SpotifySearchCard from './SpotifySearchCard.vue';
import SpotifyPlaylistCard from './SpotifyPlaylistCard.vue';
import SpotifyUserCard from './SpotifyUserCard.vue';
import SpotifyCreatePlaylistCard from './SpotifyCreatePlaylistCard.vue';
import SpotifyAddSongsCard from './SpotifyAddSongsCard.vue';
import TidalPlaylistTracksCard from './TidalPlaylistTracksCard.vue';
import BrightdataContentCard from './BrightdataContentCard.vue';
import StockTickerListCard from './StockTickerListCard.vue';
import StockDataCard from './StockDataCard.vue';
import SensorMetricCard from './SensorMetricCard.vue';

// Registry map of function names to components
const FunctionRegistry = {
  // Spotify API functions
  'spotify_search_song': SpotifySearchCard,
  'spotify_search_album': SpotifySearchCard,
  'spotify_search_artist': SpotifySearchCard,
  'spotify_get_playlist_by_name': SpotifyPlaylistCard,
  'spotify_get_playlist_by_id': SpotifyPlaylistCard,
  'spotify_get_current_user': SpotifyUserCard,
  'spotify_create_playlist': SpotifyCreatePlaylistCard,
  'spotify_add_song_to_playlist': SpotifyAddSongsCard,
  'spotify_add_songs_to_playlist': SpotifyAddSongsCard,
  
  // Tidal API functions
  'tidal_get_playlist_tracks': TidalPlaylistTracksCard,
  
  // Web scraping functions
  'brightdata_get_content': BrightdataContentCard,

  // Finance functions
  'list_stock_tickers': StockTickerListCard,
  'finance_get_stock_data': StockDataCard,
  
  // Sensor functions
  'sensor_get_location_metric_by_range': SensorMetricCard,
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