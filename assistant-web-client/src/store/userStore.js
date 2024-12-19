import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    isAuthenticated: false,
    user: null
  }),

  actions: {
    setToken(token) {
      this.token = token
      this.isAuthenticated = true
      // Store token in localStorage for persistence
      localStorage.setItem('auth_token', token)
    },

    logout() {
      this.token = null
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('auth_token')
    },

    // Initialize the store with stored token
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.token = token
        this.isAuthenticated = true
      }
    }
  }
})
