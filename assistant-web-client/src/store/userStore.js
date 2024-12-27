import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import api from '../utils/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userid: null,
    isAuthenticated: false,
    user: null,
    profilePicture: null
  }),

  actions: {
    async checkAuthStatus() {
      try {
        const response = await api.get('/api/v1/auth/status')
        const userData = response.data
        
        this.isAuthenticated = true
        this.user = userData
        this.userid = userData.user_id
        
        if (userData.picture) {
          this.handleProfilePicture(userData.picture)
        }
      } catch (error) {
        // Only log out if it's an auth error
        if (error.response?.status === 401) {
          this.logout()
        } else {
          console.error('Error checking auth status:', error)
        }
      }
    },

    async handleProfilePicture(pictureUrl) {
      const PROFILE_PICTURE_CACHE_KEY = 'cached_profile_picture'
      const PROFILE_PICTURE_CACHE_EXPIRY_KEY = 'cached_profile_picture_expiry'
      const CACHE_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

      // Check cache first
      const cachedPicture = localStorage.getItem(PROFILE_PICTURE_CACHE_KEY)
      const cacheExpiry = localStorage.getItem(PROFILE_PICTURE_CACHE_EXPIRY_KEY)
      
      if (cachedPicture && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
        this.profilePicture = cachedPicture
        return
      }

      // Fetch and cache if needed
      try {
        const response = await fetch(pictureUrl)
        const blob = await response.blob()
        const reader = new FileReader()
        
        reader.onloadend = () => {
          const base64data = reader.result
          localStorage.setItem(PROFILE_PICTURE_CACHE_KEY, base64data)
          localStorage.setItem(
            PROFILE_PICTURE_CACHE_EXPIRY_KEY, 
            (Date.now() + CACHE_DURATION_MS).toString()
          )
          this.profilePicture = base64data
        }
        
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error('Error fetching profile picture:', error)
      }
    },

    logout() {
      this.userid = null
      this.isAuthenticated = false
      this.user = null
      this.profilePicture = null
      
      // Clear cached profile picture
      localStorage.removeItem('cached_profile_picture')
      localStorage.removeItem('cached_profile_picture_expiry')
      
      // Call logout endpoint to clear cookies
      api.post('/api/v1/auth/logout')
        .catch(error => console.error('Logout error:', error))
    },

    // Initialize auth state
    async initializeAuth() {
      await this.checkAuthStatus()
    }
  }
})
