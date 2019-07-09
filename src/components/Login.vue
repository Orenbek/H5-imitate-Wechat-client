<template>
  <div class="container">
    <div class="log-title">{{regOrLog}}</div>
    <template v-if="regOrLog==='登录'">
      <tr class="ap">
        <td @click="ws" class="sub">账号ID：</td>
        <td class="textarea">
          <span>
            <input type="text" v-model="userid" />
          </span>
        </td>
      </tr>
      <tr class="ap">
        <td class="sub">密码：</td>
        <td style="padding-left: 14px;" class="textarea">
          <span>
            <input type="password" v-model="password" />
          </span>
        </td>
      </tr>
    </template>
    <template v-else>
      <tr class="ap">
        <td class="sub">用户名：</td>
        <td class="textarea">
          <span>
            <input type="text" v-model="username" />
          </span>
          <span v-if="username.length>=7" style="font-size: 10px; color: red;">用户名要少于7字符</span>
        </td>
      </tr>
      <tr class="ap">
        <td class="sub">密码：</td>
        <td style="padding-left: 14px;" class="textarea">
          <span>
            <input type="password" v-model="password" />
          </span>
        </td>
      </tr>
      <tr class="ap" style="position: relative; left: -14px;">
        <td class="sub">校验密码：</td>
        <td class="textarea">
          <span>
            <input type="password" v-model="repeat" />
          </span>
          <span style="color: red; font-size: 10px;">{{password!==repeat ? '两次密码输入不一致' : ''}}</span>
          <!-- 字体最小是10px，不能再小了，不知道如何解决。先这样吧。 -->
        </td>
      </tr>
    </template>
    <div class="buttom">
      <span class="reg" @click="onSwitch">去{{regOrLog==='登录' ? '注册' : '登录'}}</span>
      <button class="log" @click="onRegOrLog">{{regOrLog}}</button>
    </div>
  </div>
</template>

<script>
import store from "@/store";
import { onPost } from "@/services/api";
import { connect, AsyncClient } from "@/services/mqtt-wrapper/index.js";
const mqtt = require("mqtt");

