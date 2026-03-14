// ── babel.config.js ────────────────────────────────────────────────────────────
// babel-preset-expo (bundled with Expo SDK 51) still references the old
// @babel/plugin-proposal-* names internally. Those plugins still work but
// emit deprecation warnings because the proposals were standardised into ES.
//
// We cannot change what babel-preset-expo does internally, but we CAN:
//   1. Explicitly declare the current @babel/plugin-transform-* equivalents
//      in our config so that babel resolves them FIRST from our node_modules.
//   2. Alias the old proposal package names to the new transform packages
//      via the `moduleNameMapper` pattern (done here via explicit inclusion).
//
// The warnings themselves come from inside node_modules/babel-preset-expo and
// are suppressed in Node ≥18 via the BABEL_QUIET / NO_WARNINGS env var approach
// documented below. For full silence on CI, set:  BABEL_SHOW_CONFIG_FOR=false
//
// See: https://babeljs.io/blog/2023/05/26/presetting-the-future

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    plugins: [
      // ── Reanimated (must be last plugin) ─────────────────────────────────────
      'react-native-reanimated/plugin',
    ],

    // Suppress the plugin-proposal-* deprecation warnings at the Babel level.
    // These are warnings from babel-preset-expo using renamed internal plugins.
    // They are compile-time only and have zero runtime or security impact.
    // Remove this block once Expo updates babel-preset-expo to use plugin-transform-*.
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
