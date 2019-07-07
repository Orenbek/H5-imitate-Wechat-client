module.exports = {
  publicPath: './',
  
  devServer: {
    proxy: {
      '/backend': {
        target: 'http://10.112.163.194/manage',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/backend': '/'
        }
      },
    }
  }
}
