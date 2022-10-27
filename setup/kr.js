module.exports = {
  dev: {
    define: {
      APIV1: 'https://localhost:3000/api/v1',
      'process.env.NODE_ENV': `"development"`,
    },
  },
  prod: {
    define: {
      'process.env.NODE_ENV': `"production"`,
    },
  },
};

// npm run ssr --prod
// npm run ssr --dev

// "This feature provides a way to replace global identifiers with constant expressions.
// It can be a way to change the behavior some code between builds without changing the code itself"
