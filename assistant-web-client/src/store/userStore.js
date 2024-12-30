import { defineStore } from 'pinia'
import baseApi from '../utils/baseApi'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userid: null,
    isAuthenticated: false,
    profilePicture: null,
    loading: false,
    authInitialized: false
  }),

  actions: {
    async initializeAuth() {
      if (this.authInitialized) return
      
      try {
        this.loading = true
        await this.checkAuth()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        await this.logout()
      } finally {
        this.loading = false
        this.authInitialized = true
      }
    },

    async checkAuth() {
      try {
        const { data } = await baseApi.get('/auth/me')
        this.user = data
        this.userid = data.user_id
        this.isAuthenticated = true
        this.profilePicture = data.picture
      } catch (error) {
        console.error('Auth check failed:', error)
        throw error
      }
    },

    async logout() {
      try {
        await baseApi.post('/auth/logout')
      } finally {
        this.isAuthenticated = false
        this.user = null
        this.userid = null
        this.profilePicture = null
      }
    }
  }
})
