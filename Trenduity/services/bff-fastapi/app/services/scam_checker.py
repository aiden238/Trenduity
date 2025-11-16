import re
from typing import Literal

LabelType = Literal["safe", "warn", "danger"]


class ScamCheckResult:
    """
    사기 검사 결과
    """
    def __init__(self, label: LabelType, tips: list[str]):
        self.label = label
        self.tips = tips


class ScamChecker:
    """
    SMS/URL 사기 검사 (정규식 기반)
    
    위험도 판정:
    - danger: 위험 키워드 2개 이상 또는 위험 키워드 + 의심 URL
    - warn: 경고 키워드 2개 이상 또는 위험 키워드 1개 또는 의심 URL
    - safe: 의심스러운 내용 없음
    
    Example:
        checker = ScamChecker()
        result = checker.check("국세청입니다. 환급금 수령을 위해 클릭하세요 http://...")
        # ScamCheckResult(label="danger", tips=[...])
    """
    
    # 위험 키워드 (공공기관 사칭, 금융정보 요구 등)
    DANGER_KEYWORDS = [
        "환급금", "국세청", "경찰청", "검찰청",
        "계좌이체", "비밀번호", "OTP", "보안카드",
        "긴급", "지급정지", "압류", "소송",
        "택배", "미수령", "재배송",
        "카카오톡", "네이버", "은행", "카드사",
        "본인인증", "로그인", "정보 업데이트",
        "금융감독원", "한국은행", "우체국"
    ]
    
    # 경고 키워드 (미끼성 문구)
    WARN_KEYWORDS = [
        "당첨", "무료", "선착순", "지급",
        "클릭", "링크", "바로가기",
        "확인", "승인", "처리",
        "포인트", "적립", "쿠폰",
        "할인", "이벤트"
    ]
    
    # 의심 URL 패턴
    SUSPICIOUS_URL_PATTERNS = [
        r"bit\.ly",       # 단축 URL
        r"gg\.gg",
        r"tinyurl\.com",
        r"goo\.gl",
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",  # IP 주소
        r"[a-z0-9]{10,}\.com",  # 랜덤 문자열 도메인
        r"\.xyz",  # 의심스러운 도메인
        r"\.tk",
        r"\.ml",
    ]
    
    def check(self, input_text: str) -> ScamCheckResult:
        """
        입력 텍스트의 사기 위험도 판정
        
        Args:
            input_text: 검사할 SMS 또는 URL
        
        Returns:
            ScamCheckResult(label, tips)
        """
        if not input_text or len(input_text) < 5:
            return ScamCheckResult(
                label="safe",
                tips=["검사할 내용이 너무 짧아요."]
            )
        
        # 1. 위험 키워드 검사
        danger_count = sum(
            1 for keyword in self.DANGER_KEYWORDS
            if keyword in input_text
        )
        
        # 2. 경고 키워드 검사
        warn_count = sum(
            1 for keyword in self.WARN_KEYWORDS
            if keyword in input_text
        )
        
        # 3. URL 패턴 검사
        suspicious_url = any(
            re.search(pattern, input_text, re.IGNORECASE)
            for pattern in self.SUSPICIOUS_URL_PATTERNS
        )
        
        # 4. 판정 로직
        if danger_count >= 2 or (danger_count >= 1 and suspicious_url):
            # 위험: 위험 키워드 2개 이상 또는 위험 키워드 + 의심 URL
            return ScamCheckResult(
                label="danger",
                tips=self._get_danger_tips(input_text)
            )
        elif warn_count >= 2 or danger_count == 1 or suspicious_url:
            # 경고: 경고 키워드 2개 이상 또는 위험 키워드 1개 또는 의심 URL
            return ScamCheckResult(
                label="warn",
                tips=self._get_warn_tips(input_text)
            )
        else:
            # 안전
            return ScamCheckResult(
                label="safe",
                tips=["지금까지는 의심스러운 내용이 발견되지 않았어요."]
            )
    
    def _get_danger_tips(self, text: str) -> list[str]:
        """
        위험 수준 대응 팁
        """
        tips = [
            "⚠️ 매우 의심스러운 내용이에요!",
            "공공기관(국세청, 경찰청 등)은 문자로 개인정보를 요구하지 않아요.",
            "링크를 절대 클릭하지 마세요.",
        ]
        
        if "환급" in text or "지급" in text:
            tips.append("환급금은 직접 홈페이지나 앱에서 확인하세요.")
        
        if "계좌" in text or "비밀번호" in text or "OTP" in text:
            tips.append("계좌번호나 비밀번호를 절대 입력하지 마세요.")
        
        if re.search(r"http", text, re.IGNORECASE):
            tips.append("의심 링크는 112(경찰)에 신고할 수 있어요.")
        
        if "택배" in text:
            tips.append("택배회사는 개인정보를 문자로 요구하지 않아요.")
        
        return tips
    
    def _get_warn_tips(self, text: str) -> list[str]:
        """
        경고 수준 대응 팁
        """
        tips = [
            "⚠️ 조금 의심스러운 내용이 있어요.",
            "발신자가 정말 아는 사람인지 확인하세요.",
        ]
        
        if re.search(r"http", text, re.IGNORECASE):
            tips.append("링크를 클릭하기 전에 가족에게 물어보세요.")
        
        if "당첨" in text or "무료" in text:
            tips.append("'공짜'는 없어요. 의심해 보세요.")
        
        if "클릭" in text or "확인" in text:
            tips.append("급하게 클릭하라고 하면 의심하세요.")
        
        tips.append("의심되면 절대 클릭하지 말고 삭제하세요.")
        
        return tips
