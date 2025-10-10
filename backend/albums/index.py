"""
Business: API для управления альбомами и треками музыкального магазина
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с альбомами/треками или статусом операции
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

def get_db_connection():
    """Создает подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found in environment')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            path = event.get('path', '')
            
            if '/albums' in path:
                cursor.execute("""
                    SELECT id, title, artist, cover, price, description, tracks_count, created_at
                    FROM albums
                    ORDER BY created_at DESC
                """)
                
                albums = []
                for row in cursor.fetchall():
                    album_id = row[0]
                    
                    cursor.execute("""
                        SELECT id, title, duration, file, price, cover
                        FROM tracks
                        WHERE album_id = %s
                        ORDER BY created_at ASC
                    """, (album_id,))
                    
                    track_list = []
                    for track_row in cursor.fetchall():
                        track_list.append({
                            'id': track_row[0],
                            'title': track_row[1],
                            'duration': track_row[2],
                            'file': track_row[3] or '',
                            'price': track_row[4],
                            'cover': track_row[5] or ''
                        })
                    
                    albums.append({
                        'id': row[0],
                        'title': row[1],
                        'artist': row[2],
                        'cover': row[3] or '',
                        'price': row[4],
                        'description': row[5] or '',
                        'tracks': len(track_list),
                        'trackList': track_list
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'albums': albums}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'add_album':
                album_id = str(body_data.get('id', ''))
                title = body_data.get('title', '')
                artist = body_data.get('artist', '')
                cover = body_data.get('cover', '')
                price = int(body_data.get('price', 0))
                description = body_data.get('description', '')
                
                cursor.execute("""
                    INSERT INTO albums (id, title, artist, cover, price, description, tracks_count)
                    VALUES (%s, %s, %s, %s, %s, %s, 0)
                """, (album_id, title, artist, cover, price, description))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'id': album_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_track':
                track_id = str(body_data.get('id', ''))
                album_id = body_data.get('albumId', '')
                title = body_data.get('title', '')
                duration = body_data.get('duration', '')
                file_path = body_data.get('file', '')
                price = int(body_data.get('price', 129))
                cover = body_data.get('cover', '')
                
                cursor.execute("""
                    INSERT INTO tracks (id, title, duration, file, price, cover, album_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (track_id, title, duration, file_path, price, cover, album_id))
                
                cursor.execute("""
                    UPDATE albums 
                    SET tracks_count = tracks_count + 1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (album_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'id': track_id}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'update_album':
                album_id = body_data.get('id', '')
                title = body_data.get('title', '')
                artist = body_data.get('artist', '')
                cover = body_data.get('cover', '')
                price = int(body_data.get('price', 0))
                description = body_data.get('description', '')
                
                cursor.execute("""
                    UPDATE albums 
                    SET title = %s, artist = %s, cover = %s, price = %s, description = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (title, artist, cover, price, description, album_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid request'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f'Error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
