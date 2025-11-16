import re
from typing import Literal, Optional

IntentType = Literal["call", "sms", "search", "remind", "navigate", "open"]


class ParsedIntent:
    """
    파싱된 인텐트 결과
    """
    def __init__(
        self,
        intent: IntentType,
        slots: dict,
        confidence: float = 1.0
    ):
        self.intent = intent
        self.slots = slots
        self.confidence = confidence


class VoiceParser:
    """
    한국어 음성 명령을 파싱하여 인텐트 추출
    
    지원 인텐트:
    - call: 전화 걸기 ("엄마한테 전화해")
    - sms: 문자 보내기 ("아들한테 문자 보내")
    - search: 검색하기 ("오늘 날씨 검색")
    - remind: 알림 설정 ("내일 병원 알려줘")
    - navigate: 길찾기 ("서울역 길찾기")
    - open: 앱 내 화면 열기 ("인사이트 열어줘")
    
    Example:
        parser = VoiceParser()
        result = parser.parse("엄마한테 전화해")
        # ParsedIntent(intent="call", slots={"name": "엄마"})
    """
    
    # 패턴 정의 (정규식)
    PATTERNS = {
        "call": [
            r"(.+)(한테|에게|께)\s*(전화|통화)(해|하자|할게|걸어)",
            r"(.+)\s*(전화)(해|하자|걸어|좀)",
        ],
        "sms": [
            r"(.+)(한테|에게)\s*(문자|메시지)(해|보내|보낼게|좀)",
        ],
        "search": [
            r"(.+)\s*(검색|찾아|알려|검색해)",
        ],
        "remind": [
            r"(.+)\s*(알려|알림|리마인드)(줘|해|설정)",
        ],
        "navigate": [
            r"(.+)\s*(길찾기|가는 길|네비게이션|가는법)",
        ],
        "open": [
            r"(인사이트|카드|커뮤니티|설정)\s*(열어|보여|가자|가줘|보자)",
        ],
    }
    
    def parse(self, text: str) -> Optional[ParsedIntent]:
        """
        음성 텍스트를 파싱하여 인텐트 추출
        
        Args:
            text: 음성 인식 결과 (한국어)
        
        Returns:
            ParsedIntent or None
        """
        text = text.strip()
        
        # 각 인텐트별 패턴 매칭
        for intent, patterns in self.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    slots = self._extract_slots(intent, match)
                    return ParsedIntent(intent=intent, slots=slots)
        
        # 매칭 실패
        return None
    
    def _extract_slots(self, intent: str, match: re.Match) -> dict:
        """
        정규식 매치 결과에서 슬롯 추출
        """
        if intent == "call":
            return {"name": match.group(1).strip()}
        
        elif intent == "sms":
            name = match.group(1).strip()
            # TODO: 메시지 내용 추출 (별도 프롬프트 필요)
            return {"name": name, "message": None}
        
        elif intent == "search":
            return {"query": match.group(1).strip()}
        
        elif intent == "remind":
            return {"text": match.group(1).strip(), "time": None}
        
        elif intent == "navigate":
            return {"destination": match.group(1).strip()}
        
        elif intent == "open":
            target = match.group(1).strip()
            return {"target": target}
        
        return {}
    
    def to_action(self, parsed: ParsedIntent) -> dict:
        """
        ParsedIntent를 실행 가능한 액션으로 변환
        
        Returns:
            {
                "kind": "tel" | "sms" | "url" | "route" | "reminder" | "contact_lookup",
                "uri": "tel:010-1234-5678" (optional),
                "route": "/insights" (optional),
                "name": "엄마" (optional),
                "hint": "..." (optional)
            }
        """
        if parsed.intent == "call":
            name = parsed.slots.get("name")
            # 실제로는 연락처 DB 조회 필요
            # MVP에서는 단순히 이름만 반환
            return {
                "kind": "contact_lookup",
                "name": name,
                "hint": f"{name}님의 연락처를 찾아주세요."
            }
        
        elif parsed.intent == "sms":
            name = parsed.slots.get("name")
            return {
                "kind": "sms",
                "name": name,
                "hint": f"{name}님께 문자를 보내세요."
            }
        
        elif parsed.intent == "search":
            query = parsed.slots.get("query")
            return {
                "kind": "url",
                "url": f"https://www.google.com/search?q={query}",
                "hint": f"'{query}' 검색 결과를 엽니다."
            }
        
        elif parsed.intent == "remind":
            return {
                "kind": "reminder",
                "text": parsed.slots.get("text"),
                "hint": "알림 기능은 곧 지원 예정이에요."
            }
        
        elif parsed.intent == "navigate":
            destination = parsed.slots.get("destination")
            return {
                "kind": "url",
                "url": f"https://map.naver.com/v5/search/{destination}",
                "hint": f"{destination} 길찾기를 시작해요."
            }
        
        elif parsed.intent == "open":
            target = parsed.slots.get("target")
            route_map = {
                "인사이트": "/insights",
                "카드": "/home",
                "커뮤니티": "/community",
                "설정": "/settings"
            }
            return {
                "kind": "route",
                "route": route_map.get(target, "/home"),
                "hint": f"{target} 화면으로 이동해요."
            }
        
        return {"kind": "unknown"}
