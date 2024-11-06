import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import Dotenv from 'dotenv';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const mode = argv.mode || 'development';
  const currentEnv = mode;
  const envFilePath = path.resolve(__dirname, `.env.${currentEnv}`);
  const envVariables = Dotenv.config({ path: envFilePath }).parsed || {};

  const envKeys = Object.keys(envVariables).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(envVariables[next]);
    return prev;
  }, {});

  return {
    mode: mode,
    entry: './src/index.tsx',
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        api: path.resolve(__dirname, 'src/api'),
      },
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                icon: true,
                exportType: 'named',
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
          },
          exclude: /node_modules/,
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
              }
            }
          ]
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
      new webpack.DefinePlugin(envKeys),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: '' },
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
    },
  };
};
