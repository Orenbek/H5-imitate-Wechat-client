<template>
  <div class="container">
    <div class="phone-content">
      <transition-group tag="ul" class="msg-list" name="fade">
        <li v-for="(item, index) in currentChunkList" :key="index"
          class="msg" @click="onPlay(index)" @touchend.prevent="onPlay(index)">
          <img class="avatar" :src="myAvatar" />
          <div v-cloak class="audio" :style="{width: 20 * item.duration + 'px'}" :class="{wink: item.wink}">
            <span>(</span>
            <span>(</span>
            <span>(</span>
          </div>
          <div class="duration">{{item.duration}}"</div>
        </li>
        <li
          v-for="(item, index) in currentChunkList"
          :key="index"
          class="msg"
          @click="onPlay(index)"
          @touchend.prevent="onPlay(index)"
        >
          <div class="avatar1"></div>
          <div v-cloak class="audio1" :style="{width: 20 * item.duration + 'px'}" :class="{wink: item.wink}" >
            <span>)</span>
            <span>)</span>
            <span>)</span>
          </div>
          <div class="duration1">{{item.duration}}"</div>
        </li>
        <li :key="1" class="textlist te1">
           <img class="avatar av1" :src="myAvatar"/>
          <div class="textmes tm1">
            <div class="textcontent tt1">
                <pre class="pre">这是消息的伙食费水电费幻色粉水电费考核室深粉色发货是否合适绥芬河</pre>
            </div>
          </div>
        </li>
        <li :key="2" class="textlist te2">
           <img class="avatar av2" :src="myAvatar"/>
          <div class="textmes tm2">
            <div class="textcontent tt2">
                <pre class="pre">这</pre>
            </div>
          </div>
        </li>
        <li :key="1" class="textlist te2">
           <img class="avatar av2" :src="myAvatar"/>
          <div class="textmes tm2">
            <div class="textcontent tt2">
                <pre class="pre">这是消息的伙食费水电费幻色粉水电费考核室深粉色发货是否合适绥芬河</pre>
            </div>
          </div>
        </li>
      </transition-group>
      <audio ref="audio"></audio>
    </div>
    <div class="buttom">
      <div class="bq">
        <div class="phone-operate" @mousedown="onMousedown" @touchstart.prevent="onMousedown"
          @mouseup="onMouseup" @touchend.prevent="onMouseup">{{btnText}}</div>
        <div class="phone-operate" @mousedown="onMousedown" @touchstart.prevent="onMousedown"
          @mouseup="onMouseup" @touchend.prevent="onMouseup">摄像头</div>
        <div class="controller">
          <img @click="onDelete" src="@/img/delete.png" alt="清除" />
          <img @click="wsSendText" style="margin: 2px 12px 0;" src="@/img/submit.png" alt="发送" />
        </div>
      </div>
      <textarea class="textarea" v-model="notedata" autofocus placeholder="在此输入发送的消息..."></textarea>
    </div>
  </div>
</template>

