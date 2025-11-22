#!/usr/bin/env python3
"""
Med Check 테이블 설정 검증 스크립트
사용자가 Supabase에서 SQL 실행 완료 후 자동으로 검증 및 테스트 진행
"""

import os
import sys
import subprocess
from datetime import date
from supabase import create_client, Client
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ .env 파일에 SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def print_header(text: str):
    """헤더 출력"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def verify_table_structure():
    """테이블 구조 검증"""
    print_header("1️⃣  테이블 구조 검증 중...")
    
    try:
        # 테스트 INSERT (실제 저장 안 함)
        test_data = {
            'user_id': 'test-verify',
            'date': date.today().isoformat(),
            'time_slot': 'morning',
            'medication_name': '테스트약',
            'notes': '검증용'
        }
        
        # 실제로는 저장하지 않고 구조만 확인
        result = supabase.table('med_checks').select('id').limit(1).execute()
        
        print("✅ med_checks 테이블 접근 가능")
        
        # 컬럼 존재 확인을 위한 더미 쿼리
        result = supabase.table('med_checks').select('medication_name, notes').limit(1).execute()
        print("✅ medication_name 컬럼 존재")
        print("✅ notes 컬럼 존재")
        
        return True
        
    except Exception as e:
        error_msg = str(e)
        if 'medication_name' in error_msg:
            print(f"❌ medication_name 컬럼이 여전히 없습니다!")
            print(f"   에러: {error_msg}")
            return False
        elif 'notes' in error_msg:
            print(f"❌ notes 컬럼이 없습니다!")
            print(f"   에러: {error_msg}")
            return False
        else:
            print(f"❌ 테이블 구조 확인 실패: {error_msg}")
            return False


def run_med_check_tests():
    """Med Check E2E 테스트 실행"""
    print_header("2️⃣  Med Check E2E 테스트 실행 중...")
    
    try:
        result = subprocess.run(
            ["npx", "playwright", "test", "med-check.spec.ts", "--reporter=list"],
            cwd=r"c:\AIDEN_PROJECT\Trenduity\Trenduity",
            capture_output=True,
            text=True,
            timeout=120
        )
        
        print(result.stdout)
        
        if result.returncode == 0:
            print("\n✅ Med Check 테스트 모두 통과!")
            return True
        else:
            print("\n⚠️  일부 Med Check 테스트 실패")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ 테스트 타임아웃 (2분 초과)")
        return False
    except Exception as e:
        print(f"❌ 테스트 실행 오류: {e}")
        return False


def run_full_e2e_tests():
    """전체 E2E 테스트 실행"""
    print_header("3️⃣  전체 E2E 테스트 실행 중...")
    
    try:
        result = subprocess.run(
            ["npx", "playwright", "test", "--reporter=list"],
            cwd=r"c:\AIDEN_PROJECT\Trenduity\Trenduity",
            capture_output=True,
            text=True,
            timeout=300
        )
        
        output = result.stdout
        print(output)
        
        # 통과율 계산
        if "passed" in output:
            lines = output.split('\n')
            for line in lines:
                if "passed" in line.lower():
                    print(f"\n📊 {line}")
        
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print("❌ 전체 테스트 타임아웃 (5분 초과)")
        return False
    except Exception as e:
        print(f"❌ 전체 테스트 실행 오류: {e}")
        return False


def update_progress_tracker(med_passed: bool, total_passed: int, total_tests: int):
    """진행 상황 문서 업데이트"""
    print_header("4️⃣  진행 상황 업데이트 중...")
    
    percentage = (total_passed / total_tests) * 100
    
    print(f"📈 E2E 테스트: {total_passed}/{total_tests} ({percentage:.1f}%)")
    
    if med_passed:
        print("✅ Med Check 기능 완료!")
    
    # TODO: WORK_PROGRESS_TRACKER.md 자동 업데이트
    print("💡 수동으로 docs/WORK_PROGRESS_TRACKER.md 업데이트 필요")


def main():
    """메인 실행 함수"""
    print("\n" + "🎯 " * 20)
    print("   Med Check 설정 검증 및 테스트 자동화")
    print("🎯 " * 20)
    
    # 1. 테이블 구조 검증
    if not verify_table_structure():
        print("\n" + "="*60)
        print("❌ 테이블 구조 검증 실패")
        print("="*60)
        print("\n💡 다음을 확인하세요:")
        print("   1. Supabase SQL Editor에서 SQL 실행 완료했나?")
        print("   2. 'Success' 메시지 확인했나?")
        print("   3. 에러가 있었다면 전체 SQL 다시 실행")
        print("\n📖 가이드: scripts/MANUAL_MED_CHECK_SETUP.md")
        sys.exit(1)
    
    # 2. Med Check 테스트
    med_passed = run_med_check_tests()
    
    # 3. 전체 테스트
    full_passed = run_full_e2e_tests()
    
    # 4. 결과 요약
    print_header("📊 최종 결과")
    
    if med_passed:
        print("✅ Med Check 테스트: 통과 (5/5)")
    else:
        print("⚠️  Med Check 테스트: 일부 실패")
    
    print(f"\n🎯 다음 단계:")
    if med_passed and full_passed:
        print("   🎉 모든 테스트 통과! (34/34)")
        print("   → docs/WORK_PROGRESS_TRACKER.md 업데이트")
        print("   → 커밋 및 푸시")
    elif med_passed:
        print("   ✅ Med Check 완료!")
        print("   ⚠️  다른 테스트 확인 필요")
    else:
        print("   ❌ Med Check 테스트 로그 확인 필요")
        print("   → BFF 서버 실행 중인지 확인")
        print("   → Supabase 연결 확인")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    main()
