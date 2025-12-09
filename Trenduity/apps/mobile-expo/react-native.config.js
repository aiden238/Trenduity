const path = require('path');

/**
 * React Native Autolinking 설정
 * 
 * 모노레포에서 호이스팅된 node_modules를 찾을 수 있도록
 * 루트 node_modules 경로를 추가합니다.
 */
const workspaceRoot = path.resolve(__dirname, '../..');

module.exports = {
  // 프로젝트 설정
  project: {
    android: {
      sourceDir: './android',
    },
    ios: {
      sourceDir: './ios',
    },
  },
  
  // 의존성 검색 경로 (모노레포 루트 포함)
  dependencies: {
    // 루트에 호이스팅된 패키지들을 명시적으로 등록
    'react-native-svg': {
      root: path.join(workspaceRoot, 'node_modules/react-native-svg'),
    },
    'react-native-linear-gradient': {
      root: path.join(workspaceRoot, 'node_modules/react-native-linear-gradient'),
    },
    '@react-native-community/datetimepicker': {
      root: path.join(workspaceRoot, 'node_modules/@react-native-community/datetimepicker'),
    },
    'react-native-screens': {
      root: path.join(workspaceRoot, 'node_modules/react-native-screens'),
    },
    'react-native-safe-area-context': {
      root: path.join(workspaceRoot, 'node_modules/react-native-safe-area-context'),
    },
  },
};
