<template>
  <div class="home">
    <!-- <Login></Login> -->
    <Users class="users"></Users>
    <Radio class="radio"></Radio>
  </div>
</template>

<script scoped>
// @ is an alias to /src
import Radio from '@/components/Radio.vue';
import Login from '@/components/Login.vue';
import Users from '@/components/Users.vue';

export default {
  name: 'home',
  http: {
    headers: {
      Authorization: '',
    },
  },
  components: {
    Radio,
    Login,
    Users,
  },
  methods: {
    httpPost(e) {
      console.log('hello!');
      this.$http({
        url: '/backend',
        method: 'POST',
        // 请求体重发送的数据
        data: {
          method: 'REG',
          username: 'cat',
          password: 'web-online',
          version: '1.0',
        },
        // 设置请求头
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(
        (res) => {
          debugger;
        },
        (err) => {
          debugger;
        },
      );
    },
  },
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
