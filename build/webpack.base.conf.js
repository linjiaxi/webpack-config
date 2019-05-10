const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const fs = require('fs')

const makePlugins = config => {
  const plugins = [
    new webpack.ProvidePlugin({ $: 'jquery' }),
    new CleanWebpackPlugin(),
  ]

  Object.keys(config.entry).forEach(item => {
    plugins.push(
      new HtmlWebpackPlugin({
        title: '多页面配置',
        template: path.resolve(__dirname, "..", "index.html"),
        filename: `${item}.html`,
        chunks: [item]
      })
    )
  })

  const files = fs.readdirSync(path.resolve(__dirname,'../dll'))
  files.forEach(file => {
    if (/.*\.dll.js/.test(file)) {
      plugins.push(
        new AddAssetHtmlPlugin({
          filepath: path.resolve(__dirname,"../dll", file)
        })
      )
    }

    if (/.*\.manifest.json/.test(file)) {
      plugins.push(
        new webpack.DllReferencePlugin({
          manifest: path.resolve(__dirname,"../dll", file)
        })
      )
    }
  })

  return plugins


}




const config = {
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, '..', 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash:5].min.[ext]',
              limit: 1000, // size <= 1KB
              outputPath: 'images/'
            }
          },
          // img-loader for zip img
          {
            loader: 'image-webpack-loader',
            options: {
              // 压缩 jpg/jpeg 图片
              mozjpeg: {
                progressive: true,
                quality: 65 // 压缩率
              },
              // 压缩 png 图片
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]-[hash:5].min.[ext]',
            limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
            publicPath: 'fonts/',
            outputPath: 'fonts/'
          }
        }
      }
    ]
  },
  performance: false
}

config.plugins = makePlugins(config)
  
module.exports = config