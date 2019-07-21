<template>
  <div class="container">
    <div class="phone-content">
      <transition-group tag="ul" class="msg-list" name="fade">
        <template v-for="(item, index) in this.Messages[this.choosenId]">
          <!-- 视频消息 -->
          <li v-if="item.type==='video'&&item.userid===userid" :key="index" class="msg">
          <img class="avatar" :src="myAvatar"/>
          <div class="video right" @click="onVideoPlay(index)" @touchend.prevent="onVideoPlay(index)">
            <img alt="截图" :src="item.poster">
          </div>
        </li>
        <li v-if="item.type==='video'&&item.userid!==userid" :key="index" class="msg">
          <img class="avatar1" src="https://denzel.netlify.com/hero.png"/>
          <div class="video left" @click="onVideoPlay(index)" @touchend.prevent="onVideoPlay(index)">
            <img alt="截图" :src="item.poster">
          </div>
        </li>
        <!-- 音频消息 -->
        <li v-if="item.type==='audio'&&item.userid===userid" :key="index"
          class="msg" @click="onAudioPlay(index)" @touchend.prevent="onAudioPlay(index)">
          <img class="avatar" :src="myAvatar" />
          <div v-cloak class="audio right" :style="{width: 20 * item.duration + 'px'}" :class="{wink: item.wink}">
            <span>(</span>
            <span>(</span>
            <span>(</span>
          </div>
          <div class="duration">{{item.duration}}"</div>
        </li>
        <li v-if="item.type==='audio'&&item.userid!==userid" :key="index"
          class="msg" @click="onAudioPlay(index)" @touchend.prevent="onAudioPlay(index)">
          <img class="avatar1" src="https://denzel.netlify.com/hero.png"/>
          <div v-cloak class="audio left" :style="{width: 20 * item.duration + 'px'}" :class="{wink: item.wink}" >
            <span>)</span>
            <span>)</span>
            <span>)</span>
          </div>
          <div class="duration1">{{item.duration}}"</div>
        </li>
        <!-- 文本消息 -->
        <li v-if="item.type==='text'&&item.userid===userid" :key="index" class="textlist te1">
           <img class="avatar av1" :src="myAvatar"/>
          <div class="textmes tm1">
            <div class="textcontent tt1">
                <pre class="pre">{{item.mes}}</pre>
            </div>
          </div>
        </li>
        <li v-if="item.type==='text'&&item.userid!==userid" :key="index" class="textlist te2">
           <div class="avatar av2" ></div>
          <div class="textmes tm2">
            <div class="textcontent tt2">
                <pre class="pre">{{item.mes}}</pre>
            </div>
          </div>
        </li>
        </template>
      </transition-group>
          <video ref="video" width="200" @click="showVideo(false)" @touchend.prevent="showVideo(false)"></video>
          <!-- <video class="mface" ref="facetime1" width="200" ></video>
          <video class="oface" ref="facetime2" width="200" ></video> -->
          <canvas ref="canvas"></canvas>
          <audio ref="audio"></audio>
    </div>
    <div class="buttom">
      <div class="bq">
        <div class="phone-operate" @mousedown="onAudioMousedown" @touchstart.prevent="onAudioMousedown"
          @mouseup="onAudioMouseup" @touchend.prevent="onAudioMouseup">{{btnAudio}}</div>
        <div class="phone-operate" @mousedown="onVideoMousedown" @touchstart.prevent="onVideoMousedown" 
          @mouseup="onVideoMouseup" @touchend.prevent="onVideoMouseup">{{btnVideo}}</div>
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
import { format } from 'path';
import Trans from "@/assets/transport.js"
var ws;
export default {
  props: {},
  components: {},
  data() {
    let myAvatar = store.state.myAvatar;
    let userid = store.state.userid;
    let bufferBlob;
    return {
      myAvatar,
      notedata: "",
      userid,
      audioChunks: [],
      videoChunks: [],
      btnAudio: "按住说话",
      btnVideo: "按住拍视频",
      audioList: [],
      videoList: [],
      //包含整个语音消息，包含我的和对方的
      noteList: [],
      //包含整个文字信息，包含我的和对方的
      // currentNoteList: [],
      // //包含当前我和当前用户之间的文字消息
      // currentChunkList: [],
      // //包含当前我的当前用户之间的语音消息
      // currentMessage: [],
      // //包含当前我和当前用户之间的所有消息
      Messages: [],
      // choosenId: choosenId ? choosenId : "",
      choosenId: '',
      index:[],
      bufferParam: {},
      bufferBlob,
      buffImgArr: [],
      faceingObjId: '',
      faceStreamChunks: [],
      //为了本地测试
    };
  },
  created(){
    Trans.$on('choose',(data)=>{
        this.choosenId = data;
      })
    // this.onCapture(val.userid,this.index[val.userid]);
  },
  watch: {
    choosenId(){
      if(this.buffImgArr[this.choosenId]&&this.buffImgArr[this.choosenId]!==undefined){
        this.onCapture(this.choosenId);
      } else{
        this.buffImgArr[this.choosenId] = [];
      }
    }
  },
  computed: {
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
    this.video = this.$refs.video;
    // this.myfacetime = this.$refs.facetime1;
    // this.objfacetime = this.$refs.facetime2;
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.requestAudioAccess();
    this.requestVideoAccess();
    // this.requestFaceTimeAccess();
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
      let initParam = {
        userid: store.state.userid,
        objectid: [''],
        type: "init"
      }
      this.wsSend(initParam);
      setInterval(()=>{
        this.wsSend(initParam);
      },5000);
    },
    wsMessage(event) {
      if (typeof event.data === String) {
        console.log("Received data string");
      }
      if (event.data instanceof ArrayBuffer) {
        console.log("Received arraybuffer");
      }
      if(event.data instanceof Blob){
          this.buffer(event); 
          //facingObj的逻辑要改
      } else{
          let result = JSON.parse(event.data);
        switch (result.type) {
          case "faceTime":
            this.wsFaceTimeRequest(result);
            break;
          case "audio":
            this.wsReceiveAudio(result);
            break;
          case "video":
            this.wsReceiveVideo(result);
            break;
          case "text":
            this.wsReceiveText(result);
            break;
          case "hash":
            this.SendItBack(result)
            break;
          case "userList":
            store.commit('set',{key:'userList',val:result.userList});
            break;
        }
      }
      
    },
    wsClose(event) {
      console.log("已经关闭连接");
    },
    wsError() {
      console.log("连接出现问题");
    },
    wsSend(message,blob) {
      if (ws.readyState == WebSocket.OPEN) {
        message = JSON.stringify(message);
        if(blob){
          ws.send(blob);
        } else{
        ws.send(message);
        }
        //websocket每次只能传输一种数据类型(尝试了多种途径一次传输多个，但没有成功)
      } else {
        alert("已经断开socket连接，请重新连接websocket服务器");
      }
    },

    //send方法中的逻辑都是相近的，都是发送的同时把数据存到本地
    wsSendText() {
      let choosenId = this.choosenId;
      let m = {
        mes: this.notedata,
        userid: store.state.userid,
        objectid: [choosenId],
        type: "text"
      };
      this.wsSend(m);
      this.notedata = '';
      //收到的消息，应该push进发来消息对应的userid下面
      if(!this.index[choosenId]){
        this.index[choosenId] = 0;
      }
      
      m.index = this.index[choosenId];
      let arr = this.noteList[choosenId];
      if(arr===undefined){
        arr = [];
      }
      arr.push(m);
      this.noteList[choosenId] = arr;
      // this.$set(this.noteList,choosenId,arr);
      let M = this.Messages[choosenId];
      if(M===undefined){
        M = [];
      }

      M.push(...arr)
      M = Array.from(new Set(M))
      this.$set(this.Messages,choosenId,M);

      this.index[choosenId] += 1;
    },
    wsSendAudio(blob, audioStream, duration) {
      let choosenId = this.choosenId;
      let m = {
        duration: duration,
        userid: store.state.userid,
        objectid: [choosenId],
        type: "audio"
      };
      this.bufferParam = m;
      this.wsSend('',blob);
      this.audioChunks = [];

      if(!this.index[choosenId]){
        this.index[choosenId] = 0;
      }
      
      let cList = this.audioList[choosenId];
      if (!cList) {
        this.audioList[choosenId] = [];
        cList = [];
      }
      cList.push({ duration: duration, audioStream: audioStream, 
      type: 'audio', userid: store.state.userid, index: this.index[choosenId] });
      this.audioList[choosenId] = cList;
      // this.$set(this.audioList,choosenId,cList);
      
      //收到的消息，应该push进发来消息对应的userid下面
      let M = this.Messages[choosenId];
      if(M===undefined){
        M = [];
      }
      
      M.push(...cList)
      M = Array.from(new Set(M))
      this.$set(this.Messages,choosenId,M);

      this.index[choosenId]+=1;
    },
    wsSendVideo(blob, videoStream, duration){
      let choosenId = this.choosenId;
      let m = {
        duration: duration,
        userid: store.state.userid,
        objectid: [choosenId],
        type: "video"
      };
      this.bufferParam = m;
      this.wsSend('',blob);
      this.videoChunks = [];

      if(!this.index[choosenId]){
        this.index[choosenId] = 0;
      }
      
      let vList = this.videoList[choosenId];
      if (!vList) {
        this.videoList[choosenId] = [];
        vList = [];
      }
      vList.push({ duration: duration, videoStream: videoStream, 
      type: 'video', userid: store.state.userid, index: this.index[choosenId] });
      this.videoList[choosenId] = vList;
      // this.$set(this.videoList,choosenId,vList);

      //收到的消息，应该push进发来消息对应的userid下面
      let M = this.Messages[choosenId];
      if(M===undefined){
        M = [];
      }
      M.push(...vList)
      M = Array.from(new Set(M))
      this.$set(this.Messages,choosenId,M);
      
      this.buffImgArr[choosenId] ? this.buffImgArr[choosenId] : [];
      console.log('choosenId ',this.buffImgArr[choosenId]);
      this.buffImgArr[choosenId].push(this.index[choosenId]);
      this.onCapture(choosenId);
      //生成截图
      //隐藏video
      this.showVideo(false);
      this.video.srcObject = null;

      this.index[choosenId]+=1;
    },
    wsReceiveText(val) {
      //收到的消息，应该push进发来消息对应的userid下面
      if(!this.index[val.userid]){
        this.index[val.userid] = 0;
      }

      val.index = this.index[val.userid];
      let arr = this.noteList[val.userid];
      if(arr===undefined){
        arr = [];
      }
      arr.push(val);
      this.noteList[val.userid] = arr;
      // this.$set(this.noteList,val.userid,arr);

      let M = this.Messages[val.userid];
      if(M===undefined){
        M = [];
      }

      M.push(...arr)
      M = Array.from(new Set(M))
      this.$set(this.Messages,val.userid,M);

      this.index[val.userid] += 1;
    },
    wsReceiveAudio(val) {
      let audioStream = URL.createObjectURL(this.bufferBlob);
      val.audioStream = audioStream;
      if(!this.index[val.userid]){
        this.index[val.userid] = 0;
      }

      val.index = this.index[val.userid];
      let arr = this.audioList[val.userid];
      if(arr===undefined){
        arr = [];
      }
      arr.push(val);
      this.audioList[val.userid] = arr;
      // this.$set(this.audioList,val.userid,arr);

      let M = this.Messages[val.userid];
      if(M===undefined){
        M = [];
      }

      M.push(...arr)
      M = Array.from(new Set(M))
      this.$set(this.Messages,val.userid,M);

      this.index[val.userid] += 1;
    },
    wsReceiveVideo(val) {
      let videoStream = URL.createObjectURL(this.bufferBlob);
      val.videoStream = videoStream;
      if(!this.index[val.userid]){
        this.index[val.userid] = 0;
      }

      val.index = this.index[val.userid];
      let arr = this.videoList[val.userid];
      if(arr===undefined){
        arr = [];
      }
      arr.push(val);
      this.videoList[val.userid] = arr;
      // this.$set(this.videoList,val.userid,arr);

      let M = this.Messages[val.userid];
      if(M===undefined){
        M = [];
      }
      M.push(...arr)
      M = Array.from(new Set(M))
      this.$set(this.Messages,val.userid,M);
      //生成截图不能在这里写。因为截图是通过canvas生成的，得先canvas渲染。
      //在choosenID变化的时候再渲染当前的截图
      this.buffImgArr[val.userid]!==undefined ? this.buffImgArr[val.userid] : [];
      this.buffImgArr[val.userid].push(this.index[val.userid]);
      if(val.userid===this.choosenId){
        this.onCapture(val.userid);
      } 

      this.index[val.userid] += 1;
    },
    SendItBack(res){
      console.log(res);
      let par = this.bufferParam;
      par.random = res.random;
      ws.send(JSON.stringify(par))
    },
    buffer(event){
      this.bufferBlob = event.data;
    },

    requestAudioAccess() {
      navigator.mediaDevices.getUserMedia({audio: true}).then(
        audioStream => {
          this.audioRecorder = new window.MediaRecorder(audioStream);
          this.audioStream = audioStream;
          this.bindAudioEvents();
        },
        error => {
          alert("出错，请确保已允许浏览器获取录音权限");
        }
      );
    },

    requestVideoAccess(){
      navigator.mediaDevices.getUserMedia({audio: true,video: true}).then(
      videoStream => {
        this.videoRecorder = new window.MediaRecorder(videoStream);
        this.videoStream = videoStream;
        this.bindVideoEvents();
      }, error => {
          alert('出错，请确保已允许浏览器获取音视频权限');
      });
    },

    onAudioMousedown() {
      this.onAudioStart();
      this.btnAudio = "松开结束";
    },

    onAudioMouseup() {
      this.onAudioStop();
      this.btnAudio = "按住说话";
    },

    onVideoMousedown () {
      this.showVideo(true);
      this.onPreview();
      this.btnVideo = '松开结束';
      this.onVideoStart(); 
    },

    onVideoMouseup () {
      this.onVideoStop();
      this.btnVideo = '按住拍视频';
    },

    onPreview () {
      this.video.srcObject = this.videoStream;
      this.video.muted = true;
      this.video.play();
    },

    showVideo (bShow) {
      if(bShow) {
        this.video.style.display = 'block';
      } else {
        this.video.style.display = 'none';
				this.video.pause();
      }
    },

    onAudioStart() {
      this.audioRecorder.start();
    },

    onAudioStop() {
      this.audioRecorder.stop();
    },

    onVideoStart () {
      this.videoRecorder.start();
    },

    onVideoStop () {
      this.videoRecorder.stop();
    },

    onAudioPlay(index) {
      let choosenId = this.choosenId;
      let ITEM = this.Messages[choosenId][index]
      index = this.audioList[choosenId].indexOf(ITEM);
      let cList = this.audioList[choosenId];
      if (!cList) {
        this.audioList[choosenId] = [];
        cList = [];
      }
      cList.forEach(item => {
        this.$set(item, "wink", false);
      });

      let item = cList[index];
      this.audio.src = item.audioStream;
      this.audio.play();

      this.AudioEvent(index);
    },

    onVideoPlay (index) {
      this.showVideo(true);
      let choosenId = this.choosenId;
      let ITEM = this.Messages[choosenId][index]
      index = this.videoList[choosenId].indexOf(ITEM);
      let vList = this.videoList[choosenId];
      if (!vList) {
        this.videoList[choosenId] = [];
        vList = [];
      }
      let item = vList[index];
      this.video.src = item.videoStream;
      this.video.muted = false;
      this.video.play();

      this.VideoEvent();
    },

    AudioEvent(index) {
      let choosenId = this.choosenId;
      let cList = this.audioList[choosenId];
      if (!cList) {
        this.audioList[choosenId] = [];
        cList = [];
      }
      let item = cList[index];

      this.audio.onplaying = () => {
        this.$set(item, "wink", true);
      };

      this.audio.onended = () => {
        this.$set(item, "wink", false);
      };
    },

    VideoEvent () {
      this.video.onended = () => {
      this.showVideo(false);
      }
    },

    bindAudioEvents() {
      this.audioRecorder.ondataavailable = this.getAudioRecordingData;
      this.audioRecorder.onstop = this.saveAudioRecordingData;
    },

    bindVideoEvents () {
      this.videoRecorder.ondataavailable = this.getVideoRecordingData;
      this.videoRecorder.onstop = this.saveVideoRecordingData;
    },

    getAudioRecordingData(e) {
      this.audioChunks.push(e.data);
    },

    getVideoRecordingData (e) {
      this.videoChunks.push(e.data);
    },

    saveAudioRecordingData() {
      let blob = new Blob(this.audioChunks, { type: "audio/ogg; codecs=opus" }),
        audioStream = URL.createObjectURL(blob),
        //估算时长
        duration = Math.round(blob.size / 6000);

      if (duration <= 0) {
        alert("说话时间太短");
        return;
      }
      if (duration > 60) {
        duration = 60;
      }
      this.wsSendAudio(blob, audioStream,duration);
    },

    saveVideoRecordingData() {
      let blob = new Blob(this.videoChunks, { 'type' : 'video/webm' }),
        videoStream = URL.createObjectURL(blob),
        duration = Math.round(blob.size/80000);

      if (duration <= 0) {
        //隐藏video
        this.showVideo(false);
        this.video.srcObject = null;
        this.videoChunks = [];
        alert("说话时间太短");
        return;
      }
      if (duration > 60) {
        duration = 60;
      }
      this.wsSendVideo(blob,videoStream,duration);
    },

    //获取视频截图
    onCapture (userid) {
      let i;
      let buffArr = this.buffImgArr[userid];
      console.log('12',this.buffImgArr);
      console.log('333',this.Messages[userid]);
      for(i in buffArr){
        let item = this.Messages[userid][buffArr[i]];
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        this.canvas.toBlob((blob) => {
          let src = URL.createObjectURL(blob);
          this.$set(item, 'poster', src);
        });
      }
      this.buffImgArr[userid] = [];
      // //隐藏video
      // this.showVideo(false);
      // this.video.srcObject = null;
    },

    requestFaceTimeAccess(){
      navigator.mediaDevices.getUserMedia({audio: true,video: true}).then(
      faceStream => {
        this.faceTimeRecorder = new window.MediaRecorder(faceStream);
        this.faceStream = faceStream;
        this.bindFaceTimeEvents();
      }, error => {
          alert('出错，请确保已允许浏览器获取音视频权限');
      });
    },

    bindFaceTimeEvents () {
      this.faceTimeRecorder.ondataavailable = this.getFaceTimeBlob;
    },

    faceTimeOn(){
      this.showMyFaceTime(true);
      let m = {
        userid: this.userid,
        objectid: [this.choosenId],
        type: "faceTime",
        state: "launch",
      };
      // this.wsSend(m);
      // this.faceingObjId = choosenId;
      this.faceTimeStarted();
    },

    getFaceTimeBlob(e){
      // this.wsSend('',e.data);

      // this.faceStreamChunks.push(e.data);
      let blob = new Blob(this.faceStreamChunks, { 'type' : 'video/webm' }),
        objFaceStream = URL.createObjectURL(blob),
        duration = Math.round(blob.size/80000);
      this.objFaceStream = objFaceStream;
      this.showObjFaceTime(true);
    },

    showMyFaceTime(show) {
      if(show){
        this.myfacetime.style.display = 'block';
        this.myfacetime.srcObject = this.faceStream;
        this.myfacetime.muted = true;
        this.myfacetime.play();
      } else{
        this.myfacetime.style.display = 'none';
        this.myfacetime.srcObject = null;
      }
    },

    showObjFaceTime(show){
      if(show){
        this.objfacetime.style.display = 'block';
        this.objfacetime.src = this.objFaceStream;
        this.objfacetime.muted = false;
        this.objfacetime.play();
      } else{
        this.objfacetime.style.display = 'none';
      }
    },

    wsFaceTimeRequest(res){
      // 收到FaceTime邀请或者发出的邀请的相应。
      if(res.state==='launch'){
        //收到邀请 打开我的视角
        this.faceingObjId = res.objectid[0];
        if(this.faceingObjId===this.choosenId){
          this.showMyFaceTime(true);
        }
        return;
      }
      if(res.state==='accept'){
        //邀请被接受
        this.showObjFaceTime(true);
        return;
      }
      if(res.state==='break'){
        //邀请被拒绝
        this.faceingObjId = '';
        this.showMyFaceTime(false);
      }
    },

    faceTimeAccept(){
      //给服务器发送接受FaceTime消息
      let m = {
        userid: this.userid,
        objectid: [choosenId],
        type: "faceTime",
        state: "accept",
      };
      this.wsSend(m);
      this.faceTimeStarted();
    },

    faceTimeReject(){
      //给服务器发送拒绝FaceTime消息
      let m = {
        userid: this.userid,
        objectid: [choosenId],
        type: "faceTime",
        state: "break",
      };
      this.wsSend(m);
      this.faceingObjId = '';
    },

    faceTimeStarted(){
      //开始视频聊天后 打开对方视角 
      this.showObjFaceTime(true)
      this.faceTimeRecorder.start();
      var interval = setInterval(() => {
        if(this.faceTimeRecorder.state==='recording'){
        this.faceTimeRecorder.requestData();
      } else{
        clearInterval(interval);
      }
      },1000);
    },

    receiveFaceStream(blob){
      this.objFaceStream = URL.createObjectURL(blob);
    },
    
    faseTimeOff(){
      this.faceTimeRecorder.stop();
      this.showMyFaceTime(false);
      this.showObjFaceTime(false)
      // 发送取消FaceTime消息
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
.controller img:hover{
  background: rgba(133, 127, 127, 0.3);
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
.avatar,
.msg-list .msg .audio,
.msg-list .msg .duration {
  float: right;
}
.avatar1,
.msg-list .msg .audio.left,
.msg-list .msg .duration1 {
  float: left;
}
.avatar {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #000;
  background-size: 100%;
}
.avatar1 {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #000;
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
.msg-list .msg .audio.right{
  margin-right: 6px;
  text-align: right;
  background-color: rgba(107, 197, 107, 0.85);
}
.msg-list .msg .audio.left {
  margin-left: 6px;
  text-align: left;
  background-color: rgba(194, 194, 194, 0.678);
}
.msg-list .msg.eg {
  cursor: default;
}
.msg-list .msg.eg .audio.right {
  text-align: left;
}
.msg-list .msg .audio:before {
  position: absolute;
  top: 8px;
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px;
}
.msg-list .msg .audio.right:before {
  right: -8px;
  border-color: transparent transparent transparent rgba(107, 197, 107, 0.85);
}
.msg-list .msg .audio.right span {
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  transform-origin: center;
}
.msg-list .msg .audio.right span:nth-child(1) {
  font-weight: 400;
}
.msg-list .msg .audio.right span:nth-child(2) {
  transform: scale(0.8);
  font-weight: 500;
}
.msg-list .msg .audio.right span:nth-child(3) {
  transform: scale(0.5);
  font-weight: 700;
}
.msg-list .msg .audio.right.wink span {
  animation: wink 1s ease infinite;
}

.msg-list .msg.eg .audio.left {
  text-align: left;
}
.msg-list .msg .audio.left:before {
  left: -8px;
  border-color: transparent rgba(194, 194, 194, 0.678) transparent transparent;
}
.msg-list .msg .audio.left span {
  color: rgba(255, 255, 255, 0.8);
  display: inline-block;
  transform-origin: center;
}
.msg-list .msg .audio.left span:nth-child(3) {
  font-weight: 400;
}
.msg-list .msg .audio.left span:nth-child(2) {
  transform: scale(0.8);
  font-weight: 500;
}
.msg-list .msg .audio.left span:nth-child(1) {
  transform: scale(0.5);
  font-weight: 700;
}
.msg-list .msg .audio.left.wink span {
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
.textmes::before{
  position: absolute;
  top: 8px;
  content: "";
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px;
}
.textmes.tm1::before{
  right: -8px;
  border-color: transparent transparent transparent rgba(107, 197, 107, 0.85);
}
.textmes.tm2:before{
  left: -8px;
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
.textlist .av2{
  background: url('https://denzel.netlify.com/hero.png') 0 0;
}

video {
	position: absolute;
  width: 400px;
  left: calc(50% - 200px);
	top: 0px;
	display: none;
}
video.mface{
  top: 0px;
  width: 200px;
}
video.oface{
  top: 200px;
  width: 200px;
}
/* 这里新加了些样式 */
canvas {
	display: none;
}
.msg-list .msg .video {
	position: relative;
	width: 100px;
	height: 75px;
	border-radius: 4px;
	overflow: hidden;
	color: rgba(255, 255, 255, .8);
	text-align: center;
	font-size: 0;
	cursor: pointer;
}
.msg-list .msg .video.right{
  float: right;
	margin-right: 6px;
}
.msg-list .msg .video.left{
  float: left;
	margin-left: 6px;
}
.msg-list .msg .video img {
	width: 100%;
	height: 100%;
	background-color: #636e72;
}
</style>
