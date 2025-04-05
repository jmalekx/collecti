//React and React Native core imports
import React from 'react';

//Custom component imports and styling
import ConfirmationModal from './ConfirmationModal';

/*
  UnsupportedPlatformModal Component

  Modal displayed when user attempts to share from an unsupported platform
  Provides guidance on alternative ways to save content
*/

const UnsupportedPlatformModal = ({ 
  visible, 
  onClose, 
  platformName = "this platform" 
}) => {
  return (
    <ConfirmationModal
      visible={visible}
      onClose={onClose}
      title="Unsupported Platform"
      message={`Sharing directly from ${platformName} isn't supported yet. You can still save content by copying the link or image URL and pasting it when creating a new post.`}
      primaryText="Got it"
      primaryAction={onClose}
      primaryStyle="primary"
      secondaryText="Close"
      icon="information-circle-outline"
    />
  );
};

export default UnsupportedPlatformModal;