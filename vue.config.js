module.exports = {
  chainWebpack: config => {
    config.module
      .rule('raw')
      .test(/\.txt$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import './src/scss/_variables.scss';
        `
      }
    }
  }
}
