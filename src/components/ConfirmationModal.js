import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, AppHeading } from './Typography';

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
  icon
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
          
          <AppHeading style={styles.title}>{title}</AppHeading>
          
          {message && <AppText style={styles.message}>{message}</AppText>}
          
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