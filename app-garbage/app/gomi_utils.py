# ゴミ日判定ロジック（隔週など）
from datetime import timedelta
import calendar

# 日本語の曜日変換
WEEKDAYS_JP = ['月', '火', '水', '木', '金', '土', '日']

def get_today_and_week_schedule(db, classification, today):
    """
    今日を起点に7日分のスケジュールを返す
    """
    schedule = []

    for i in range(7):
        date = today + timedelta(days=i)
        weekday_jp = WEEKDAYS_JP[date.weekday()]
        date_str = date.strftime('%Y-%m-%d')

        cursor = db.cursor(dictionary=True, buffered=True)
        cursor.execute(
            "SELECT gomi_type FROM garbage_schedule WHERE classification = %s AND date = %s",
            (classification, date_str)
        )
        results = cursor.fetchall()
        cursor.close()

        gomi_list = [row['gomi_type'] for row in results] if results else ['回収なし']

        schedule.append({
            'date': date.strftime('%m/%d（' + weekday_jp + '）'),
            'gomi_types': gomi_list
        })

    return schedule