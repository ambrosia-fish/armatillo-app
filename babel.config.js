module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@/app': './app',
            '@/components': './app/components',
            '@/constants': './app/constants',
            '@/services': './app/services',
            '@/utils': './app/utils',
            '@/context': './app/context',
          },
        },
      ],
    ],
  };
};
