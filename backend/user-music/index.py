'''
Business: User-specific music management - CRUD для альбомов и треков пользователей
Args: event with httpMethod, body, headers (X-Auth-Token); context with request_id
Returns: HTTP response with user's albums/tracks or operation result
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_session(token: str) -> Optional[int]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT user_id FROM sessions 
                WHERE token = %s AND expires_at > NOW()
            ''', (token,))
            result = cur.fetchone()
            return result['user_id'] if result else None
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    token = event.get('headers', {}).get('x-auth-token')
    path = event.get('queryStringParameters', {}).get('path', '')
    
    if not token and method != 'GET':
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    user_id = verify_session(token) if token else None
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # GET /albums?username=... - Получить альбомы пользователя
            if method == 'GET' and path == 'albums':
                username = event.get('queryStringParameters', {}).get('username')
                
                if username:
                    cur.execute('''
                        SELECT a.id, a.title, a.cover_url, a.price, a.created_at,
                               u.username, u.display_name, u.avatar_url
                        FROM albums a
                        JOIN users u ON a.user_id = u.id
                        WHERE u.username = %s
                        ORDER BY a.created_at DESC
                    ''', (username,))
                elif user_id:
                    cur.execute('''
                        SELECT id, title, cover_url, price, created_at
                        FROM albums
                        WHERE user_id = %s
                        ORDER BY created_at DESC
                    ''', (user_id,))
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Username or auth token required'})
                    }
                
                albums = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(a) for a in albums], default=str)
                }
            
            # GET /tracks?album_id=... or ?username=... - Получить треки
            if method == 'GET' and path == 'tracks':
                album_id = event.get('queryStringParameters', {}).get('album_id')
                username = event.get('queryStringParameters', {}).get('username')
                
                if album_id:
                    cur.execute('''
                        SELECT t.id, t.title, t.duration, t.preview_url, t.file_url, t.price,
                               t.label, t.album_id, t.created_at, u.username, u.display_name
                        FROM tracks t
                        JOIN users u ON t.user_id = u.id
                        WHERE t.album_id = %s
                        ORDER BY t.created_at ASC
                    ''', (album_id,))
                elif username:
                    cur.execute('''
                        SELECT t.id, t.title, t.duration, t.preview_url, t.file_url, t.price,
                               t.label, t.album_id, t.created_at
                        FROM tracks t
                        JOIN users u ON t.user_id = u.id
                        WHERE u.username = %s
                        ORDER BY t.created_at DESC
                    ''', (username,))
                elif user_id:
                    cur.execute('''
                        SELECT id, title, duration, preview_url, file_url, price, label, album_id, created_at
                        FROM tracks
                        WHERE user_id = %s
                        ORDER BY created_at DESC
                    ''', (user_id,))
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album ID, username, or auth token required'})
                    }
                
                tracks = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(t) for t in tracks], default=str)
                }
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid or expired token'})
                }
            
            # POST /albums - Создать альбом
            if method == 'POST' and path == 'albums':
                body = json.loads(event.get('body', '{}'))
                title = body.get('title')
                cover_url = body.get('cover_url')
                price = body.get('price', 0)
                
                if not title:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Title is required'})
                    }
                
                cur.execute('''
                    INSERT INTO albums (user_id, title, cover_url, price, created_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    RETURNING id, title, cover_url, price, created_at
                ''', (user_id, title, cover_url, price))
                album = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(album), default=str)
                }
            
            # POST /tracks - Создать трек
            if method == 'POST' and path == 'tracks':
                body = json.loads(event.get('body', '{}'))
                title = body.get('title')
                album_id = body.get('album_id')
                duration = body.get('duration', 0)
                preview_url = body.get('preview_url')
                file_url = body.get('file_url')
                price = body.get('price', 0)
                label = body.get('label')
                
                if not title or not album_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Title and album_id are required'})
                    }
                
                cur.execute('SELECT id FROM albums WHERE id = %s AND user_id = %s', (album_id, user_id))
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album not found or access denied'})
                    }
                
                cur.execute('''
                    INSERT INTO tracks (user_id, album_id, title, duration, preview_url, file_url, price, label, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    RETURNING id, title, duration, preview_url, file_url, price, label, album_id, created_at
                ''', (user_id, album_id, title, duration, preview_url, file_url, price, label))
                track = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(track), default=str)
                }
            
            # PUT /albums?id=... - Обновить альбом
            if method == 'PUT' and path == 'albums':
                album_id = event.get('queryStringParameters', {}).get('id')
                body = json.loads(event.get('body', '{}'))
                
                if not album_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album ID is required'})
                    }
                
                cur.execute('SELECT id FROM albums WHERE id = %s AND user_id = %s', (album_id, user_id))
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album not found or access denied'})
                    }
                
                updates = []
                params = []
                if 'title' in body:
                    updates.append('title = %s')
                    params.append(body['title'])
                if 'cover_url' in body:
                    updates.append('cover_url = %s')
                    params.append(body['cover_url'])
                if 'price' in body:
                    updates.append('price = %s')
                    params.append(body['price'])
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                params.append(album_id)
                cur.execute(f'''
                    UPDATE albums SET {', '.join(updates)}, updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, title, cover_url, price, created_at, updated_at
                ''', params)
                album = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(album), default=str)
                }
            
            # PUT /tracks?id=... - Обновить трек
            if method == 'PUT' and path == 'tracks':
                track_id = event.get('queryStringParameters', {}).get('id')
                body = json.loads(event.get('body', '{}'))
                
                if not track_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track ID is required'})
                    }
                
                cur.execute('SELECT id FROM tracks WHERE id = %s AND user_id = %s', (track_id, user_id))
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track not found or access denied'})
                    }
                
                updates = []
                params = []
                if 'title' in body:
                    updates.append('title = %s')
                    params.append(body['title'])
                if 'duration' in body:
                    updates.append('duration = %s')
                    params.append(body['duration'])
                if 'preview_url' in body:
                    updates.append('preview_url = %s')
                    params.append(body['preview_url'])
                if 'file_url' in body:
                    updates.append('file_url = %s')
                    params.append(body['file_url'])
                if 'price' in body:
                    updates.append('price = %s')
                    params.append(body['price'])
                if 'label' in body:
                    updates.append('label = %s')
                    params.append(body['label'])
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                params.append(track_id)
                cur.execute(f'''
                    UPDATE tracks SET {', '.join(updates)}, updated_at = NOW()
                    WHERE id = %s
                    RETURNING id, title, duration, preview_url, file_url, price, label, album_id, created_at, updated_at
                ''', params)
                track = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(track), default=str)
                }
            
            # DELETE /tracks?id=... - Удалить трек
            if method == 'DELETE' and path == 'tracks':
                track_id = event.get('queryStringParameters', {}).get('id')
                
                if not track_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track ID is required'})
                    }
                
                cur.execute('DELETE FROM tracks WHERE id = %s AND user_id = %s', (track_id, user_id))
                if cur.rowcount == 0:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track not found or access denied'})
                    }
                
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Track deleted successfully'})
                }
            
            # DELETE /albums?id=... - Удалить альбом
            if method == 'DELETE' and path == 'albums':
                album_id = event.get('queryStringParameters', {}).get('id')
                
                if not album_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album ID is required'})
                    }
                
                cur.execute('DELETE FROM albums WHERE id = %s AND user_id = %s', (album_id, user_id))
                if cur.rowcount == 0:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album not found or access denied'})
                    }
                
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Album deleted successfully'})
                }
            
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'})
            }
    finally:
        conn.close()