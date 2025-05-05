export * from './tokenRefresher';
export * from './tokenUtils';

import * as TokenRefresher from './tokenRefresher';
import * as TokenUtils from './tokenUtils';

// Export auth utilities as default
const AuthUtils = {
  ...TokenRefresher,
  ...TokenUtils
};

export default AuthUtils;
