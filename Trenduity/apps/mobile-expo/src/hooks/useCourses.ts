/**
 * 강좌 데이터 훅
 * BFF API /v1/courses 연동
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  category: string;
  total_lectures: number;
  created_at: string;
  updated_at: string;
  user_completed_lectures?: number;
  user_last_watched?: number;
}

export interface Lecture {
  id: number;
  lecture_number: number;
  title: string;
  duration: number;
  script: string;
  panels: any[];
  created_at: string;
}

export interface CourseDetail extends Course {
  lectures: Lecture[];
  user_progress?: {
    last_watched_lecture: number;
    completed_lectures: number;
    completed_at: string | null;
  };
}

export interface TodayRecommendation {
  type: 'continue' | 'new';
  course_id: string;
  next_lecture: number;
  title: string;
  thumbnail: string;
  progress: string;
  message: string;
}

/**
 * 강좌 목록 조회
 */
export function useCourses(category?: string) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchCourses();
  }, [user, category]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`${BFF_URL}/v1/courses`);
      if (category) {
        url.searchParams.append('category', category);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${user?.id || 'demo-user'}`,
        },
      });

      const result = await response.json();

      if (result.ok && result.data) {
        setCourses(result.data.courses || []);
      } else {
        throw new Error(result.error?.message || '강좌를 불러올 수 없어요');
      }
    } catch (err: any) {
      console.error('Courses fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: fetchCourses };
}

/**
 * 강좌 상세 정보 조회
 */
export function useCourseDetail(courseId: string | null) {
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !courseId) {
      setLoading(false);
      return;
    }

    fetchCourseDetail();
  }, [user, courseId]);

  const fetchCourseDetail = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BFF_URL}/v1/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${user?.id || 'demo-user'}`,
        },
      });

      const result = await response.json();

      if (result.ok && result.data) {
        setCourse(result.data);
      } else {
        throw new Error(result.error?.message || '강좌 정보를 불러올 수 없어요');
      }
    } catch (err: any) {
      console.error('Course detail fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { course, loading, error, refetch: fetchCourseDetail };
}

/**
 * 특정 강의 조회
 */
export function useLecture(courseId: string | null, lectureNumber: number | null) {
  const { user } = useAuth();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !courseId || lectureNumber === null) {
      setLoading(false);
      return;
    }

    fetchLecture();
  }, [user, courseId, lectureNumber]);

  const fetchLecture = async () => {
    if (!courseId || lectureNumber === null) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BFF_URL}/v1/courses/${courseId}/lectures/${lectureNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.id || 'demo-user'}`,
          },
        }
      );

      const result = await response.json();

      if (result.ok && result.data) {
        setLecture(result.data);
      } else {
        throw new Error(result.error?.message || '강의를 불러올 수 없어요');
      }
    } catch (err: any) {
      console.error('Lecture fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { lecture, loading, error, refetch: fetchLecture };
}

/**
 * 강의 진행 상황 업데이트
 */
export function useUpdateProgress() {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateProgress = async (courseId: string, lectureNumber: number) => {
    if (!user) return { ok: false, error: '로그인이 필요해요' };

    try {
      setUpdating(true);

      const response = await fetch(
        `${BFF_URL}/v1/courses/${courseId}/progress?lecture_number=${lectureNumber}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      return result;
    } catch (err: any) {
      console.error('Progress update error:', err);
      return { ok: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  return { updateProgress, updating };
}

/**
 * 오늘의 학습 추천
 */
export function useTodayRecommendation() {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<TodayRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchRecommendation();
  }, [user]);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BFF_URL}/v1/courses/recommend/today`, {
        headers: {
          'Authorization': `Bearer ${user?.id || 'demo-user'}`,
        },
      });

      const result = await response.json();

      if (result.ok) {
        setRecommendation(result.data);
      } else {
        throw new Error(result.error?.message || '추천을 불러올 수 없어요');
      }
    } catch (err: any) {
      console.error('Recommendation fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { recommendation, loading, error, refetch: fetchRecommendation };
}
