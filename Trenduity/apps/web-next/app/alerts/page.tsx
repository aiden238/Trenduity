/**
 * 알림 목록 페이지
 * 
 * TODO(IMPLEMENT): alerts 테이블 조회
 * TODO(IMPLEMENT): 읽음 처리
 */
export default function AlertsPage() {
  const alerts = [
    {
      id: '1',
      type: 'med_check',
      message: '김어머니님이 아침 약을 체크했습니다',
      timestamp: '2시간 전',
      isRead: false,
    },
    {
      id: '2',
      type: 'card_completed',
      message: '박아버지님이 오늘의 카드를 완료했습니다',
      timestamp: '1일 전',
      isRead: true,
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">알림</h2>

      <div className="bg-white rounded-lg shadow divide-y">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-6 ${!alert.isRead ? 'bg-blue-50' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold">{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">{alert.timestamp}</p>
              </div>
              {!alert.isRead && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  새로운
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
