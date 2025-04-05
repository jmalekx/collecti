//React and React Native core imports
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { AppText, AppHeading } from './Typography';
import commonStyles from '../styles/commonStyles';

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
  //Input field e.g for the password confirmation
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
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Icon - conditional rendering */}
          {icon && (
            <View style={[
              styles.iconContainer,
              primaryStyle === 'danger' ? styles.dangerIcon :
                primaryStyle === 'warning' ? styles.warningIcon :
                  styles.primaryIcon
            ]}>
              <Ionicons name={icon} size={36} color={
                primaryStyle === 'danger' ? '#FF3B30' :
                  primaryStyle === 'warning' ? '#FF9500' :
                    '#007AFF'
              } />
            </View>
          )}

          {/* Title and message */}
          <AppHeading style={styles.title}>{title}</AppHeading>
          {message && <AppText style={styles.message}>{message}</AppText>}

          {/* Optional Input Field */}
          {showInput && (
            <View style={styles.inputContainer}>
              {inputLabel && <Text style={styles.inputLabel}>{inputLabel}</Text>}
              <TextInput
                style={styles.input}
                placeholder={inputPlaceholder}
                secureTextEntry={inputSecureTextEntry}
                value={inputValue}
                onChangeText={onInputChange}
                editable={!inputDisabled}
              />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={secondaryAction || onClose}
            >
              <Text style={styles.cancelButtonText}>{secondaryText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                primaryStyle === 'danger' ? styles.dangerButton :
                  primaryStyle === 'warning' ? styles.warningButton :
                    styles.primaryButton
              ]}
              onPress={primaryAction}
              disabled={inputDisabled}
            >
              <Text style={styles.actionButtonText}>{primaryText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryIcon: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  dangerIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  warningIcon: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#585f6e',
    lineHeight: 20,
  },
  // Input field styles
  inputContainer: {
    width: '100%',
    marginVertical: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ConfirmationModal;