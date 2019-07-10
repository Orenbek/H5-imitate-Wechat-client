<template>
  <div class="container">
    <button @click="onInitWs">点我</button>
    <div class="phone-content">
      <transition-group tag="ul" class="msg-list" name="fade">
        <li v-for="(item, index) in currentChunkList" :key="index" class="msg" @click="onPlay(index)" @touchend.prevent="onPlay(index)">
          <div class="avatar"></div>
          <div v-cloak class="audio" :style="{width: 20 * item.duration + 'px'}" :class="{wink: item.wink}">
            <span>(</span>
            <span>(</span>
            <span>(</span>
          </div>
          <div class="duration">{{item.duration}}"</div>
        </li>
      </transition-group>
      <audio ref="audio"></audio>
    </div>
    <div class="buttom">
      <div class="bq">
        <div class="phone-operate" @mousedown="onMousedown" @touchstart.prevent="onMousedown"
          @mouseup="onMouseup" @touchend.prevent="onMouseup" >{{btnText}}</div>
        <div class="phone-operate" @mousedown="onMousedown"  @touchstart.prevent="onMousedown"
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
// const ws = new WebSocket("ws://localhost:8000");
export default {
  props: {},
  components: {},
  data() {
    let choosenId = store.state.choosenId;
    return {
      avatarSrc: "",
      notedata: "",
      chunks: [],
      btnText: "按住说话",
      chatList: [],
      currentChunkList:[],
      choosenId: choosenId?choosenId:'',
    };
  },
  computed: {
    getChoosenId() {
      this.choosenId = state.store.choosenId;
    },
    getCurrentChunkList(){
      this.currentChunkList = this.chatList[this.choosenId];
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
    var ws = new WebSocket("ws://localhost:8000");
    ws.addEventListener('open',this.wsOpen);
    ws.addEventListener('message',this.wsMessage);
    ws.addEventListener('close',this.wsClose);
    ws.addEventListener('error',this.wsError);
    //readyState属性返回实例对象的当前状态，共有四种。
    //CONNECTING：值为0，表示正在连接。
    //OPEN：值为1，表示连接成功，可以通信了。
    //CLOSING：值为2，表示连接正在关闭。
    //CLOSED：值为3，表示连接已经关闭，或者打开连接失败
    //例如：if (ws.readyState == WebSocket.CONNECTING) { }

    },
    wsOpen(e){
      console.log('connected! ',e);
    },
    wsMessage(event){
      if (typeof event.data === String) {
        console.log("Received data string",event);
      }
      if (event.data instanceof ArrayBuffer) {
        var buffer = event.data;
        console.log("Received arraybuffer");
      }
      console.log("Received Message: " + event.data);
      let result = JSON.parse(event.data);
    },
    wsClose(event){
      console.log('已经关闭连接');
    },
    wsError(){
      console.log('连接出现问题')
    },
    wsSend(message) {
      if (ws.readyState == WebSocket.OPEN) { 
        message = JSON.stringify(message);
        ws.send(message);
      } else{
        alert('已经断开socket连接，请重新连接websocket服务器')
      }
    },
    wsSendText(){
      let m = {
        mes : this.notedata,
        userid: store.state.userid,
        objectid: [this.choosenId],
        type: 'text'
      }
      this.wsSend(m);
    },
    wsSendAudio(audioStream,duration){
      let m = {
        mes : audioStream,
        userid: store.state.userid,
        objectid: [this.choosenId],
        type: 'audio'
      };
      this.wsSend(m);
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
      wsSendAudio(audioStream,duration);

      let choosenId = this.choosenId;
      let chunkList = this.chatList[choosenId];
      if (!chunkList) {
        this.chatList[choosenId] = [];
        chunkList = [];
      }
      chunkList.push({ duration: duration, stream: audioStream });
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
.msg-list .msg .avatar {
	width: 24px;
	height: 24px;
	line-height: 24px;
	text-align: center;
	background-color: #000;
	background: url('https://denzel.netlify.com/hero.png') 0 0;
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
	content: '';
	display: inline-block;
	width: 0;
	height: 0;
	border-style: solid;
	border-width: 4px;
	border-color: transparent transparent transparent rgba(107, 197, 107, 0.85);
}
.msg-list .msg .audio span {
	color: rgba(255, 255, 255, .8);
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
	font-weight: 700
}
.msg-list .msg .audio.wink span {
	animation: wink 1s ease infinite;
}
.msg-list .msg .duration {
	margin: 3px 2px;
}
.fade-enter-active, .fade-leave-active {
	transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
	opacity: 0;
}
@keyframes wink {
	from {
		color: rgba(255, 255, 255, .8);
	}
	to {
		color: rgba(255, 255, 255, .1);
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
</style>
