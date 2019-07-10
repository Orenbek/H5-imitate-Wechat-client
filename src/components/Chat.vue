<template>
  <div class="container">
    <div></div>
    <Toast v-if="imglen>1" toastText="只能选择一张图片！" />
    <div class="buttom">
      <div class="controller">
        <img @click="onDelete" src="@/img/delete.png" alt="清除" />
        <img @click="onSend" style="margin: 2px 12px 0;" src="@/img/submit.png" alt="发送" />
      </div>
      <textarea class="textarea" v-model="notedata" autofocus placeholder="在此输入发送的消息..."></textarea>
    </div>
  </div>
</template>

<script>
import Toast from "@/components/Toast.vue";
import { onPost } from "@/services/api";
import store from "@/store";
export default {
  props: { 

    },
  components: {
    Toast
  },
  data() {
    return { avatarSrc: "", imglen: 0, notedata: "" };
  },
  mounted: function() {},
  methods: {
    onDelete() {
      this.notedata = "";
    },
    onSend() {
      let that = this;
      let param = store.state.CHAT;
      param.request[0] = store.state.choosenId;
      let res = onPost(param);
      res.then(res => {
        console.log(res);
      });
    }
  }
};
</script>

<style scoped>
.container {
  min-width: 400px;
  height: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: #e6e6e6;
}
.buttom {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  border-top: 1px solid #bfbfbf;
  background: #e6e6e6;
}
.controller {
  float: right;
  display: block;
}
.controller img {
  width: 24px;
  height: 24px;
  /* margin: 2px 0px; */
  margin-top: 2px;
}
.textarea {
  display: block;
  font-size: 16px;
  width: 100%;
  height: 150px;
  border: none;
}
</style>