<script>
import { onPost } from "@/services/api";
import store from "@/store";
var ws;
// const ws = new WebSocket("ws://localhost:8000");
// 遍历currentMessage
// currentMessage = [
//     {
//       index: 0,
//       mes: "",
//       userid: "我的id",
//       objectid: "",
//       type: "text",
//     },
//     {
//       index: 1,
//       stream: "",
//       duration: 123,
//       userid: "对方的id",
//       objectid: "",
//       type: "audio",
//     },
//     {
//       index: 3,
//       mes: "",
//       userid: "我的id",
//       objectid: "",
//       type: "video",
//     },
// ];
// 收到消息 先要判断宿主 根据宿主ID把信息存进chatList中
export default {
  props: {},
  components: {},
  data() {
    let choosenId = store.state.choosenId;
    let myAvatar = store.state.myAvatar;
    return {
      myAvatar,
      notedata: "",
      chunks: [],
      btnText: "按住说话",
      chatList: [],
      //包含整个语音消息，包含我的和对方的
      noteList: [],
      //包含整个文字信息，包含我的和对方的
      currentNoteList: [],
      //包含当前我和当前用户之间的文字消息
      currentChunkList: [],
      //包含当前我的当前用户之间的语音消息
      currentMessage: [],
      //包含当前我和当前用户之间的所有消息
      choosenId: choosenId ? choosenId : "",
      index:[]
    };
  },
  computed: {
    getChoosenId() {
      this.choosenId = store.state.choosenId;
    },
    getCurrentChunkList() {
      this.currentChunkList = this.chatList[this.choosenId];
    },
    getCurrentNoteList() {
      this.currentNoteList = this.noteList[this.choosenId];
    },
    getAvatar() {
      this.myAvatar = store.state.myAvatar;
    }
  },
  mounted: function() {
    if (!navigator.mediaDevices) {
      alert("您的浏览器不支持获取用户设备");
      return;
    }
    if (!window.MediaRecorder) {
      alert("您的浏览器不支持录音");
      return;
    }
    this.audio = this.$refs.audio;
    this.requestAudioAccess();
    this.onInitWs();
  },
  methods: {
    onDelete() {
      this.notedata = "";
    },
    onInitWs() {
      ws = new WebSocket("ws://localhost:8000");
      ws.addEventListener("open", this.wsOpen);
      ws.addEventListener("message", this.wsMessage);
      ws.addEventListener("close", this.wsClose);
      ws.addEventListener("error", this.wsError);
      //readyState属性返回实例对象的当前状态，共有四种。
      //CONNECTING：值为0，表示正在连接。
      //OPEN：值为1，表示连接成功，可以通信了。
      //CLOSING：值为2，表示连接正在关闭。
      //CLOSED：值为3，表示连接已经关闭，或者打开连接失败
      //例如：if (ws.readyState == WebSocket.CONNECTING) { }
    },
    wsOpen(e) {
      console.log("connected! ", e);
    },
    wsMessage(event) {
      if (typeof event.data === String) {
        console.log("Received data string", event);
      }
      if (event.data instanceof ArrayBuffer) {
        var buffer = event.data;
        console.log("Received arraybuffer");
      }
      console.log("Received Message: " + event.data);
      let result = JSON.parse(event.data);
      switch (result.type) {
        case "audio":
          this.wsReceiveAudio(result);
          break;
        case "video":
          this.wsReceiveVideo(result);
          break;
        case "text":
          this.wsReceiveText(result);
          break;
      }
    },
    wsClose(event) {
      console.log("已经关闭连接");
    },
    wsError() {
      console.log("连接出现问题");
    },
    wsSend(message) {
      if (ws.readyState == WebSocket.OPEN) {
        message = JSON.stringify(message);
        ws.send(message);
      } else {
        alert("已经断开socket连接，请重新连接websocket服务器");
      }
    },
    wsSendText() {
      let m = {
        mes: this.notedata,
        userid: store.state.userid,
        objectid: [this.choosenId],
        type: "text"
      };
      this.wsSend(m);
    },
    wsSendAudio(audioStream, duration) {
      let m = {
        audioStream: audioStream,
        duration: duration,
        userid: store.state.userid,
        objectid: [this.choosenId],
        type: "audio"
      };
      this.wsSend(m);
    },
    wsReceiveText(val) {
      //收到的消息，应该push进发来消息对应的userid下面
      this.index[val.userid] += 1;
      val.index = this.index[val.userid];
      this.noteList[val.userid].push(val);
      // this.currentNoteList;
      //currentNoteList需要跟踪notelist的变化。
    },
    wsReceiveAudio(val) {
      console.log(val);
    },
    wsReceiveVideo(val) {
      console.log(val);
    },

    requestAudioAccess() {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(
        stream => {
          this.recorder = new window.MediaRecorder(stream);
          this.bindEvents();
        },
        error => {
          alert("出错，请确保已允许浏览器获取录音权限");
        }
      );
    },

    onMousedown() {
      this.onStart();
      this.btnText = "松开结束";
    },

    onMouseup() {
      this.onStop();
      this.btnText = "按住说话";
    },

    onStart() {
      this.recorder.start();
    },

    onStop() {
      this.recorder.stop();
    },

    onPlay(index) {
      let choosenId = this.choosenId;
      let chunkList = this.chatList[choosenId];
      if (!chunkList) {
        this.chatList[choosenId] = [];
        chunkList = [];
      }
      chunkList.forEach(item => {
        this.$set(item, "wink", false);
      });

      let item = chunkList[index];
      this.audio.src = item.stream;
      this.audio.play();

      this.bindAudioEvent(index);
    },

    bindAudioEvent(index) {
      let choosenId = this.choosenId;
      let chunkList = this.chatList[choosenId];
      if (!chunkList) {
        this.chatList[choosenId] = [];
        chunkList = [];
      }
      let item = chunkList[index];

      this.audio.onplaying = () => {
        this.$set(item, "wink", true);
      };

      this.audio.onended = () => {
        this.$set(item, "wink", false);
      };
    },

    bindEvents() {
      this.recorder.ondataavailable = this.getRecordingData;
      this.recorder.onstop = this.saveRecordingData;
    },

    getRecordingData(e) {
      this.chunks.push(e.data);
    },

    saveRecordingData() {
      let blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" }),
        audioStream = URL.createObjectURL(blob),
        //估算时长
        duration = parseInt(blob.size / 6600);
      if (duration <= 0) {
        alert("说话时间太短");
        return;
      }
      if (duration > 60) {
        duration = 60;
      }
      this.wsSendAudio(audioStream, duration);


      let choosenId = this.choosenId;
      let chunkList = this.chatList[choosenId];
      if (!chunkList) {
        this.chatList[choosenId] = [];
        chunkList = [];
      }
      this.index[choosenId]+=1;
      chunkList.push({ duration: duration, stream: audioStream, 
      type: 'audio', userid: store.state.userid, index: this.index[choosenId] });
      this.chatList[choosenId] = chunkList;
      this.chunks = [];
      this.currentChunkList = chunkList;
      // this.$nextTick(()=>{
      //   this.chatList[choosenId] = chunkList;
      //   this.currentChunkList = chunkList;
      //   this.chunks = [];
      // })
      //事件循环机制，放到下一个循环去渲染。
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
  margin: 0;
  bottom: 0px;
  left: 0px;
  width: 100%;
  /* border-top: 1px solid #bfbfbf; */
  box-shadow: 0 -1px 1px rgba(0, 0, 0, 0.1);
  background: #e6e6e6;
  height: 180px;
}
.bq {
  height: 28px;
}
.controller {
  float: right;
}
.controller img {
  width: 24px;
  height: 24px;
  margin-top: 2px;
  cursor: pointer;
}
.textarea {
  display: block;
  font-size: 16px;
  width: 100%;
  height: 145px;
  border: none;
}
.phone-operate {
  float: left;
  /* display: inline-block; */
  width: calc(50% - 40px);
  line-height: 28px;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
}
.phone-operate:active {
  background-color: #95a5a6;
}
.phone-operate:active:before {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  top: -2px;
  content: "";
  width: 0%;
  height: 2px;
  background-color: #7bed9f;
  animation: loading 1s ease-in-out infinite backwards;
}
.phone-content {
  height: calc(100% - 180px);
  background: #e6e6e6;
}

.msg-list {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.msg-list::-webkit-scrollbar {
  display: none;
}
.msg-list .msg {
  list-style: none;
  padding: 0 8px;
  margin: 10px 0;
  overflow: hidden;
  cursor: pointer;
}
.msg-list .msg .avatar,
.msg-list .msg .audio,
.msg-list .msg .duration {
  float: right;
}
.msg-list .msg .avatar1,
.msg-list .msg .audio1,
.msg-list .msg .duration1 {
  float: left;
}
.msg-list .msg .avatar {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #000;
  /* background: url('https://denzel.netlify.com/hero.png') 0 0; */
  background-size: 100%;
}
.msg-list .msg .avatar1 {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #000;
  background: url("https://denzel.netlify.com/hero.png") 0 0;
  background-size: 100%;
}
.msg-list .msg .audio {
  position: relative;
  margin-right: 6px;
  max-width: 116px;
  min-width: 30px;
  height: 24px;
  line-height: 24px;
  padding: 0 4px 0 10px;
  border-radius: 2px;
  color: #000;
  text-align: right;
  background-color: rgba(107, 197, 107, 0.85);
}
.msg-list .msg .audio1 {
  position: relative;
  margin-left: 6px;
  max-width: 116px;
  min-width: 30px;
  height: 24px;
  line-height: 24px;
  padding: 0 4px 0 10px;
  border-radius: 2px;
  color: #000;
  text-align: left;
  background-color: rgba(194, 194, 194, 0.678);
}
.msg-list .msg.eg {
  cursor: default;
}
.msg-list .msg.eg .audio {
  text-align: left;
}
.msg-list .msg .audio:before {
  position: absolute;
  right: -8px;
  top: 8px;
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px;
  border-color: transparent transparent transparent rgba(107, 197, 107, 0.85);
}
.msg-list .msg .audio span {
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  transform-origin: center;
}
.msg-list .msg .audio span:nth-child(1) {
  font-weight: 400;
}
.msg-list .msg .audio span:nth-child(2) {
  transform: scale(0.8);
  font-weight: 500;
}
.msg-list .msg .audio span:nth-child(3) {
  transform: scale(0.5);
  font-weight: 700;
}
.msg-list .msg .audio.wink span {
  animation: wink 1s ease infinite;
}

.msg-list .msg.eg .audio1 {
  text-align: left;
}
.msg-list .msg .audio1:before {
  position: absolute;
  left: -8px;
  top: 8px;
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px;
  border-color: transparent rgba(194, 194, 194, 0.678) transparent transparent;
}
.msg-list .msg .audio1 span {
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  transform-origin: center;
}
.msg-list .msg .audio1 span:nth-child(3) {
  font-weight: 400;
}
.msg-list .msg .audio1 span:nth-child(2) {
  transform: scale(0.8);
  font-weight: 500;
}
.msg-list .msg .audio1 span:nth-child(1) {
  transform: scale(0.5);
  font-weight: 700;
}
.msg-list .msg .audio1.wink span {
  animation: wink 1s ease infinite;
}

.msg-list .msg .duration {
  margin: 3px 2px;
}
.msg-list .msg .duration1 {
  margin: 3px 2px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
@keyframes wink {
  from {
    color: rgba(255, 255, 255, 0.8);
  }
  to {
    color: rgba(255, 255, 255, 0.1);
  }
}
@keyframes loading {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.textmes{
  word-wrap: break-word;
  word-break: break-all;
  min-height: 25px;
  position: relative;
  max-width: 182px;
  min-width: 30px;
  /* line-height: 24px; */
  padding: 0 4px 0 10px;
  border-radius: 2px;
  color: #000;
}
.textmes.tm1{
  margin-right: 6px;
  text-align: right;
  background-color: rgba(107, 197, 107, 0.85);
}
.textmes.tm2{
  margin-left: 6px;
  text-align: left;
  background-color: rgba(194, 194, 194, 0.678);
}
.textmes.tm1:before{
   position: absolute;
  right: -8px;
  top: 8px;
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px;
  border-color: transparent transparent transparent rgba(107, 197, 107, 0.85);
}
.textmes.tm2:before{
   position: absolute;
  left: -8px;
  top: 8px;
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px;
  border-color: transparent rgba(194, 194, 194, 0.678) transparent transparent;
}
.textcontent{
  padding: 9px 13px;
  word-break: break-all;
  font-size: 14px;
}
.textcontent.tt1{
  text-align: left;
}
.textcontent.tt2{
  text-align: right;
}
.pre{
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  white-space: pre-wrap;
  word-break: normal;
}
.textlist{
  list-style: none;
  padding: 0 8px;
  margin: 10px 0;
  overflow: hidden;
}
.textlist .tm1,
.textlist .av1{
  float: right;
}
.textlist .tm2,
.textlist .av2{
  float: left;
}
.textlist .avatar{
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #000;
  background-size: 100%;
}
</style>
