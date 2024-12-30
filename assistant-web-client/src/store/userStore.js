import { defineStore } from 'pinia'
import baseApi from '../utils/baseApi'

export const useUserStore = defineStore('user', {
  state: () => ({
    userid: null,
    isAuthenticated: false,
    user: null,
    profilePicture: null,
    loading: false
  }),

  actions: {
    // Remove token-related logic and use session-based auth
    async setAuthenticated() {
      try {
        const { data } = await baseApi.get('/auth/me')
        this.user = data
        this.userid = data.user_id
        this.isAuthenticated = true
        this.profilePicture = data.picture
      } catch (error) {
        console.error('Error setting authentication:', error)
        await this.logout()
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
    },

    // Initialize auth state by checking session
    async initializeAuth() {
      await this.checkAuth()
    },

    async checkAuth() {
      try {
        this.loading = true
        await this.setAuthenticated()
      } catch (error) {
        console.error('Auth check failed:', error)
        await this.logout()
      } finally {
        this.loading = false
      }
    }
  }
})
