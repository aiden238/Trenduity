const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 별칭 설정
  config.resolve.alias = config.resolve.alias || {};
  config.resolve.alias['@repo/ui'] = path.resolve(__dirname, '../../packages/ui/src');
  config.resolve.alias['@repo/types'] = path.resolve(__dirname, '../../packages/types/src');
  config.resolve.alias['@'] = path.resolve(__dirname, 'src');

  // babel-loader가 packages/ui, packages/types도 처리하도록 수정
  const babelLoaderRule = config.module.rules.find((rule) =>
    rule.use && rule.use.some((use) => use.loader && use.loader.includes('babel-loader'))
  );

  if (babelLoaderRule) {
    // 기존 include 제거하고 exclude만 사용
    delete babelLoaderRule.include;
    babelLoaderRule.exclude = function (modulePath) {
      // node_modules 중 @repo로 시작하는 것은 포함
      if (modulePath.includes('node_modules')) {
        return true; // node_modules는 제외
      }
      // packages/ui, packages/types, apps/mobile-expo는 포함
      return false;
    };
  }

  return config;
};
