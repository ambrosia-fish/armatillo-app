export * from './common';
export * from './forms';
export * from './layout';

// Adding a default export that includes all components
import * as CommonComponents from './common';
import * as FormComponents from './forms';
import * as LayoutComponents from './layout';

const Components = {
  ...CommonComponents,
  ...FormComponents,
  ...LayoutComponents
};

export default Components;