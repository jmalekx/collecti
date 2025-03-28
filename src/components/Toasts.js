//React and React Native core imports
import { View, Text, StyleSheet } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { typography } from '../styles/commonStyles';

/*
  Toasts Notification Component

  Comprehensive notificaiton system for visual user feedback to communicate
  operation outcomes and important info to users.

  - Visual differentiation via colour and icons
  - Semantic categorisation by purpose/severity

  Colour scheme and semantic principles:
  - Green: Success/completion
  - Red: Error/failure
  - Orange: Warning/caution
  - Blue: Information/neutral

*/

//Toast type constants via enum like object
export const TOAST_TYPES = {
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info'
};

//Icon mapping for each toast type
const TOAST_ICONS = {
  success: 'checkmark-circle',
  danger: 'alert-circle',
  warning: 'warning',
  info: 'information-circle'
};

//Toast config for centralised styling and configuration
export const toastConfig = {
  containerStyle: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'left',
    width: '100%',
    maxWidth: 330,
    marginBottom: 7
  },
  textStyle: {
    fontSize: 14,
    fontWeight: '500',
  },
  success: {
    backgroundColor: '#e7f5e8',
    iconColor: '#2ECC71',
  },
  danger: {
    backgroundColor: '#ffe2e4',
    iconColor: '#ff626d',
  },
  warning: {
    backgroundColor: '#fff3e3',
    iconColor: '#feb37c',
  },
  info: {
    backgroundColor: '#eaf2ff',
    iconColor: '#006efc',
  }
};

//Standardising toast notif with icon, title and message
const ToastIcon = ({ message, type }) => {
  const typeStyle = toastConfig[type] || toastConfig.info;
  const iconName = TOAST_ICONS[type] || TOAST_ICONS.info;

  //Display name mapping
  const displayNames = {
    success: 'Success',
    danger: 'Error',
    warning: 'Warning',
    info: 'Info'
  };

  //Get display name or fallback
  const displayName = displayNames[type] || type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: typeStyle.backgroundColor }]}>
      <Ionicons name={iconName} size={24} color={typeStyle.iconColor} style={styles.icon} />
      <View>
        <Text style={[styles.title]}>{displayName}</Text>
        <Text style={[styles.message]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 15,
    width: '100%',
    maxWidth: 330,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: typography.fontBold,
    color: '#000000',
  },
  message: {
    fontSize: 14,
    fontFamily: typography.fontRegular,
    color: '#585f6e',
  }
});

//Display helper function to always use custom toast component
export const showToast = (toast, message, options = {}) => {
  const type = options.type || TOAST_TYPES.INFO;

  toast.show(
    <ToastIcon message={message} type={type} />,
    {
      type,
      placement: options.placement || "top",
      duration: options.duration || 4000,
      animationType: options.animationType || "slide-in",
      ...options
    }
  );
};
