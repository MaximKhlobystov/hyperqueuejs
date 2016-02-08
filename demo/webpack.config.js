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
      }
    ]
  }
};
