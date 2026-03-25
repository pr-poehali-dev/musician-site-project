import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p39135821_musician_site_projec'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получение детальной статистики посещений сайта за разные периоды
    '''
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }

    today = datetime.now().date()
    week_ago = (today - timedelta(days=7)).isoformat()
    month_ago = (today - timedelta(days=30)).isoformat()
    today_str = today.isoformat()

    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute(f"""
        SELECT
            DATE(visited_at) as date,
            COUNT(*) as visits
        FROM {SCHEMA}.site_visits
        WHERE visited_at >= '{month_ago}'
        GROUP BY DATE(visited_at)
        ORDER BY date DESC
    """)
    daily_stats = cursor.fetchall()

    cursor.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.site_visits")
    total_visits = cursor.fetchone()['total']

    cursor.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.site_visits WHERE DATE(visited_at) = '{today_str}'")
    today_visits = cursor.fetchone()['cnt']

    cursor.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.site_visits WHERE visited_at >= '{week_ago}'")
    week_visits = cursor.fetchone()['cnt']

    cursor.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.site_visits WHERE visited_at >= '{month_ago}'")
    month_visits = cursor.fetchone()['cnt']

    cursor.close()
    conn.close()

    daily_data = [
        {'date': str(row['date']), 'visits': row['visits']}
        for row in daily_stats
    ]

    result = {
        'summary': {
            'today': today_visits,
            'week': week_visits,
            'month': month_visits,
            'total': total_visits
        },
        'daily': daily_data
    }

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result),
        'isBase64Encoded': False
    }
