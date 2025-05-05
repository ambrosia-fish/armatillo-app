export { default as NewStrategyScreen } from './screens/NewStrategyScreen/NewStrategyScreen';
export { default as UseStrategyScreen } from './screens/UseStrategyScreen/UseStrategyScreen';
export { default as StrategyCard } from './components/StrategyCard/StrategyCard';
export { default as StrategyModal } from './components/StrategyModal/StrategyModal';
export { default as TriggerPatterns } from './components/TriggerPatterns/TriggerPatterns';

import NewStrategyScreen from './screens/NewStrategyScreen/NewStrategyScreen';
import UseStrategyScreen from './screens/UseStrategyScreen/UseStrategyScreen';
import StrategyCard from './components/StrategyCard/StrategyCard';
import StrategyModal from './components/StrategyModal/StrategyModal';
import TriggerPatterns from './components/TriggerPatterns/TriggerPatterns';

// Export strategies feature as default
const Strategies = {
  NewStrategyScreen,
  UseStrategyScreen,
  StrategyCard,
  StrategyModal,
  TriggerPatterns
};

export default Strategies;
