import { useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

/** Android's line between phones and large screens (shortest side, in dp). */
const LARGE_SCREEN_DP = 600;

const applyLock = () => {
  const { width, height } = Dimensions.get('screen');
  const lock = Math.min(width, height) < LARGE_SCREEN_DP
    ? ScreenOrientation.OrientationLock.PORTRAIT_UP
    : ScreenOrientation.OrientationLock.DEFAULT;
  ScreenOrientation.lockAsync(lock).catch(() => {});
};

/**
 * Phones stay in portrait; tablets and foldables rotate freely (Android 16
 * ignores an orientation lock on large screens anyway). Re-checked when the
 * screen changes, e.g. a foldable opening or closing.
 */
export const usePhonePortraitLock = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    applyLock();
    const sub = Dimensions.addEventListener('change', applyLock);
    return () => sub.remove();
  }, []);
};
