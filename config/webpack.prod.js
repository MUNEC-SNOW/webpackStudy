const os = require("os");
const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const threads = os.cpus().length;

const getStyleLoaders = (preProcessor) => {
    return [
      MiniCssExtractPlugin.loader,
      "css-loader",
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            plugins: [
              "postcss-preset-env", // 能解决大多数样式兼容性问题
            ],
          },
        },
      },
      preProcessor,
    ].filter(Boolean);
};

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "../dist"), // 生产模式需要输出
    filename: "static/js/main.js", // 将 js 文件输出到 static/js 目录中
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
            {
                // 用来匹配 .css 结尾的文件
                test: /\.css$/,
                // use 数组里面 Loader 执行顺序是从右到左
                use: getStyleLoaders(),
              },
              {
                test: /\.less$/,
                use: getStyleLoaders("less-loader"),
              },
              {
                test: /\.s[ac]ss$/,
                use: getStyleLoaders("sass-loader"),
              },
              {
                test: /\.styl$/,
                use: getStyleLoaders("stylus-loader"),
              },
              {
                test: /\.(png|jpe?g|gif|webp)$/,
                type: "asset",
                parser: {
                  dataUrlCondition: {
                    maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
                  },
                },
                generator: {
                  // 将图片文件输出到 static/imgs 目录中
                  // 将图片文件命名 [hash:8][ext][query]
                  // [hash:8]: hash值取8位
                  // [ext]: 使用之前的文件扩展名
                  // [query]: 添加之前的query参数
                  filename: "static/imgs/[hash:8][ext][query]",
                },
              },
              {
                test: /\.(ttf|woff2?)$/,
                type: "asset/resource",
                generator: {
                  filename: "static/media/[hash:8][ext][query]",
                },
              },
              {
                test: /\.js$/,
                exclude: /node_modules/, // 排除node_modules代码不编译
                use: [
                    {
                        loader: "thread-loader",
                        options: {
                            workers: threads,
                        }
                    },
                    {
                        loader: "babel-loader",
                        options: {
                          cacheDirectory: true, // 开启babel编译缓存
                        },
                    },
                ]
              },
        ]
      }
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true, // 开启缓存
      // 缓存目录
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
      threads, // 开启多进程
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
        filename: "static/css/main.css",
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin({
            parallel: threads
        })
    ]
  },
  // devServer: {
  //   host: "localhost", // 启动服务器域名
  //   port: "3000", // 启动服务器端口号
  //   open: true, // 是否自动打开浏览器
  // },
  mode: "production",
  devtool: "source-map",
};
