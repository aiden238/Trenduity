import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

/**
 * 필터 타입
 */
export type TodoFilter = 'all' | 'pending' | 'completed';

/**
 * 할일 항목 타입
 */
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  is_completed: boolean;
  notification_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * 할일 목록 응답 타입
 */
export interface TodoListResponse {
  todos: TodoItem[];
  total_count: number;
  pending_count: number;
  completed_count: number;
}

/**
 * 할일 생성 요청 타입
 */
export interface TodoCreateRequest {
  title: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
}

/**
 * 할일 수정 요청 타입
 */
export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  due_date?: string;
  reminder_time?: string;
  is_completed?: boolean;
}

/**
 * 할일 목록 조회 훅
 * 
 * GET /v1/todos?filter={filter}
 */
export function useTodos(filter: TodoFilter = 'all') {
  return useQuery<TodoListResponse>({
    queryKey: ['todos', filter],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: TodoListResponse }>(`/v1/todos?filter=${filter}`);
      
      if (!response.data.ok) {
        throw new Error('할일 목록을 불러올 수 없어요.');
      }
      
      return response.data.data;
    },
    staleTime: 1000 * 60, // 1분
  });
}

/**
 * 할일 상세 조회 훅
 * 
 * GET /v1/todos/{todo_id}
 */
export function useTodoDetail(todoId: string) {
  return useQuery<TodoItem>({
    queryKey: ['todo', todoId],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: { todo: TodoItem } }>(`/v1/todos/${todoId}`);
      
      if (!response.data.ok) {
        throw new Error('할일을 불러올 수 없어요.');
      }
      
      return response.data.data.todo;
    },
    enabled: !!todoId,
  });
}

/**
 * 할일 생성 훅
 * 
 * POST /v1/todos
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TodoCreateRequest) => {
      const response = await apiClient.post<{ ok: boolean; data: { todo: TodoItem; message: string } }>('/v1/todos', data);
      
      if (!response.data.ok) {
        throw new Error('할일을 추가하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

/**
 * 할일 수정 훅
 * 
 * PUT /v1/todos/{todo_id}
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { todoId: string } & TodoUpdateRequest) => {
      const { todoId, ...updateData } = data;
      const response = await apiClient.put<{ ok: boolean; data: { todo: TodoItem; message: string } }>(`/v1/todos/${todoId}`, updateData);
      
      if (!response.data.ok) {
        throw new Error('수정하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

/**
 * 할일 완료 토글 훅
 * 
 * PATCH /v1/todos/{todo_id}/toggle
 */
export function useToggleTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { todoId: string; is_completed: boolean }) => {
      const response = await apiClient.patch<{ ok: boolean; data: { todo: TodoItem; message: string } }>(`/v1/todos/${data.todoId}/toggle`, {
        is_completed: data.is_completed,
      });
      
      if (!response.data.ok) {
        throw new Error('상태를 변경하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

/**
 * 알림 설정 업데이트 훅
 * 
 * PATCH /v1/todos/{todo_id}/reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      todoId: string;
      reminder_time?: string | null;
      notification_id?: string;
    }) => {
      const { todoId, ...updateData } = data;
      const response = await apiClient.patch<{ ok: boolean; data: { todo: TodoItem; message: string } }>(`/v1/todos/${todoId}/reminder`, updateData);
      
      if (!response.data.ok) {
        throw new Error('알림 설정을 변경하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

/**
 * 할일 삭제 훅
 * 
 * DELETE /v1/todos/{todo_id}
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (todoId: string) => {
      const response = await apiClient.delete<{ ok: boolean; data: { message: string } }>(`/v1/todos/${todoId}`);
      
      if (!response.data.ok) {
        throw new Error('삭제하지 못했어요.');
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

/**
 * 예정 알림 조회 훅
 * 
 * GET /v1/todos/upcoming/reminders?hours={hours}
 */
export function useUpcomingReminders(hours: number = 24) {
  return useQuery<{ reminders: TodoItem[]; count: number }>({
    queryKey: ['todos', 'reminders', hours],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: { reminders: TodoItem[]; count: number } }>(`/v1/todos/upcoming/reminders?hours=${hours}`);
      
      if (!response.data.ok) {
        throw new Error('알림 목록을 불러올 수 없어요.');
      }
      
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
