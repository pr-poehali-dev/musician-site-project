import json
import os
import psycopg2
from typing import Dict, Any

SCHEMA = 't_p39135821_musician_site_projec'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Функция для отслеживания посещений сайта.
    POST — записывает визит в базу данных.
    GET — возвращает статистику посещений.
    '''
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database URL not configured'}),
            'isBase64Encoded': False
        }

    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        page_url = body_data.get('page_url', '/').replace("'", "''")

        request_context = event.get('requestContext', {})
        identity = request_context.get('identity', {})
        ip_address = identity.get('sourceIp', 'unknown').replace("'", "''")
        user_agent = event.get('headers', {}).get('user-agent', 'unknown').replace("'", "''")

        cur.execute(
            f"INSERT INTO {SCHEMA}.site_visits (ip_address, user_agent, page_url) VALUES ('{ip_address}', '{user_agent}', '{page_url}')"
        )

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }

    if method == 'GET':
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.site_visits")
        total_visits = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.site_visits WHERE visited_at >= CURRENT_DATE")
        today_visits = cur.fetchone()[0]

        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.site_visits WHERE visited_at >= CURRENT_DATE - INTERVAL '7 days'")
        week_visits = cur.fetchone()[0]

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'total': total_visits, 'today': today_visits, 'week': week_visits}),
            'isBase64Encoded': False
        }

    cur.close()
    conn.close()

    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
