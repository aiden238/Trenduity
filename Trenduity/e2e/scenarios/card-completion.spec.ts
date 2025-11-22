/**
 * E2E Test: 카드 완료 플로우
 * - 오늘의 카드 조회
 * - 퀴즈 제출 검증
 * - 카드 완료 및 포인트 부여
 * - 중복 완료 방지
 * - 다음날 새 카드 조회
 */

import { test, expect } from '@playwright/test';

test.describe('카드 완료 플로우', () => {
  const baseURL = process.env.BFF_BASE_URL || 'http://localhost:8002';
  const testUserId = 'test-user-card-completion';
  const testToken = process.env.TEST_USER_TOKEN || 'test-jwt-token-for-senior-user';

  test.beforeEach(() => {
    console.log(`[DEBUG] Using token: ${testToken.substring(0, 20)}...`);
  });

  test('1. 오늘의 카드 조회 성공', async ({ request }) => {
    const response = await request.get(`${baseURL}/v1/cards/today`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log(`[DEBUG] Response status: ${response.status()}`);
    const data = await response.json();
    console.log(`[DEBUG] Response body:`, JSON.stringify(data, null, 2));

    expect(response.ok()).toBeTruthy();
    expect(data.ok).toBe(true);
    
    // API는 { ok: true, data: { card: {...} } } 형식으로 반환
    expect(data.data).toHaveProperty('card');
    expect(data.data.card).toHaveProperty('id');
    expect(data.data.card).toHaveProperty('title');
    expect(data.data.card).toHaveProperty('body');
    expect(data.data.card).toHaveProperty('type');
    expect(data.data.card).toHaveProperty('quiz');
  });

  test('2. 퀴즈 제출 - 정답', async ({ request }) => {
    // Step 1: 오늘의 카드 조회
    const cardResponse = await request.get(`${baseURL}/v1/cards/today`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
    });
    const cardData = await cardResponse.json();
    const cardId = cardData.data.card.id;
    const quiz = cardData.data.card.quiz[0];
    const correctAnswer = quiz.options[quiz.correctIndex];

    // Step 2: 퀴즈 제출
    const quizResponse = await request.post(`${baseURL}/v1/cards/${cardId}/quiz`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
      data: { answer: correctAnswer },
    });

    const quizData = await quizResponse.json();
    console.log(`[DEBUG] Quiz response:`, JSON.stringify(quizData, null, 2));

    expect(quizResponse.ok()).toBeTruthy();
    expect(quizData.ok).toBe(true);
    expect(quizData.data).toHaveProperty('is_correct');
    expect(quizData.data.is_correct).toBe(true);
  });

  test('3. 퀴즈 제출 - 오답', async ({ request }) => {
    const cardResponse = await request.get(`${baseURL}/v1/cards/today`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
    });
    const cardData = await cardResponse.json();
    const cardId = cardData.data.card.id;
    const wrongAnswer = '틀린 답변';

    const quizResponse = await request.post(`${baseURL}/v1/cards/${cardId}/quiz`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
      data: { answer: wrongAnswer },
    });

    const quizData = await quizResponse.json();
    console.log(`[DEBUG] Quiz response:`, JSON.stringify(quizData, null, 2));

    expect(quizResponse.ok()).toBeTruthy();
    expect(quizData.ok).toBe(true);
    expect(quizData.data).toHaveProperty('is_correct');
    expect(quizData.data.is_correct).toBe(false);
  });

  test('4. 카드 완료 및 중복 방지 (통합)', async ({ request }) => {
    // Step 1: 오늘의 카드 조회
    const cardResponse = await request.get(`${baseURL}/v1/cards/today`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
    });
    const cardData = await cardResponse.json();
    const cardId = cardData.data.card.id;

    // Step 2: 첫 번째 완료 시도
    const firstResponse = await request.post(`${baseURL}/v1/cards/complete`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
      data: {
        card_id: cardId,
      },
    });

    console.log(`[DEBUG] First complete status: ${firstResponse.status()}`);
    
    // 500 에러 처리
    if (firstResponse.status() === 500) {
      const errorText = await firstResponse.text();
      console.error(`[ERROR] Server error: ${errorText.substring(0, 200)}`);
      throw new Error(`Server returned 500 Internal Server Error. Check BFF logs.`);
    }

    const firstData = await firstResponse.json();
    console.log(`[DEBUG] First complete:`, JSON.stringify(firstData, null, 2));

    // 첫 완료 검증
    if (firstResponse.ok()) {
      expect(firstData.ok).toBe(true);
      expect(firstData.data).toHaveProperty('points_added');
      expect(firstData.data).toHaveProperty('total_points');
      console.log('[TEST] ✓ 카드 완료 성공');
    } else if (firstResponse.status() === 400 && firstData.detail?.error?.code === 'ALREADY_COMPLETED') {
      console.log('[TEST] ⚠️ 이미 완료된 카드 (이전 테스트 실행의 캐시)');
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(firstData)}`);
    }

    // Step 3: 두 번째 완료 시도 (중복 방지 테스트)
    // 1초 대기 (Redis/DB 기록 완료 보장)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const secondResponse = await request.post(`${baseURL}/v1/cards/complete`, {
      headers: { 'Authorization': `Bearer ${testToken}` },
      data: {
        card_id: cardId,
      },
    });

    console.log(`[DEBUG] Second complete status: ${secondResponse.status()}`);
    
    // 500 에러 처리
    if (secondResponse.status() === 500) {
      const errorText = await secondResponse.text();
      console.error(`[ERROR] Server error on duplicate: ${errorText.substring(0, 200)}`);
      throw new Error(`Server returned 500 on duplicate completion. Check BFF logs.`);
    }

    const secondData = await secondResponse.json();
    console.log(`[DEBUG] Second complete:`, JSON.stringify(secondData, null, 2));
    
    // 중복 완료는 400 에러 (ALREADY_COMPLETED)
    expect(secondResponse.status()).toBe(400);
    expect(secondData.detail.ok).toBe(false);
    expect(secondData.detail.error.code).toBe('ALREADY_COMPLETED');
    console.log('[TEST] ✓ 중복 완료 방지 확인');
  });
});

