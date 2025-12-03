# 코드 템플릿

복사-붙여넣기로 바로 사용 가능한 코드 템플릿 모음입니다.

## 📋 BFF 엔드포인트 템플릿

```python
# services/bff-fastapi/app/routers/new_feature.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user
from app.schemas.new_feature import NewFeatureRequest, NewFeatureResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/action", response_model=dict)
async def do_action(
    body: NewFeatureRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        # 1. 비즈니스 로직
        result = await service.process(body, user_id)
        
        # 2. Envelope 응답
        return {"ok": True, "data": result}
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}", extra={"user_id": user_id})
        raise HTTPException(
            status_code=400,
            detail={"ok": False, "error": {"message": str(e)}}
        )
    except Exception as e:
        logger.error(f"Action failed: {e}", extra={"user_id": user_id})
        raise HTTPException(
            status_code=500,
            detail={"ok": False, "error": {"message": "오류가 발생했어요. 잠시 후 다시 시도해 주세요."}}
        )
```

## 📱 Mobile 훅 템플릿

```typescript
// apps/mobile-expo/src/hooks/useNewFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

interface NewFeatureData {
  // 타입 정의
}

interface NewFeatureParams {
  // 요청 파라미터
}

export function useNewFeature() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['newFeature'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ ok: boolean; data: NewFeatureData }>(
        '/v1/new-feature'
      );
      if (!data.ok) throw new Error(data.error?.message);
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (params: NewFeatureParams) => {
      const { data } = await apiClient.post('/v1/new-feature/action', params);
      if (!data.ok) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newFeature'] });
    },
  });

  return { 
    ...query, 
    doAction: mutation.mutate,
    isDoingAction: mutation.isPending
  };
}
```

## ♿ A11y 준수 컴포넌트 템플릿

```typescript
// apps/mobile-expo/src/components/NewComponent.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useA11y } from '@/contexts/A11yContext';

interface NewComponentProps {
  title: string;
  onPress: () => void;
}

export function NewComponent({ title, onPress }: NewComponentProps) {
  const { fontSizes, buttonHeight, spacing } = useA11y();

  return (
    <View style={{ padding: spacing }}>
      <Text style={{ fontSize: fontSizes.heading1, marginBottom: spacing }}>
        {title}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={{ 
          height: buttonHeight, 
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#007AFF',
          borderRadius: 8
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title} 버튼`}
        accessibilityHint="버튼을 누르면 동작을 실행합니다"
      >
        <Text style={{ fontSize: fontSizes.body, color: 'white' }}>
          실행
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 📦 Pydantic 스키마 템플릿

```python
# services/bff-fastapi/app/schemas/new_feature.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NewFeatureRequest(BaseModel):
    """새 기능 요청 DTO"""
    field1: str = Field(..., min_length=1, max_length=100, description="필드 설명")
    field2: Optional[int] = Field(None, ge=0, description="선택적 필드")

    class Config:
        json_schema_extra = {
            "example": {
                "field1": "예시 값",
                "field2": 42
            }
        }

class NewFeatureResponse(BaseModel):
    """새 기능 응답 DTO"""
    id: str
    created_at: datetime
    result: str

    class Config:
        from_attributes = True
```
