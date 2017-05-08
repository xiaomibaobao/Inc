module.exports = {
  'extends': 'eslint-config-hfe',
  'ecmaFeatures': {
    modules: true
  },
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module'
  },
  'rules': {
      'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
      'no-cond-assign': process.env.NODE_ENV === 'production' ? 2 : 0,
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
      'no-use-before-define': ['error', { 'functions': false, 'classes': false }]
  }
}
