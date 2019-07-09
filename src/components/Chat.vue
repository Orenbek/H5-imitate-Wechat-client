<template>
  <div class="container">
    <div>show</div>
    <div class="buttom">
      <div class="controller">
        <img src="@/img/delete.png" alt="清除" />
        <img style="margin: 2px 12px 0;" src="@/img/submit.png" alt="发送" />
      </div>
      <textarea class="textarea" cols="" rows="" autofocus placeholder="在此输入发送的消息..."></textarea>
    </div>
  </div>
</template>

<script>
export default {
  props: {},
  data() {
    return {};
  },
  mounted: function() {},
  methods: {}
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
