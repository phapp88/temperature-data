const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Temperature Data Heat Map',
    }),
  ],
};

module.exports = config;
