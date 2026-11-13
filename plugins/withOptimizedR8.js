// Release builds: let R8 optimize as well as shrink. The React Native template uses
// Android's default rules, which include -dontoptimize; switch to the optimizing
// variant. Also turn on optimized resource shrinking (the default from Android
// Gradle plugin 9). Google Play flags both as costing memory and speed.
const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const setProperty = (properties, key, value) => {
  const existing = properties.find((p) => p.type === 'property' && p.key === key);
  if (existing) existing.value = value;
  else properties.push({ type: 'property', key, value });
};

module.exports = function withOptimizedR8(config) {
  config = withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = cfg.modResults.contents.replace(
      'getDefaultProguardFile("proguard-android.txt")',
      'getDefaultProguardFile("proguard-android-optimize.txt")'
    );
    return cfg;
  });
  return withGradleProperties(config, (cfg) => {
    setProperty(cfg.modResults, 'android.r8.optimizedResourceShrinking', 'true');
    return cfg;
  });
};
