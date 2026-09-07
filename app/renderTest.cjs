require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    jsx: 'react-jsx',
    esModuleInterop: true,
    skipLibCheck: true
  }
});
// mock css and env
require.extensions['.css'] = () => {};
global.import = { meta: { env: {} } };

const { renderToString } = require('react-dom/server');
const App = require('./src/App').default;

try {
  const html = renderToString(App());
  console.log("RENDER SUCCESS. HTML length:", html.length);
} catch (err) {
  console.error("RENDER ERROR:", err);
}
