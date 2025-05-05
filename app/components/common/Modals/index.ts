export { default as BaseModal } from './BaseModal/BaseModal';
export { default as AnswerSelectorModal } from './AnswerSelectorModal/AnswerSelectorModal';

// Add default export
import BaseModal from './BaseModal/BaseModal';
import AnswerSelectorModal from './AnswerSelectorModal/AnswerSelectorModal';

const Modals = {
  BaseModal,
  AnswerSelectorModal
};

export default Modals;