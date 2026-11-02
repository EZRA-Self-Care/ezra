/** Small wrappers around expo-haptics so screens don't each repeat the platform check. */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Browsers have no haptics engine; skip there instead of letting the call reject.
const supported = Platform.OS !== 'web';

/** A light tap, for opening menus and selecting things. */
export function tapFeedback() {
  if (supported) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** A firmer "it worked" buzz, for completing something. */
export function successFeedback() {
  if (supported) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
