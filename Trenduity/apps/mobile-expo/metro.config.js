const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// 워크스페이스 루트의 node_modules에서 expo 모듈 로드
const { getDefaultConfig } = require(path.resolve(workspaceRoot, 'node_modules/expo/metro-config'));

const config = getDefaultConfig(projectRoot);

// node_modules 해석 경로 (워크스페이스 호이스팅 지원)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
