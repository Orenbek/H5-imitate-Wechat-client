<template>
  <div @click="mqttClient" class="container">
    <div class="log-title">{{regOrLog}}</div>
    <template v-if="regOrLog==='登录'">
      <tr class="ap">
        <td class="sub">账号ID：</td>
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
      var client = mqtt.connect(store.state.mqttServ);
      const asyncClient = new AsyncClient(client);
      debugger;
      asyncClient.publish("foo/bar", "baz").then(() => {
        console.log("We async now");
        return asyncClient.end();
      });
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
