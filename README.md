## 项目包括服务端和客户端。客户端包括Vue前端项目和流媒体录制客户端。<br>当前仓库为Vue前端项目。完整项目包括 https://github.com/Orenbek/H5-imitate-Wechat-Client-Facetime-Server 以及 https://github.com/Orenbek/H5-imitate-Wechat-Server。
## 项目实现H5端的从注册登陆到用户间发送文字，语音，小视频以及实时视频通话的功能。
### 发各类消息使用的是websocket协议。流媒体编解码使用ffmeg流媒体协议。可以实现录制音频，视频，录制屏幕等多种操作。<br>项目完全是个人开发，也没有用组件库，样式都是手写上去的。前端全组件化开发，后端用Node.js实现。前后端实现良好的分离。后端主要负责用户管理，消息分发，维护用户列表等功能。<br>不过值得注意的是，项目当中登陆注册，以及用户ID是用老师提供的服务器注册的。(By the way，此项目是学校实习实践项目中的作业，但是我用的技术栈，完成的功能跟别的同学都不一样。别人都是用Qt来实现的。大多数都是抄的就不说了，这都9102年了，还停留在Qt这种交互，我是不满意的。为何不用Web的思路来解决呢？)<br> 感兴趣的朋友可以加我wx好友 18801161930 探讨项目有关问题。 此项目还有些美中不足的部分。以后有时间了会进一步修改优化。

# client

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```
