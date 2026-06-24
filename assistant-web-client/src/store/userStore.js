import { defineStore } from 'pinia'
import baseApi from '../utils/baseApi'
import { getAuthConfig } from '../utils/authConfig'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    profilePicture: null,
    loading: false,
    authInitialized: false
  }),

  actions: {
    async initializeAuth() {
      if (this.authInitialized) return

      this.loading = true
      try {
        // Fast path: already have valid app cookies
        await this.checkAuth()
      } catch {
        // No valid app session — check auth mode before giving up
        try {
          const { auth_mode } = await getAuthConfig()
          if (auth_mode === 'cloudflare') {
            // Bootstrap app session from the CF Access JWT that CF already set
            await baseApi.post('/auth/cf/session')
            await this.checkAuth()
          } else {
            // Google mode: user needs to click Sign In on the home page
            this.isAuthenticated = false
          }
        } catch (err) {
          console.warn('[auth] initializeAuth failed:', err)
          this.isAuthenticated = false
        }
      } finally {
        this.loading = false
        this.authInitialized = true
      }
    },

    async checkAuth() {
      const { data } = await baseApi.get('/auth/me')
      this.user = data
      this.isAuthenticated = true
      this.profilePicture = data.picture
    },

    async logout() {
      try {
        await baseApi.post('/auth/logout')
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        this.isAuthenticated = false
        this.user = null
        this.profilePicture = null
      }
    }
  }
})
