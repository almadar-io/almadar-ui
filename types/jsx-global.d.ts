// React 19 moves JSX to React.JSX namespace
// This shim re-exports it globally for tsup DTS compatibility
import 'react';
declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> {}
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
  }
}
