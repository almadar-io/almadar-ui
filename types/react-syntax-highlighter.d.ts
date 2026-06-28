// Ambient declarations for react-syntax-highlighter deep ESM imports with .js
// extensions. The @types/react-syntax-highlighter package declares these paths
// without the extension; these stubs re-export the same types so the .js
// resolution used in CodeBlock.tsx (required for Node ESM / vitest) type-checks.

declare module 'react-syntax-highlighter/dist/esm/prism-light.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/prism-light';
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/json.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/json';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/javascript.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/typescript.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/jsx.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/tsx.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/css.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/css';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/markdown.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/bash.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/yaml.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/rust.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/python.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/python';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/sql.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/diff.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/toml.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/go.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/go';
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/graphql.js' {
  export { default } from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
}
