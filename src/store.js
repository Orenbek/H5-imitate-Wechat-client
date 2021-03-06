import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    mqttServ: 'mqtt://10.112.163.194',
    wsHost: "ws://localhost:8000",
    choosenId:'1',
    myAvatar: '',
    session: '',
    username: 'bunny',
    userid: '1',
    password: 'webonline',
    userList: [],
    REG: {
      method: "REG",
      username: '',
      password: '',
      version: "1.0"
    },
    LOGIN: {
      method: "LOGIN",
      userid: '',
      password: '',
      version: "1.0"
    },
    LOGOUT: {
      method: "LOGOUT",
      userid: '',
      session: '',
      version: "1.0"
    },
    PING: {
      method: "PING",
      userid: '',
      session: '',
      version: "1.0"
    },
    USERLIST: {
      method: "USERLIST",
      userid: '',
      session: '',
      version: "1.0"
    },
    CHAT: {
      method: "CHAT",
      userid: '',
      session: '',
      request: [''],
      version: "1.0"
    },
    ADDFRIEND: {
      method: "ADDFRIEND",
      userid: '',
      session: '',
      request: [''],
      version: "1.0"
    },
    DELFRIEND: {
      method: "DELFRIEND",
      userid: '',
      session: '',
      request: [''],
      version: "1.0"
    },
    LISTFRIEND: {
      method: "LISTFRIEND",
      userid: '',
      session: '',
      version: "1.0"
    },
    INFO:{
      method: "INFO",
      userid: '',
      session: '',
      version: '1.0'
    }
  },
  mutations: {
    set(state,{key,val}){
      state[key] = val;
    },
    initParam(state,val){
      Object.keys(state).map((key,index)=>{
        Object.keys(val).map((key1,index1)=>{
          if(state[key].hasOwnProperty(key1)){
              state[key][key1] = val[key1];
          }
        });
      });
    },
  },
  actions: {

  }
})