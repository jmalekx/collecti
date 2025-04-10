//React and React Native core imports
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { AppText, AppHeading } from '../utilities/Typography';
import commonStyles, { colours } from '../../styles/commonStyles';
import settingstyles from '../../styles/settingstyles';

/*
  ConfirmationModal Component

  Reusable dialogue modal following Strategy pattern for states. Implements multiple
  semantic types (confirmation, warning, error) with optional input field support.
  
*/

const ConfirmationModal = ({
  visible,
  onClose,
  title,
  message,
  primaryAction,
  primaryText,
  primaryStyle = 'primary', // 'primary', 'danger', 'warning'
  secondaryAction,
  secondaryText = 'Cancel',
  icon,
  //Input field eg for the password confirmation
  showInput = false,
  inputValue = '',
  onInputChange = () => { },
  inputPlaceholder = '',
  inputLabel = '',
  inputSecureTextEntry = false,
  inputDisabled = false
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={settingstyles.modalBackground}>
        <View style={settingstyles.modalContainer}>
          {/* Icon - conditional rendering */}
          {icon && (
            <View style={[
              settingstyles.iconsContainer,
              primaryStyle === 'danger' ? settingstyles.dangerIcon :
                primaryStyle === 'warning' ? settingstyles.warningIcon :
                  settingstyles.primaryIcon
            ]}>
              <Ionicons name={icon} size={36} color={
                primaryStyle === 'danger' ? colours.delete :
                  primaryStyle === 'warning' ? '#FF9500' :
                    colours.buttonsText
              } />
            </View>
          )}

          {/* Title and message */}
          <AppHeading style={settingstyles.title}>{title}</AppHeading>
          {message && <AppText style={settingstyles.message}>{message}</AppText>}

          {/* Optional Input Field */}
          {showInput && (
            <View style={settingstyles.inputContainer}>
              {inputLabel && <Text style={settingstyles.inputLabel}>{inputLabel}</Text>}
              <TextInput
                style={settingstyles.input}
                placeholder={inputPlaceholder}
                secureTextEntry={inputSecureTextEntry}
                value={inputValue}
                onChangeText={onInputChange}
                editable={!inputDisabled}
              />
            </View>
          )}

          {/* Action buttons */}
          <View style={settingstyles.buttonRow}>
            <TouchableOpacity
              style={settingstyles.cancelButton}
              onPress={secondaryAction || onClose}
            >
              <Text style={settingstyles.cancelButtonText}>{secondaryText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                settingstyles.actionButton,
                primaryStyle === 'danger' ? settingstyles.dangerButton :
                  primaryStyle === 'warning' ? settingstyles.warningButton :
                    settingstyles.primaryButton
              ]}
              onPress={primaryAction}
              disabled={inputDisabled}
            >
              <Text style={settingstyles.actionButtonText}>{primaryText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;