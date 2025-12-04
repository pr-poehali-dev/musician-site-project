import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Функция для отслеживания посещений сайта
    Записывает информацию о визите в базу данных
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        page_url = body_data.get('page_url', '/')
        
        request_context = event.get('requestContext', {})
        identity = request_context.get('identity', {})
        ip_address = identity.get('sourceIp', 'unknown')
        user_agent = event.get('headers', {}).get('user-agent', 'unknown')
        
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database URL not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO t_p39135821_musician_site_projec.site_visits (ip_address, user_agent, page_url) VALUES (%s, %s, %s)",
            (ip_address, user_agent, page_url)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database URL not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM t_p39135821_musician_site_projec.site_visits")
        total_visits = cur.fetchone()[0]
        
        cur.execute("""
            SELECT COUNT(*) FROM t_p39135821_musician_site_projec.site_visits 
            WHERE visited_at >= CURRENT_DATE
        """)
        today_visits = cur.fetchone()[0]
        
        cur.execute("""
            SELECT COUNT(*) FROM t_p39135821_musician_site_projec.site_visits 
            WHERE visited_at >= CURRENT_DATE - INTERVAL '7 days'
        """)
        week_visits = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'total': total_visits,
                'today': today_visits,
                'week': week_visits
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
