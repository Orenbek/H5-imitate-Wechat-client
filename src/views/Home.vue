<template>
  <div class="home">
    <template v-if="!ToF">
    <Login class="login" @logedIn="logedin"></Login>
    </template>
    <template v-else>
    <Users class="users"></Users>
    <!-- <button
      v-on:click="onPost"
      style="width:140px;height: 140px; position: relative; top:-400px;"
    >onpost</button> -->
    <Radio class="radio"></Radio>
    </template>
  </div>
</template>

<script scoped>
// @ is an alias to /src
import Radio from "@/components/Radio.vue";
import Login from "@/components/Login.vue";
import Users from "@/components/Users.vue";

import { onPost } from "@/services/api";
import store from '@/store'

export default {
  name: "home",
  http: {
    headers: {
      Authorization: ""
    }
  },
  components: {
    Radio,
    Login,
    Users
  },
  data: function(){
    let userid = store.state.userid;
    let username = store.state.username;
    let password = 'webonline';
    let session = store.state.session;
    let objectUserId = '';
      return {
        ToF: false,
        session,
        userid,
        username,
        objectUserId,
      }
  },
  methods: {
    async getInfo(param) {
      let res = onPost(param);
      return res;
    },
    logedin(tof){
      this.ToF = tof;
    }
  }
};
</script>

<style scoped>
.home {
  min-width: 500px;
  min-height: 450px;
  height: 90%;
  width: 70%;
  margin: 30px auto;
  display: block;
  white-space: nowrap;
}
.login{
  margin: auto;
  position: relative;
  top: 50%;
  margin-top: -220px;
  display: block;
}
.users {
  display: inline-block;
}
.radio {
  display: inline-block;
  width: calc(100% - 280px);
}
</style>
