'''
Business: API для управления музыкальной библиотекой (альбомы, треки, статистика)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с request_id, function_name, memory_limit_in_mb
Returns: HTTP response dict с альбомами, треками или статистикой
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        path = event.get('queryStringParameters', {}).get('path', '')
        
        if method == 'GET':
            if path == 'albums':
                result = get_albums(cursor)
            elif path == 'tracks':
                album_id = event.get('queryStringParameters', {}).get('album_id')
                result = get_tracks(cursor, album_id)
            elif path == 'stats':
                track_id = event.get('queryStringParameters', {}).get('track_id')
                result = get_stats(cursor, track_id)
            else:
                result = get_all_data(cursor)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if path == 'album':
                result = create_album(cursor, conn, body)
            elif path == 'track':
                result = create_track(cursor, conn, body)
            elif path == 'stat':
                result = update_stat(cursor, conn, body)
            else:
                return error_response('Invalid path', 400)
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str)
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            
            if not item_id:
                return error_response('ID is required', 400)
            
            if path == 'album':
                result = update_album(cursor, conn, item_id, body)
            elif path == 'track':
                result = update_track(cursor, conn, item_id, body)
            else:
                return error_response('Invalid path', 400)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str)
            }
        
        else:
            return error_response('Method not allowed', 405)
            
    except Exception as e:
        print(f'Error: {str(e)}')
        return error_response(str(e), 500)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def get_albums(cursor) -> List[Dict]:
    cursor.execute('''
        SELECT a.*, 
               COUNT(t.id) as tracks_count
        FROM albums a
        LEFT JOIN tracks t ON a.id = t.album_id
        GROUP BY a.id
        ORDER BY a.created_at DESC
    ''')
    albums = cursor.fetchall()
    
    for album in albums:
        cursor.execute('SELECT * FROM tracks WHERE album_id = %s ORDER BY track_order, created_at', (album['id'],))
        album['trackList'] = cursor.fetchall()
    
    return albums

def get_tracks(cursor, album_id: Optional[str] = None) -> List[Dict]:
    if album_id:
        cursor.execute('SELECT * FROM tracks WHERE album_id = %s ORDER BY track_order, created_at', (album_id,))
    else:
        cursor.execute('SELECT * FROM tracks ORDER BY created_at DESC')
    return cursor.fetchall()

def get_stats(cursor, track_id: Optional[str] = None) -> Dict:
    if track_id:
        cursor.execute('SELECT * FROM track_stats WHERE track_id = %s', (track_id,))
        return cursor.fetchone() or {}
    else:
        cursor.execute('''
            SELECT 
                SUM(plays_count) as total_plays,
                SUM(downloads_count) as total_downloads,
                COUNT(*) as tracked_tracks
            FROM track_stats
        ''')
        totals = cursor.fetchone()
        
        cursor.execute('''
            SELECT t.id, t.title, ts.plays_count, ts.downloads_count
            FROM track_stats ts
            JOIN tracks t ON ts.track_id = t.id
            ORDER BY ts.plays_count DESC
            LIMIT 10
        ''')
        top_tracks = cursor.fetchall()
        
        return {
            'totals': totals,
            'top_tracks': top_tracks
        }

def get_all_data(cursor) -> Dict:
    albums = get_albums(cursor)
    tracks = get_tracks(cursor)
    stats = get_stats(cursor)
    
    return {
        'albums': albums,
        'tracks': tracks,
        'stats': stats
    }

def create_album(cursor, conn, data: Dict) -> Dict:
    cursor.execute('''
        INSERT INTO albums (id, title, artist, cover, price, description, tracks_count, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    ''', (
        data.get('id', str(int(datetime.now().timestamp() * 1000))),
        data['title'],
        data['artist'],
        data.get('cover', ''),
        data.get('price', 0),
        data.get('description', ''),
        0,
        datetime.now()
    ))
    conn.commit()
    return cursor.fetchone()

def create_track(cursor, conn, data: Dict) -> Dict:
    cursor.execute('''
        INSERT INTO tracks (id, album_id, title, duration, file, price, cover, track_order, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    ''', (
        data.get('id', str(int(datetime.now().timestamp() * 1000))),
        data.get('album_id', ''),
        data['title'],
        data['duration'],
        data.get('file', ''),
        data.get('price', 0),
        data.get('cover', ''),
        data.get('track_order', 0),
        datetime.now()
    ))
    conn.commit()
    
    if data.get('album_id'):
        cursor.execute('''
            UPDATE albums 
            SET tracks_count = tracks_count + 1, updated_at = %s
            WHERE id = %s
        ''', (datetime.now(), data['album_id']))
        conn.commit()
    
    return cursor.fetchone()

def update_album(cursor, conn, album_id: str, data: Dict) -> Dict:
    cursor.execute('''
        UPDATE albums 
        SET title = %s, artist = %s, cover = %s, price = %s, description = %s, updated_at = %s
        WHERE id = %s
        RETURNING *
    ''', (
        data['title'],
        data['artist'],
        data.get('cover', ''),
        data.get('price', 0),
        data.get('description', ''),
        datetime.now(),
        album_id
    ))
    conn.commit()
    return cursor.fetchone()

def update_track(cursor, conn, track_id: str, data: Dict) -> Dict:
    cursor.execute('''
        UPDATE tracks 
        SET title = %s, duration = %s, file = %s, price = %s, track_order = %s, updated_at = %s
        WHERE id = %s
        RETURNING *
    ''', (
        data['title'],
        data['duration'],
        data.get('file', ''),
        data.get('price', 0),
        data.get('track_order', 0),
        datetime.now(),
        track_id
    ))
    conn.commit()
    return cursor.fetchone()

def update_stat(cursor, conn, data: Dict) -> Dict:
    track_id = data['track_id']
    stat_type = data.get('type', 'play')
    
    cursor.execute('SELECT * FROM track_stats WHERE track_id = %s', (track_id,))
    existing = cursor.fetchone()
    
    if existing:
        if stat_type == 'play':
            cursor.execute('''
                UPDATE track_stats 
                SET plays_count = plays_count + 1, last_played_at = %s, updated_at = %s
                WHERE track_id = %s
                RETURNING *
            ''', (datetime.now(), datetime.now(), track_id))
        else:
            cursor.execute('''
                UPDATE track_stats 
                SET downloads_count = downloads_count + 1, last_downloaded_at = %s, updated_at = %s
                WHERE track_id = %s
                RETURNING *
            ''', (datetime.now(), datetime.now(), track_id))
    else:
        if stat_type == 'play':
            cursor.execute('''
                INSERT INTO track_stats (track_id, plays_count, last_played_at, created_at)
                VALUES (%s, 1, %s, %s)
                RETURNING *
            ''', (track_id, datetime.now(), datetime.now()))
        else:
            cursor.execute('''
                INSERT INTO track_stats (track_id, downloads_count, last_downloaded_at, created_at)
                VALUES (%s, 1, %s, %s)
                RETURNING *
            ''', (track_id, datetime.now(), datetime.now()))
    
    conn.commit()
    return cursor.fetchone()

def error_response(message: str, status_code: int) -> Dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }
