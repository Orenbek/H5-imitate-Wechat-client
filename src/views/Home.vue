<template>
  <div class="home">
    <template v-if="session===''">
    <Login></Login>
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
import { apiService, HTTP_TYPE } from "@/services/api";
import store from '@/store'

export default {
  name: "home",
  store,
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
    let userid = '390363';
    let username = 'bunny';
    let password = 'webonline';
    let session = store.state.session;
    let objectUserId = '';
      return {
        session,
        userid,
        username,
        objectUserId,
      }
  },
  methods: {
    async onPost(param) {
      let res = await apiService(HTTP_TYPE.POST, `/backend`,param);
      console.log(res);
      return res;
    },
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
.users {
  display: inline-block;
}
.radio {
  display: inline-block;
  width: calc(100% - 280px);
}
</style>
