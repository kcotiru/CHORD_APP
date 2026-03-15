// metro.config.js
// Expo SDK 51 Metro configuration for production EAS builds.
// Extends the default Expo Metro config with correct asset handling.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
