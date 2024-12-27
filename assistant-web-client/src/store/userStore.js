import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

const PROFILE_PICTURE_CACHE_KEY = 'cached_profile_picture'
const PROFILE_PICTURE_CACHE_EXPIRY_KEY = 'cached_profile_picture_expiry'
const CACHE_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds

export const useUserStore = defineStore('user', {
  state: () => ({
    userid: null,
    token: null,
    isAuthenticated: false,
    user: null,
    profilePicture: null,
    loading: false
  }),

  actions: {
    setToken(token) {
      this.token = token
      this.isAuthenticated = true
      
      // Decode the JWT token to get user info
      try {
        const decoded = jwtDecode(token)
        console.log('Decoded token:', decoded)
        this.user = decoded
        this.userid = decoded.user_id
        

        // Check if there's a cached profile picture
        const cachedProfilePicture = localStorage.getItem(PROFILE_PICTURE_CACHE_KEY)
        const cacheExpiry = localStorage.getItem(PROFILE_PICTURE_CACHE_EXPIRY_KEY)
        
        /*
        if (cachedProfilePicture && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
          console.log('Using cached profile picture')
          this.profilePicture = cachedProfilePicture
        } else {
          // Fetch and cache the profile picture
          if (decoded.picture) {
            console.log('Fetching profile picture:', decoded.picture)
            fetch(decoded.picture)
              .then(response => response.blob())
              .then(blob => {
                const reader = new FileReader()
                reader.onloadend = () => {
                  const base64data = reader.result
                  console.log('Fetched profile picture, caching it')
                  localStorage.setItem(PROFILE_PICTURE_CACHE_KEY, base64data)
                  localStorage.setItem(PROFILE_PICTURE_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION_MS).toString())
                  this.profilePicture = base64data
                }
                reader.readAsDataURL(blob)
              })
              .catch(error => {
                console.error('Error fetching profile picture:', error)
              })
          } else {
            console.log('No picture found in token')
          }
        }
        */
      } catch (error) {
        console.error('Error decoding token:', error)
      }

      localStorage.setItem('auth_token', token)
    },

    async logout() {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } finally {
        this.token = null
        this.isAuthenticated = false
        this.user = null
        this.userid = null
        this.profilePicture = null
        localStorage.removeItem('auth_token')
        localStorage.removeItem(PROFILE_PICTURE_CACHE_KEY)
        localStorage.removeItem(PROFILE_PICTURE_CACHE_EXPIRY_KEY)
      }
    },

    // Initialize the store with stored token
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.setToken(token)
      }
    },

    async checkAuth() {
      try {
        this.loading = true
        const response = await fetch('/api/v1/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          this.user = userData
          this.userid = userData.user_id
          this.isAuthenticated = true
        } else {
          this.logout()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        this.logout()
      } finally {
        this.loading = false
      }
    }
  }
})
