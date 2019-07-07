<template>
  <div class="home">
    <template v-if="!ToF">
      <Login class="login" @logedIn="logedin"></Login>
    </template>
    <template v-else>
      <Toast toastText="登录成功"/>
      <Users class="users" v-bind:userList="userList"></Users>
      <!-- <button
      v-on:click="onPost"
      style="width:140px;height: 140px; position: relative; top:-400px;"
      >onpost</button>-->
      <Radio class="radio"></Radio>
    </template>
  </div>
</template>

<script scoped>
// @ is an alias to /src
import Radio from "@/components/Radio.vue";
import Login from "@/components/Login.vue";
import Users from "@/components/Users.vue";
import Toast from "@/components/Toast.vue";

import { onPost } from "@/services/api";
import { onPost } from "@/services/api";

import store from "@/store";

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
    Users,
    Toast
  },
  data: function() {
    let userid = store.state.userid;
    let username = store.state.username;
    let password = "webonline";
    let session = store.state.session;
    let objectUserId = "";
    return {
      ToF: false,
      session,
      userid,
      username,
      objectUserId,
      userList: []
    };
  },
  methods: {
    async getInfo(param) {
      let res = onPost(param);
      return res;
    },
    logedin(tof) {
      this.ToF = tof;
      this.getUserList();
    },
    getUserList() {
      let that = this;
      let param = store.state.USERLIST;
      let res = onPost(param);
      //这里有个问题特别注意。函数嵌套的时候，this的指向会改变。应该是请求的函数没有包装好。
      //因此每次涉及到请求的时候，都把let that = this 加上。
      res.then(res => {
        let newlist = res.data.userlist;
        let originlist = that.userList;
        that.userList = Array.from(new Set([...originlist, ...newlist]));
        //userList去重。
      });
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
.login {
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