export default {
  data() {
    return {
      regOrLog: "登录",
      username: "",
      userid: "",
      password: "",
      repeat: "",
      logedIn: false
    };
  },
  components: {},
  mounted: function() {},
  computed: {},
  methods: {
    onSwitch() {
      this.username = "";
      this.password = "";
      this.repeat = "";
      this.userid = "";
      if (this.regOrLog === "注册") {
        this.regOrLog = "登录";
        return;
      }
      if (this.regOrLog === "登录") {
        this.regOrLog = "注册";
      }
      // store.commit('set',{key: 'userid',val:''});
      // let res = onPost(store.state.REG);
    },
    onRegOrLog() {
      if (this.regOrLog === "注册") {
        if (
          this.username === "" ||
          this.password === "" ||
          this.repeat === ""
        ) {
          alert("请输入完整用户名和密码");
          return;
        }
        if (this.username.length >= 7) {
          alert("用户名要少于7个字符(不包含7，一个中文字符算两个字符！)");
          return;
        }
        if (this.validate()) {
          let REG = {
            method: "REG",
            username: this.username,
            password: this.password,
            version: "1.0"
          };
          let res = onPost(REG);
          res
            .then(res => {
              let data = res.data;
              if (!data.err) {
                if (
                  window.confirm(
                    "成功注册！\n你的账号ID是 " +
                      data.userid +
                      "\n你的用户名是 " +
                      data.username +
                      "\n你想要用此账号登录吗？"
                  )
                ) {
                  this.userid = data.userid;
                } else {
                  this.password = "";
                }
                this.regOrLog = "登录";
              }
            })
            .catch(err => {
              alert("注册失败，请按照注册规范重新注册！");
            });
        } else {
          alert("两次输入的密码不一致！");
        }
      } else if (this.regOrLog === "登录") {
        if (this.userid === "" || this.password === "") {
          alert("请输入完整账号ID和密码");
          return;
        }
        let LOGIN = {
          method: "LOGIN",
          userid: this.userid,
          password: this.password,
          version: "1.0"
        };
        let res = onPost(LOGIN);
        res
          .then(res => {
            if (!res.data.err) {
              this.logedIn = true;
              this.$emit("logedIn", this.logedIn);
              let param = {
                userid: res.data.userid,
                session: res.data.session,
                username: res.data.username
              };
              store.commit("initParam", param);
            }
          })
          .catch(err => {
            alert("发生了些错误，请重新登录！");
          });
      }
    },
    validate() {
      if (this.password !== this.repeat) {
        return false;
      }
      return true;
    },
    mqttClient() {
      // let INFO = {
      //   method: "INFO",
      //   userid: "636861",
      //   session: "BSf9IKuBzz",
      //   version: "1.0"
      // };
      // let res = onPost(INFO)
      // res.then(res=>{
      //     let data = res.data;
      // }).catch(err=>{
      //     console.log(err);
      // })

      // var ws = new WebSocket("ws://localhost:8090/");

      // ws.onmessage = function(event) {
      //   console.log(event.data);
      // };

      let serv = store.state.mqttServ;
      let options = {
        port: 9000,
        // host: "mqtt://127.0.0.1",
        keepalive: 60,
        reconnectPeriod: 1000,
        // protocolId: "MQIsdp",
        // protocolVersion: 3,
        clean: true,
        encoding: "utf8"
      };
      let port;
      var client = mqtt.connect("mqtt://127.0.0.1", { port: 1883 });
      client.on("connect", data => {
        console.log("connect!");
      });
      // client.on("error", (err)=>{
      //   console.log('connect!'+err)
      // });

      client.on("message", function(topic, message) {
        // message is Buffer
        console.log(message.toString());
        client.end();
      });
      // var client = mqtt.createClient(9000, '127.0.0.1');
      // const asyncClient = new AsyncClient(client);
      // let payload;
      // asyncClient
      //   .publish("webonline", (payload = "baz"), (qos = 0))
      //   .then(() => {
      //     console.log("We async now");
      //     return asyncClient.end();
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     debugger;
      //   });
    },
    ws() {
      var ws = new WebSocket("ws://localhost:8000");
      //readyState属性返回实例对象的当前状态，共有四种。
      //CONNECTING：值为0，表示正在连接。
      //OPEN：值为1，表示连接成功，可以通信了。
      //CLOSING：值为2，表示连接正在关闭。
      //CLOSED：值为3，表示连接已经关闭，或者打开连接失败
      //例如：if (ws.readyState == WebSocket.CONNECTING) { }

      //【用于指定连接成功后的回调函数】
      ws.onopen = function(evt) {
        console.log("Connection open ...");
        if (ws.readyState == WebSocket.OPEN) { 
          ws.send("连接成功！");
        }
        
      };
      //ws.addEventListener('open', function (event) {
      //    ws.send('Hello Server!');
      //};

      //【用于指定收到服务器数据后的回调函数】
      //【服务器数据有可能是文本，也有可能是二进制数据，需要判断】
      ws.onmessage = function(event) {
        if (typeof event.data === String) {
          console.log("Received data string",event);
        }

        if (event.data instanceof ArrayBuffer) {
          var buffer = event.data;
          console.log("Received arraybuffer");
        }
        console.log("Received Message: " + event.data);
        ws.close();
      };

      //[【于指定连接关闭后的回调函数。】
      ws.onclose = function(evt) {
        console.log("Connection closed.");
      };

      //发送文本
      // ws.send("Hello WebSockets!");
      //发送Blob数据
      // var file = document.querySelector('input[type="file"]').files[0];
      // ws.send(file);
      // //发送ArrayBuffer
      // var img = canvas_context.getImageData(0, 0, 400, 320);
      // var binary = new Uint8Array(img.data.length);
      // for (var i = 0; i < img.data.length; i++) {
      //   binary[i] = img.data[i];
      // }
      // ws.send(binary.buffer);

      //webSocket.bufferedAmount
      //bufferedAmount属性，表示还有多少字节的二进制数据没有发送出去。它可以用来判断发送是否结束
      // var data = new ArrayBuffer(10000000);
      // socket.send(data);

      // if (socket.bufferedAmount === 0) {
      //   // 发送完毕
      // } else {
      //   // 发送还没结束
      // }

      //webSocket.onerror 用于指定报错时的回调函数

      ws.onerror = function(event) {};

      ws.addEventListener("error", function(event) {});

    }
  }
};
</script>

<style>
.container {
  background-color: #f3eded;
  min-width: 30px;
  overflow: hidden;
  border-radius: 4px;
  -moz-border-radius: 4px;
  -webkit-border-radius: 4px;
  width: 400px;
  height: 220px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.12);
}
.log-title {
  font-size: 22px;
  color: #666;
  margin: 20px auto;
}
.ap {
  display: block;
  margin-bottom: 10px;
  margin-left: 70px;
}
.sub {
  font-size: 14px;
  color: #666;
}
.textarea {
  border-collapse: collapse;
}
.textarea input {
  width: 150px;
}
.reg {
  color: blue;
  font-size: 12px;
  padding-right: 15px;
  cursor: pointer;
}
.log {
  background-color: blue;
  color: white;
  font-size: 14px;
  border-radius: 6px;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  margin-left: 30px;
  cursor: pointer;
}
.buttom {
  margin-top: 25px;
}
</style>
