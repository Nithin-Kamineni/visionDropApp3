module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-paper/babel',
    [
      'react-native-reanimated/plugin',
      {
        processNestedWorklets: true,
      },
    ],
    'react-native-worklets-core/plugin',
    ['@babel/plugin-proposal-decorators', {legacy: true}],
  ],
};
