export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  Home: undefined;
  AIChat: { initialPrompt?: string; modelId?: string };
  EmergencySupport: undefined;
  QnaDetail: { id: string };
  InsightDetail: { id: string };
  // 새로운 화면들
  ExpenseTracker: undefined;
  MapNavigator: undefined;
  GovSupport: undefined;
  TodoMemo: undefined;
  ScamCheck: undefined;
  MedCheck: undefined;
  QnaCreate: undefined;
  Terms: undefined;
  Privacy: undefined;
};
