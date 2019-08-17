module.exports = {
  publicPath: './',
  
  devServer: {
    proxy: {
      '/backend': {
        target: 'http://10.112.163.194/manage',
        //此处URL为老师提供的服务器接口，在此项目中用于获取在线列表，但是由于没有办法做到
        // 基于mqtt的网络请求，于是只是用来作为用户ID获取的方式。很可惜。
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/backend': '/'
        }
      },
    }
  }
}
