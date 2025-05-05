export { default as AuthGuard } from './AuthGuard';
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export * from './Themed';
export * from './Modals';

// Create a default export of common components
import AuthGuard from './AuthGuard';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import * as Themed from './Themed';
import * as Modals from './Modals';

const Common = {
  AuthGuard,
  Button,
  Card,
  Input,
  ...Themed,
  ...Modals
};

export default Common;