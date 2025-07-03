module.exports = {
  presets: [
      [
    '@vue/cli-plugin-babel/preset',
    {
      useBuiltIns: 'entry',
      corejs: 3
    }
    ]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-class-static-block']
  ],
  sourceType: 'unambiguous'
}
