"""
배지 시스템 확장 단위 테스트

10개 배지 모두에 대한 테스트:
1. 첫걸음 (5 포인트)
2. 포인트 100
3. 포인트 500
4. 포인트 1000
5. 일주일 연속 (7일)
6. 한 달 연속 (30일)
7. 퀴즈 마스터 (50개 정답)
8. 사기 파수꾼 (10회)
9. 안전 지킴이 (30회)
10. 커뮤니티 스타 (10개 좋아요)
"""
import pytest
from app.services.gamification import GamificationService
from unittest.mock import Mock, MagicMock


class TestBadgeSystem:
    """배지 시스템 테스트"""
    
    @pytest.fixture
    def gamification_service(self):
        """GamificationService 인스턴스 생성 (Mock DB)"""
        mock_db = Mock()
        return GamificationService(mock_db)
    
    @pytest.fixture
    def mock_db_with_data(self):
        """데이터가 포함된 Mock DB"""
        mock_db = Mock()
        
        # gamification 테이블 Mock
        def mock_gamif_select():
            mock_result = Mock()
            mock_result.data = {'badges': []}
            return mock_result
        
        mock_db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_gamif_select()
        
        return mock_db
    
    @pytest.mark.asyncio
    async def test_badge_첫걸음(self, gamification_service, mock_db_with_data):
        """첫걸음 배지: 5 포인트 달성"""
        gamification_service.db = mock_db_with_data
        
        # gamification 테이블 응답 설정
        gamif_result = Mock()
        gamif_result.data = {'badges': []}
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        
        # update Mock
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=5,
            streak_days=0
        )
        
        assert "첫걸음" in badges
        assert len(badges) == 1
    
    @pytest.mark.asyncio
    async def test_badge_포인트_100(self, gamification_service, mock_db_with_data):
        """포인트 100 배지: 100 포인트 달성"""
        gamification_service.db = mock_db_with_data
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음"]}
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=100,
            streak_days=0
        )
        
        assert "포인트 100" in badges
    
    @pytest.mark.asyncio
    async def test_badge_포인트_500(self, gamification_service, mock_db_with_data):
        """포인트 500 배지: 500 포인트 달성"""
        gamification_service.db = mock_db_with_data
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음", "포인트 100"]}
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=500,
            streak_days=0
        )
        
        assert "포인트 500" in badges
    
    @pytest.mark.asyncio
    async def test_badge_포인트_1000(self, gamification_service, mock_db_with_data):
        """포인트 1000 배지: 1000 포인트 달성"""
        gamification_service.db = mock_db_with_data
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음", "포인트 100", "포인트 500"]}
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=1000,
            streak_days=0
        )
        
        assert "포인트 1000" in badges
    
    @pytest.mark.asyncio
    async def test_badge_일주일_연속(self, gamification_service, mock_db_with_data):
        """일주일 연속 배지: 7일 스트릭"""
        gamification_service.db = mock_db_with_data
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음"]}
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=50,
            streak_days=7
        )
        
        assert "일주일 연속" in badges
    
    @pytest.mark.asyncio
    async def test_badge_한_달_연속(self, gamification_service, mock_db_with_data):
        """한 달 연속 배지: 30일 스트릭"""
        gamification_service.db = mock_db_with_data
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음", "일주일 연속"]}
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=200,
            streak_days=30
        )
        
        assert "한 달 연속" in badges
    
    @pytest.mark.asyncio
    async def test_badge_퀴즈_마스터(self, gamification_service):
        """퀴즈 마스터 배지: 50개 정답"""
        mock_db = Mock()
        gamification_service.db = mock_db
        
        # gamification 테이블
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음"]}
        
        # completed_cards 테이블 (50개 정답)
        completed_result = Mock()
        completed_result.data = [
            {'quiz_correct': 2},
            {'quiz_correct': 3},
            {'quiz_correct': 1},
            # ... 총 50개 이상
        ]
        # 총합이 50 이상이 되도록 설정
        completed_result.data = [{'quiz_correct': 50}]
        
        # Mock 체이닝 설정
        mock_db.table = Mock(side_effect=lambda table_name: {
            'gamification': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        single=Mock(return_value=Mock(
                            execute=Mock(return_value=gamif_result)
                        ))
                    ))
                )),
                update=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock())
                    ))
                ))
            ),
            'completed_cards': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=completed_result)
                    ))
                ))
            )
        }[table_name])
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=150,
            streak_days=5
        )
        
        assert "퀴즈 마스터" in badges
    
    @pytest.mark.asyncio
    async def test_badge_사기_파수꾼(self, gamification_service):
        """사기 파수꾼 배지: 10회 사기 검사"""
        mock_db = Mock()
        gamification_service.db = mock_db
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음"]}
        
        scam_result = Mock()
        scam_result.count = 10
        
        mock_db.table = Mock(side_effect=lambda table_name: {
            'gamification': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        single=Mock(return_value=Mock(
                            execute=Mock(return_value=gamif_result)
                        ))
                    ))
                )),
                update=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock())
                    ))
                ))
            ),
            'scam_checks': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=scam_result)
                    ))
                ))
            )
        }[table_name])
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=50,
            streak_days=0
        )
        
        assert "사기 파수꾼" in badges
    
    @pytest.mark.asyncio
    async def test_badge_안전_지킴이(self, gamification_service):
        """안전 지킴이 배지: 30회 복약 체크"""
        mock_db = Mock()
        gamification_service.db = mock_db
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음"]}
        
        med_result = Mock()
        med_result.count = 30
        
        mock_db.table = Mock(side_effect=lambda table_name: {
            'gamification': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        single=Mock(return_value=Mock(
                            execute=Mock(return_value=gamif_result)
                        ))
                    ))
                )),
                update=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock())
                    ))
                ))
            ),
            'med_checks': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=med_result)
                    ))
                ))
            )
        }[table_name])
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=50,
            streak_days=0
        )
        
        assert "안전 지킴이" in badges
    
    @pytest.mark.asyncio
    async def test_badge_커뮤니티_스타(self, gamification_service):
        """커뮤니티 스타 배지: 10개 좋아요 받기"""
        mock_db = Mock()
        gamification_service.db = mock_db
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음"]}
        
        posts_result = Mock()
        posts_result.data = [{'id': 'post1'}, {'id': 'post2'}]
        
        reactions_result = Mock()
        reactions_result.count = 10
        
        mock_db.table = Mock(side_effect=lambda table_name: {
            'gamification': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        single=Mock(return_value=Mock(
                            execute=Mock(return_value=gamif_result)
                        ))
                    ))
                )),
                update=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock())
                    ))
                ))
            ),
            'qna_posts': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=posts_result)
                    ))
                ))
            ),
            'reactions': Mock(
                select=Mock(return_value=Mock(
                    in_=Mock(return_value=Mock(
                        eq=Mock(return_value=Mock(
                            execute=Mock(return_value=reactions_result)
                        ))
                    ))
                ))
            )
        }[table_name])
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=50,
            streak_days=0
        )
        
        assert "커뮤니티 스타" in badges
    
    @pytest.mark.asyncio
    async def test_multiple_badges_at_once(self, gamification_service):
        """여러 배지 동시 획득"""
        mock_db = Mock()
        gamification_service.db = mock_db
        
        gamif_result = Mock()
        gamif_result.data = {'badges': []}
        
        # completed_cards (퀴즈 마스터)
        completed_result = Mock()
        completed_result.data = [{'quiz_correct': 50}]
        
        # scam_checks (사기 파수꾼)
        scam_result = Mock()
        scam_result.count = 10
        
        mock_db.table = Mock(side_effect=lambda table_name: {
            'gamification': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        single=Mock(return_value=Mock(
                            execute=Mock(return_value=gamif_result)
                        ))
                    ))
                )),
                update=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock())
                    ))
                ))
            ),
            'completed_cards': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=completed_result)
                    ))
                ))
            ),
            'scam_checks': Mock(
                select=Mock(return_value=Mock(
                    eq=Mock(return_value=Mock(
                        execute=Mock(return_value=scam_result)
                    ))
                ))
            )
        }[table_name])
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=1000,  # 첫걸음 + 포인트 100 + 포인트 500 + 포인트 1000
            streak_days=30  # 일주일 연속 + 한 달 연속
        )
        
        # 최소 6개 배지 (포인트 4개 + 스트릭 2개)
        assert len(badges) >= 6
        assert "첫걸음" in badges
        assert "포인트 100" in badges
        assert "포인트 500" in badges
        assert "포인트 1000" in badges
        assert "일주일 연속" in badges
        assert "한 달 연속" in badges
    
    @pytest.mark.asyncio
    async def test_no_duplicate_badges(self, gamification_service, mock_db_with_data):
        """이미 획득한 배지는 다시 부여되지 않음"""
        gamification_service.db = mock_db_with_data
        
        gamif_result = Mock()
        gamif_result.data = {'badges': ["첫걸음", "포인트 100"]}  # 이미 획득
        mock_db_with_data.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = gamif_result
        mock_db_with_data.table.return_value.update.return_value.eq.return_value.execute.return_value = Mock()
        
        badges = await gamification_service._check_new_badges(
            user_id='test-user',
            total_points=100,
            streak_days=0
        )
        
        # 이미 획득한 배지는 반환되지 않음
        assert "첫걸음" not in badges
        assert "포인트 100" not in badges
