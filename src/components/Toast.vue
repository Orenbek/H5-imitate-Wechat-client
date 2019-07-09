<template>
  <div class="toast" v-show="toastShow">{{toastText}}</div>
</template>

<script>
export default {
  props: {
    toastText: String
  },
  data() {
    return {toastShow: true};
  },
  mounted: function() {
    let v = this;
    v.toastShow = true;
    setTimeout(function() {
    v.toastShow = false;
      }, 1500);
  },
  methods: {
  }
};
</script>

<style scoped>
.toast {
  position: fixed;
  z-index: 1000;
  left: 50%;
  top: 18%;
  transition: all 2s;
  -webkit-transform: translateX(-50%) translateY(-50%);
  -moz-transform: translateX(-50%) translateY(-50%);
  -ms-transform: translateX(-50%) translateY(-50%);
  -o-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
  border-radius: 5px;
  color: #fff;
  background: rgba(17, 17, 17, 0.7);
  height: 45px;
  line-height: 45px;
  padding: 0 15px;
  max-width: 150px;
}
</style>
