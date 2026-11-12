import appConfig from '../app.json';

export const APP_NAME = 'Kural Daily';
/** Publisher shown on the stores and in the app. */
export const PUBLISHER = 'Aatra Labs';
/** Contact for the privacy policy and store listings. */
export const CONTACT_EMAIL = 'aatralabs@gmail.com';
export const APP_VERSION = appConfig.expo.version;

/** The Google Play listing, shared by You → Share Kural Daily. */
export const STORE_URL = `https://play.google.com/store/apps/details?id=${appConfig.expo.android.package}`;

/** The public source code. */
export const REPO_URL = 'https://github.com/aatralabs/kural-daily';

export const SHARE_APP_MESSAGE =
  `I'm reading one Thirukkural a day with ${APP_NAME}: the original Tamil couplet, a translation and ` +
  `the meaning, plus a simple way to learn them by heart.\n\n${STORE_URL}`;
