import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получение детальной статистики посещений сайта за разные периоды
    Args: event - словарь с httpMethod и queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: JSON с детальной статистикой посещений
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    today = datetime.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    cursor.execute("""
        SELECT 
            DATE(visited_at) as date,
            COUNT(*) as visits
        FROM site_visits
        WHERE visited_at >= %s
        GROUP BY DATE(visited_at)
        ORDER BY date DESC
    """, (month_ago,))
    daily_stats = cursor.fetchall()
    
    cursor.execute("""
        SELECT COUNT(*) as total FROM site_visits
    """)
    total_result = cursor.fetchone()
    total_visits = total_result['total'] if total_result else 0
    
    cursor.execute("""
        SELECT COUNT(*) as today FROM site_visits 
        WHERE DATE(visited_at) = %s
    """, (today,))
    today_result = cursor.fetchone()
    today_visits = today_result['today'] if today_result else 0
    
    cursor.execute("""
        SELECT COUNT(*) as week FROM site_visits 
        WHERE visited_at >= %s
    """, (week_ago,))
    week_result = cursor.fetchone()
    week_visits = week_result['week'] if week_result else 0
    
    cursor.execute("""
        SELECT COUNT(*) as month FROM site_visits 
        WHERE visited_at >= %s
    """, (month_ago,))
    month_result = cursor.fetchone()
    month_visits = month_result['month'] if month_result else 0
    
    cursor.close()
    conn.close()
    
    daily_data = [
        {
            'date': str(row['date']),
            'visits': row['visits']
        }
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
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result),
        'isBase64Encoded': False
    }
