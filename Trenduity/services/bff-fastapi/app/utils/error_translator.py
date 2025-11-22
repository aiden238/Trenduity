"""
PostgreSQL/Supabase 에러를 시니어 친화적인 한국어 메시지로 변환하는 유틸리티
"""

from typing import Dict


# PostgreSQL 에러 코드 → 한국어 메시지 매핑
# https://www.postgresql.org/docs/current/errcodes-appendix.html
POSTGRES_ERROR_MESSAGES = {
    # 23000 - Integrity Constraint Violation
    "23505": "이미 등록된 정보예요. 다른 값을 입력해 주세요.",  # unique_violation
    "23503": "연결된 데이터가 없어요. 먼저 필요한 정보를 등록해 주세요.",  # foreign_key_violation
    "23502": "필수 정보가 누락되었어요. 모든 항목을 입력해 주세요.",  # not_null_violation
    "23514": "입력한 값이 규칙에 맞지 않아요. 다시 확인해 주세요.",  # check_violation
    
    # 22000 - Data Exception
    "22001": "입력한 내용이 너무 길어요. 짧게 줄여주세요.",  # string_data_right_truncation
    "22003": "숫자가 너무 크거나 작아요. 적절한 범위로 입력해 주세요.",  # numeric_value_out_of_range
    "22007": "날짜 형식이 올바르지 않아요. YYYY-MM-DD 형식으로 입력해 주세요.",  # invalid_datetime_format
    "22P02": "입력한 값의 형식이 올바르지 않아요. 다시 확인해 주세요.",  # invalid_text_representation
    
    # 42000 - Syntax Error or Access Rule Violation
    "42501": "이 작업을 할 권한이 없어요.",  # insufficient_privilege
    "42601": "요청이 올바르지 않아요. 관리자에게 문의해 주세요.",  # syntax_error
    "42P01": "요청한 정보를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.",  # undefined_table
    "42703": "요청한 항목이 없어요. 다시 확인해 주세요.",  # undefined_column
    
    # 40000 - Transaction Rollback
    "40001": "다른 작업과 충돌이 발생했어요. 잠시 후 다시 시도해 주세요.",  # serialization_failure
    "40P01": "처리 시간이 초과되었어요. 다시 시도해 주세요.",  # deadlock_detected
    
    # 08000 - Connection Exception
    "08000": "서버 연결에 문제가 생겼어요. 인터넷 연결을 확인해 주세요.",  # connection_exception
    "08003": "연결이 끊어졌어요. 다시 로그인해 주세요.",  # connection_does_not_exist
    "08006": "연결에 실패했어요. 잠시 후 다시 시도해 주세요.",  # connection_failure
    
    # 53000 - Insufficient Resources
    "53100": "서버 용량이 부족해요. 잠시 후 다시 시도해 주세요.",  # disk_full
    "53200": "메모리가 부족해요. 잠시 후 다시 시도해 주세요.",  # out_of_memory
    "53300": "서버가 바빠요. 잠시 후 다시 시도해 주세요.",  # too_many_connections
}


# Supabase 에러 메시지 패턴 → 한국어 매핑
SUPABASE_ERROR_PATTERNS = {
    "duplicate key": "이미 등록된 정보예요.",
    "foreign key": "연결된 데이터가 없어요.",
    "not found": "찾을 수 없어요.",
    "unauthorized": "로그인이 필요해요.",
    "forbidden": "권한이 없어요.",
    "timeout": "시간이 초과되었어요. 다시 시도해 주세요.",
    "connection": "서버 연결에 문제가 있어요.",
    "network": "인터넷 연결을 확인해 주세요."
}


def translate_db_error(error: Exception) -> Dict[str, str]:
    """
    PostgreSQL/Supabase 에러를 한국어 메시지로 변환
    
    Args:
        error: 원본 예외 객체
    
    Returns:
        {
            "code": "DB_ERROR",
            "message": "한국어 설명"
        }
    """
    error_str = str(error).lower()
    
    # 1. PostgreSQL 에러 코드 확인
    for code, message in POSTGRES_ERROR_MESSAGES.items():
        if code in error_str:
            return {
                "code": "DB_ERROR",
                "message": message
            }
    
    # 2. Supabase 에러 패턴 확인
    for pattern, message in SUPABASE_ERROR_PATTERNS.items():
        if pattern in error_str:
            return {
                "code": "DB_ERROR",
                "message": message
            }
    
    # 3. 기본 fallback 메시지 (시니어 친화적)
    return {
        "code": "DB_ERROR",
        "message": "처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
    }


def is_db_error(error: Exception) -> bool:
    """
    데이터베이스 관련 에러인지 확인
    
    Args:
        error: 예외 객체
    
    Returns:
        True if DB error, False otherwise
    """
    error_str = str(error).lower()
    db_keywords = [
        "postgres", "database", "supabase", "sql",
        "relation", "column", "constraint", "key",
        "connection", "timeout"
    ]
    return any(keyword in error_str for keyword in db_keywords)
