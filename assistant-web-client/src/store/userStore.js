import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    isAuthenticated: false,
    user: null,
    profilePicture: null
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
        // Enhanced logging for profile picture
        if (decoded.picture) {
          console.log('Found picture in token:', decoded.picture)
          this.profilePicture = decoded.picture
          console.log('Profile picture set in store:', this.profilePicture)
        } else {
          console.log('No picture found in token')
        }
      } catch (error) {
        console.error('Error decoding token:', error)
      }

      localStorage.setItem('auth_token', token)
    },

    logout() {
      this.token = null
      this.isAuthenticated = false
      this.user = null
      this.profilePicture = null
      localStorage.removeItem('auth_token')
    },

    // Initialize the store with stored token
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.setToken(token)
      }
    }
  }
})
