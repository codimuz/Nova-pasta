module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxImportSource: 'react'
      }],
      '@babel/preset-typescript'
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
      '@babel/plugin-transform-export-namespace-from',
      ['module-resolver', {
        alias: {
          '@': './src',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }]
    ]
  };
};