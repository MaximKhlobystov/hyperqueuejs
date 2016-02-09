module.exports = {
  entry: "./src/components/Main/Main.jsx",
  output: {
    filename: "./src/bundle.js"
  },
  module: {
    loaders: [
      { // JSX
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          presets: ["react"]
        }
      },
      { // LESS
        test: /\.less$/,
        loader: 'style!css!less'
      },
      { // CSS
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  }
};
