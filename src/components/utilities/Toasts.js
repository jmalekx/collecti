//React and React Native core imports
import { View, Text } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and styling
import { typography } from '../styles/commonStyles';
import { trackToast, setToastId, removeToast } from '../utils/toastManager';

/*
  Toasts Notification Component

  Comprehensive notificaiton system for visual user feedback to communicate
  operation outcomes and important info to users.

  - Visual differentiation via colour and icons
  - Semantic categorisation by purpose/severity
  - Stacking of repeat toast notifications

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
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 330,
    marginVertical: 5,
    overflow: 'hidden',
  },
  iconStyle: {
    marginRight: 10,
    marginTop: 2,
    size: 24,
  },
  contentStyle: {
    flex: 1,
    flexDirection: 'column',
  },
  headerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  titleStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: typography.fontBold,
    color: '#000000',
    marginRight: 6,
  },
  messageStyle: {
    fontSize: 14,
    fontFamily: typography.fontRegular,
    color: '#585f6e',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  countBadgeStyle: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  countTextStyle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },

  //Colours
  success: {
    backgroundColor: '#e7f5e8',
    iconColor: '#2ECC71',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  danger: {
    backgroundColor: '#ffe2e4',
    iconColor: '#ff626d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  warning: {
    backgroundColor: '#fff3e3',
    iconColor: '#feb37c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3 
  },
  info: {
    backgroundColor: '#eaf2ff',
    iconColor: '#006efc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  }
};

//Standardising toast notif with icon, title and message
const ToastIcon = ({ message, type, count = 1 }) => {
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
    <View style={[toastConfig.containerStyle, { backgroundColor: typeStyle.backgroundColor }]}>
      <Ionicons
        name={iconName}
        size={toastConfig.iconStyle.size}
        color={typeStyle.iconColor}
        style={toastConfig.iconStyle}
      />
      <View style={toastConfig.contentStyle}>
        <View style={toastConfig.headerStyle}>
          <Text style={toastConfig.titleStyle}>{displayName}</Text>
          {count > 1 && (
            <View style={toastConfig.countBadgeStyle}>
              <Text style={toastConfig.countTextStyle}>{count}</Text>
            </View>
          )}
        </View>
        <Text style={toastConfig.messageStyle}>{message}</Text>
      </View>
    </View>
  );
};

//Display helper function to always use custom toast component
export const showToast = (toast, message, options = {}) => {
  const type = options.type || TOAST_TYPES.INFO;

  // Track the toast and get its info
  const toastInfo = trackToast(message, type);

  // If this is a duplicate and we already have a toast displayed with an ID
  if (toastInfo.count > 1 && toastInfo.id) {
    // Hide the previous toast
    toast.hide(toastInfo.id);
  }

  //Show new toast with updated count 
  const id = toast.show(
    <ToastIcon message={message} type={type} count={toastInfo.count} />,
    {
      type,
      placement: options.placement || "top",
      duration: options.duration || 4000,
      animationType: options.animationType || "slide-in",
      onHide: () => {
        removeToast(message, type);
        if (options.onHide) options.onHide();
      },
      ...options
    }
  );

  // Store the ID for future reference
  setToastId(message, type, id);
  return id;
};
