import Vue from 'vue'
import Vuex from 'vuex'
import { logout } from '@/api/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    HOST: 'http://localhost:8080',
    avatar: ''
  },
  getters: {
  },
  mutations: {
    setAvatar(state, avatar) {
      state.avatar = avatar
    }
  },
  actions: {
    logout({ commit }) {
      return new Promise(resolve => {
        logout().then(res => {
          
        })
        resolve()
      })
    }
  },
  modules: {
  }
})
