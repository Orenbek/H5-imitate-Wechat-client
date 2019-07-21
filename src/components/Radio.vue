<template>
  <div class="container">
    <div class="bgimg"></div>
    <div class="radio-name">我的电台</div>
    <!-- <div class="jsmpeg" data-url="out.ts"></div> -->
    <div class="post-img">
      <img class="album" src="@/img/post.jpg" />
      <img class="border" src="@/img/border.png" />
    </div>
    <div class="song-name">歌曲名字</div>
    <div class="controller">
      <img src="@/img/previous.png" />
      <img @click="onTap" class="play" src="@/img/play.png" />
      <img src="@/img/next.png" />
    </div>
  </div>
</template>

<script>
require('@/services/jsmpeg.min.js');
export default {
  data() {
    const publicPath = process.env.BASE_URL;
    const url = `${publicPath}/out.ts`;
    const player = new JSMpeg.Player(url)
    return { playOrPause: "@/img/play.png", torf: false, player,url };
  },
  computed: {
    // playOrPause: function(){
    //   if(this.playOrPause==='@/img/play.png'){
    //     this.playOrPause = '@/img/pause.png'
    //   } else{
    //     this.playOrPause = '@/img/play.png'
    //   }
    //   return this.playOrPause;
    // }
  },
  methods: {
    onTap() {
      if(this.torf){
        this.player.play();
        this.torf = false;
      } else{
        this.player.pause();
        this.torf = true;
      }
      // if (this.playOrPause === "@/img/play.png") {
      //   this.playOrPause = "@/img/pause.png";
      // } else {
      //   this.playOrPause = "@/img/play.png";
      // }
      // return this.playOrPause;
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  min-width: 400px;
  height: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.bgimg {
  width: 100%;
  height: 100%;
  position: absolute;
  background: url("../img/post.jpg") no-repeat 50%;
  z-index: -1;
  filter: blur(10px);
  text-align: center;
}
.radio-name {
  font-size: 20px;
  font-weight: 700;
  margin-top: 30px;
}
.post-img {
  margin-top: 30px;
  width: 290px;
  height: 290px;
  margin-left: calc(50% - 145px);
  position: relative;
}

.album {
  border-radius: 50%;
  /* border: 80px solid #000; */
  width: 220px;
  height: 220px;
  margin-top: 35px;
  animation: rotate 9s linear infinite;
  -moz-animation: rotate 9s linear infinite;
  -webkit-animation: rotate 9s linear infinite;
  -o-animation: rotate 9s linear infinite;
}
.border {
  width: 290px;
  height: 290px;
  position: absolute;
  top: 0px;
  left: 0px;
  animation: rotate 9s linear infinite;
  -moz-animation: rotate 9s linear infinite;
  -webkit-animation: rotate 9s linear infinite;
  -o-animation: rotate 9s linear infinite;
}
.song-name {
  margin: 5px auto;
  font-size: 20px;
  color: black;
}
.controller {
  height: 50px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.controller img {
  width: 30px;
  height: 30px;
  border-radius: 15px;
}
.controller img:hover {
  background-color: #999;
}
img.play {
  margin: 0 10px;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@-moz-keyframes rotate /* Firefox */ {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes rotate /* Safari and Chrome */ {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@-o-keyframes rotate /* Opera */ {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
