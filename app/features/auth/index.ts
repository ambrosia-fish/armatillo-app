export * from './screens';
export * from './components';
export * from './utils';

import * as Screens from './screens';
import * as Components from './components';
import * as Utils from './utils';

// Export auth feature as default
const Auth = {
  Screens,
  Components,
  Utils
};

export default Auth;
