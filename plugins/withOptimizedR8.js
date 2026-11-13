// The React Native template shrinks release builds with Android's default rules,
// which include -dontoptimize. Use the optimizing variant so R8 also optimizes
// the code (Google Play flags the unoptimized setup as costing memory and speed).
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withOptimizedR8(config) {
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = cfg.modResults.contents.replace(
      'getDefaultProguardFile("proguard-android.txt")',
      'getDefaultProguardFile("proguard-android-optimize.txt")'
    );
    return cfg;
  });
};
