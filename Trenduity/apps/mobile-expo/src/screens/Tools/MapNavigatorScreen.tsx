import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../tokens/colors';

// 자주 찾는 장소 목업
const POPULAR_PLACES = [
  { icon: '🏥', name: '가까운 병원', query: '병원' },
  { icon: '💊', name: '약국', query: '약국' },
  { icon: '🏪', name: '편의점', query: '편의점' },
  { icon: '🏦', name: '은행', query: '은행' },
  { icon: '📮', name: '우체국', query: '우체국' },
  { icon: '🏛️', name: '주민센터', query: '주민센터' },
  { icon: '🚌', name: '버스 정류장', query: '버스정류장' },
  { icon: '🚉', name: '지하철역', query: '지하철역' },
];

// 검색 결과 타입
interface SearchResult {
  name: string;
  address: string;
  distance?: string;
  category?: string;
}

export const MapNavigatorScreen = () => {
  const navigation = useNavigation<any>();
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();

  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  // 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 외부 지도 앱 열기
  const openExternalMap = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    
    // 플랫폼별 지도 URL
    let mapUrl = '';
    
    if (Platform.OS === 'android') {
      // 네이버 지도 앱 또는 카카오맵
      mapUrl = `nmap://search?query=${encodedQuery}&appname=com.trenduity.app`;
      
      Linking.canOpenURL(mapUrl).then(supported => {
        if (supported) {
          Linking.openURL(mapUrl);
        } else {
          // 네이버 지도 앱이 없으면 카카오맵 시도
          const kakaoUrl = `kakaomap://search?q=${encodedQuery}`;
          Linking.canOpenURL(kakaoUrl).then(kakaoSupported => {
            if (kakaoSupported) {
              Linking.openURL(kakaoUrl);
            } else {
              // 둘 다 없으면 웹 브라우저로 열기
              Linking.openURL(`https://map.naver.com/v5/search/${encodedQuery}`);
            }
          });
        }
      });
    } else {
      // iOS - 애플 지도 또는 구글 지도
      mapUrl = `maps://?q=${encodedQuery}`;
      Linking.openURL(mapUrl).catch(() => {
        Linking.openURL(`https://maps.google.com/?q=${encodedQuery}`);
      });
    }
  };

  // 길찾기 (출발지 → 목적지)
  const openDirections = (destination: string) => {
    const encodedDest = encodeURIComponent(destination);
    
    if (Platform.OS === 'android') {
      // 네이버 지도 길찾기
      const navUrl = `nmap://route/public?dlat=0&dlng=0&dname=${encodedDest}&appname=com.trenduity.app`;
      
      Linking.canOpenURL(navUrl).then(supported => {
        if (supported) {
          Linking.openURL(navUrl);
        } else {
          // 카카오맵 길찾기
          const kakaoUrl = `kakaomap://route?ep=${encodedDest}`;
          Linking.canOpenURL(kakaoUrl).then(kakaoSupported => {
            if (kakaoSupported) {
              Linking.openURL(kakaoUrl);
            } else {
              Linking.openURL(`https://map.naver.com/v5/directions/-/-/-/${encodedDest}`);
            }
          });
        }
      });
    } else {
      Linking.openURL(`maps://?daddr=${encodedDest}`).catch(() => {
        Linking.openURL(`https://maps.google.com/maps?daddr=${encodedDest}`);
      });
    }
  };

  // 검색 실행 (목업)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // 실제로는 지도 API를 호출해야 함 - 목업 결과
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        { name: `${searchQuery} 1번`, address: '서울시 강남구 테헤란로 123', distance: '도보 5분', category: searchQuery },
        { name: `${searchQuery} 2번`, address: '서울시 서초구 서초대로 456', distance: '도보 10분', category: searchQuery },
        { name: `${searchQuery} 3번`, address: '서울시 송파구 올림픽로 789', distance: '도보 15분', category: searchQuery },
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  // 빠른 검색 (자주 찾는 장소)
  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    openExternalMap(query);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: '#10B981', padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          🗺️ 길찾기 도우미
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          가고 싶은 곳을 찾아드려요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
      >
        {/* 검색창 */}
        <View style={[styles.searchCard, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 16 }]}>
          <Text style={[styles.searchLabel, { fontSize: fontSizes.body, color: textSecondary, marginBottom: spacing.sm }]}>
            🔍 어디로 가시나요?
          </Text>
          <View style={styles.searchInputRow}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  fontSize: fontSizes.body,
                  color: textPrimary,
                  backgroundColor: bgColor,
                  padding: spacing.md,
                  borderRadius: 12,
                  flex: 1,
                },
              ]}
              placeholder="장소 이름을 입력하세요"
              placeholderTextColor={textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              accessibilityLabel="장소 검색"
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                { backgroundColor: '#10B981', padding: spacing.md, borderRadius: 12, marginLeft: spacing.sm },
              ]}
              onPress={handleSearch}
              accessibilityLabel="검색"
            >
              <Text style={{ fontSize: fontSizes.body, color: '#FFFFFF', fontWeight: '600' }}>검색</Text>
            </TouchableOpacity>
          </View>

          {/* 지도 앱 열기 버튼 */}
          <TouchableOpacity
            style={[
              styles.openMapButton,
              { backgroundColor: '#059669', padding: spacing.md, borderRadius: 12, marginTop: spacing.md },
            ]}
            onPress={() => {
              if (searchQuery.trim()) {
                openExternalMap(searchQuery);
              } else {
                Alert.alert('알림', '검색어를 입력해주세요.');
              }
            }}
            accessibilityLabel="지도 앱으로 보기"
          >
            <Text style={{ fontSize: fontSizes.body, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }}>
              🗺️ 지도 앱에서 보기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 자주 찾는 장소 */}
        <View style={[styles.popularSection, { marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            📍 자주 찾는 장소
          </Text>
          <View style={styles.popularGrid}>
            {POPULAR_PLACES.map((place, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.popularItem,
                  {
                    backgroundColor: cardBg,
                    padding: spacing.md,
                    borderRadius: 12,
                    marginBottom: spacing.sm,
                    width: '48%',
                  },
                ]}
                onPress={() => handleQuickSearch(place.query)}
                accessibilityLabel={`${place.name} 찾기`}
              >
                <Text style={{ fontSize: 28, marginBottom: spacing.xs }}>{place.icon}</Text>
                <Text style={[styles.popularItemText, { fontSize: fontSizes.body, color: textPrimary }]}>
                  {place.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 검색 결과 */}
        {hasSearched && (
          <View style={[styles.resultsSection, { marginTop: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
              🔎 검색 결과
            </Text>
            
            {isSearching ? (
              <View style={[styles.loadingContainer, { padding: spacing.xl }]}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={[styles.loadingText, { fontSize: fontSizes.body, color: textSecondary, marginTop: spacing.md }]}>
                  검색 중이에요...
                </Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.resultItem,
                    { backgroundColor: cardBg, padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm },
                  ]}
                >
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { fontSize: fontSizes.body, color: textPrimary, fontWeight: '600' }]}>
                      📍 {result.name}
                    </Text>
                    <Text style={[styles.resultAddress, { fontSize: fontSizes.small, color: textSecondary, marginTop: 4 }]}>
                      {result.address}
                    </Text>
                    {result.distance && (
                      <Text style={[styles.resultDistance, { fontSize: fontSizes.small, color: '#10B981', marginTop: 4 }]}>
                        🚶 {result.distance}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.directionsButton, { backgroundColor: '#10B981', padding: spacing.sm, borderRadius: 8 }]}
                    onPress={() => openDirections(result.address)}
                    accessibilityLabel={`${result.name}으로 길찾기`}
                  >
                    <Text style={{ fontSize: fontSizes.small, color: '#FFFFFF', fontWeight: '600' }}>길찾기</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={[styles.noResults, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 12 }]}>
                <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>🔍</Text>
                <Text style={[styles.noResultsText, { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center' }]}>
                  검색 결과가 없어요.{'\n'}다른 검색어로 다시 시도해보세요.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 도움말 */}
        <View style={[styles.helpCard, { backgroundColor: '#FEF3C7', padding: spacing.lg, borderRadius: 16, marginTop: spacing.lg }]}>
          <Text style={{ fontSize: fontSizes.body, color: '#92400E', fontWeight: '600' }}>
            💡 사용 팁
          </Text>
          <Text style={{ fontSize: fontSizes.small, color: '#B45309', marginTop: spacing.sm, lineHeight: 20 }}>
            • 장소 이름을 입력하고 "지도 앱에서 보기"를 누르면 네이버 지도나 카카오맵이 열려요.{'\n'}
            • 자주 찾는 장소 버튼을 누르면 바로 지도가 열려요.{'\n'}
            • 검색 결과에서 "길찾기"를 누르면 대중교통 경로를 알려드려요.
          </Text>
        </View>

        {/* AI 맞춤 상담 */}
        <TouchableOpacity
          style={[styles.aiHelpButton, { backgroundColor: COLORS.accent.purple, padding: spacing.lg, borderRadius: 16, marginTop: spacing.md, marginBottom: spacing.xl }]}
          onPress={() => navigation.navigate('AIConsult')}
          accessibilityLabel="AI 맞춤 상담받기"
          accessibilityHint="AI와 대화하며 궁금한 점을 물어볼 수 있어요"
        >
          <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>🤖</Text>
          <Text style={{ fontSize: fontSizes.heading2, color: '#FFFFFF', fontWeight: '700', marginBottom: 4 }}>
            AI 맞춤 상담
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            궁금한 것이 있으신가요? AI가 친절하게 답변해드려요!
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  searchCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchLabel: {},
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchButton: {},
  openMapButton: {},
  popularSection: {},
  sectionTitle: {
    fontWeight: '700',
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularItem: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  popularItemText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  resultsSection: {},
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {},
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {},
  resultAddress: {},
  resultDistance: {},
  directionsButton: {},
  noResults: {
    alignItems: 'center',
  },
  noResultsText: {},
  helpCard: {},
});
