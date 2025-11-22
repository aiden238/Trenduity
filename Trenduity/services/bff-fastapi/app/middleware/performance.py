"""
BFF API 성능 프로파일링 미들웨어

모든 요청의 응답 시간을 측정하고 로깅합니다.
느린 쿼리(>200ms)는 WARNING으로 기록합니다.
"""
import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    """
    API 응답 시간 측정 미들웨어
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 요청 시작 시간
        start_time = time.perf_counter()
        
        # 요청 처리
        response = await call_next(request)
        
        # 요청 종료 시간
        end_time = time.perf_counter()
        process_time = (end_time - start_time) * 1000  # ms로 변환
        
        # 응답 헤더에 처리 시간 추가
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        
        # 로깅
        log_data = {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time_ms": round(process_time, 2),
        }
        
        # 느린 요청 경고
        if process_time > 200:
            logger.warning(
                f"⚠️ SLOW REQUEST: {log_data['method']} {log_data['path']} "
                f"took {log_data['process_time_ms']}ms (status: {log_data['status_code']})"
            )
        else:
            logger.info(
                f"✅ {log_data['method']} {log_data['path']} "
                f"- {log_data['process_time_ms']}ms (status: {log_data['status_code']})"
            )
        
        return response
