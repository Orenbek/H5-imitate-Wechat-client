import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    session: '',
    username: 'bunny',
    userid: '390363',
    password: 'webonline',
    REG : {
      method: "REG",
    username: '',
    password: '',
    version: "1.0"
    },
    LOGIN : {
      method:"LOGIN",
      userid: '',
      password: '',
      version:"1.0"
    },
    LOGOUT : {
      method:"LOGOUT",
      userid: '',
      session: '',
      version:"1.0"
    },
    PING : {
      method:"PING",
      userid: '',
      session: '',
      version:"1.0"
    },
    USERLIST : {
      method:"USERLIST",
      userid: '',
      session: '',
      version:"1.0"
    },
    CHAT : {
      method:"CHAT",
      userid: '',
      session: '',
      request: [''],
      version:"1.0"
    },
    ADDFRIEND : {
      method:"ADDFRIEND",
      userid: '',
      session: '',
      request: [''],
      version:"1.0"
    },
    DELFRIEND : {
      method:"DELFRIEND",
      userid: '',
      session: '',
      request: [''],
      version:"1.0"
    },
    LISTFRIEND : {
      method:"LISTFRIEND",
      userid: '',
      session: '',
      version:"1.0"
    },
  },
  mutations: {

  },
  actions: {

  }
})
