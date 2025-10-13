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
    
    path = event.get('queryStringParameters', {}).get('path', '')
    print(f'[DEBUG] Method: {method}, Path: {path}')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            if path == 'albums':
                result = get_albums(cursor)
            elif path == 'tracks':
                album_id = event.get('queryStringParameters', {}).get('album_id')
                result = get_tracks(cursor, album_id)
            elif path == 'stats':
                track_id = event.get('queryStringParameters', {}).get('track_id')
                result = get_stats(cursor, track_id)
            elif path == 'media':
                media_id = event.get('queryStringParameters', {}).get('id')
                if not media_id:
                    return error_response('Media ID is required', 400)
                result = get_media_file(cursor, media_id)
                if not result:
                    return error_response('Media file not found', 404)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps(result, default=str)
                }
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
            print(f'[DEBUG] POST body: {json.dumps(body)}')
            
            if path == 'album':
                result = create_album(cursor, conn, body)
            elif path == 'track':
                print(f'[DEBUG] Creating track with data: {body}')
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
                'isBase64Encoded': False,
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
                'isBase64Encoded': False,
                'body': json.dumps(result, default=str)
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            item_id = query_params.get('id')
            
            if not item_id:
                return error_response('ID is required', 400)
            
            if path == 'album':
                result = delete_album(cursor, conn, item_id)
            elif path == 'track':
                result = delete_track(cursor, conn, item_id)
            else:
                return error_response('Invalid path', 400)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result, default=str)
            }
        
        else:
            return error_response('Method not allowed', 405)
            
    except Exception as e:
        import traceback
        print(f'[ERROR] Exception: {str(e)}')
        print(f'[ERROR] Traceback: {traceback.format_exc()}')
        return error_response(str(e), 500)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def get_albums(cursor) -> List[Dict]:
    print('[DEBUG] Getting albums...')
    cursor.execute('''
        SELECT a.id, a.title, a.artist, a.cover, a.price, a.description, a.created_at, a.updated_at,
               COUNT(t.id) as tracks_count
        FROM albums a
        LEFT JOIN tracks t ON a.id = t.album_id
        GROUP BY a.id, a.title, a.artist, a.cover, a.price, a.description, a.created_at, a.updated_at
        ORDER BY a.created_at DESC
        LIMIT 100
    ''')
    albums = cursor.fetchall()
    print(f'[DEBUG] Found {len(albums)} albums')
    
    for album in albums:
        try:
            album_id = str(album['id']).replace("'", "''")
            print(f'[DEBUG] Getting tracks for album: {album_id}')
            cursor.execute(f"SELECT id, album_id, title, duration, file, price, cover, track_order, created_at FROM tracks WHERE album_id = '{album_id}' ORDER BY track_order, created_at LIMIT 50")
            tracks = cursor.fetchall()
            
            album['trackList'] = tracks if tracks else []
            print(f'[DEBUG] Found {len(tracks) if tracks else 0} tracks for album {album_id}')
        except Exception as e:
            print(f'[ERROR] Failed to get tracks for album: {e}')
            album['trackList'] = []
    
    print(f'[DEBUG] Returning albums with tracks')
    return albums

def get_tracks(cursor, album_id: Optional[str] = None) -> List[Dict]:
    if album_id:
        safe_id = album_id.replace("'", "''")
        cursor.execute(f"SELECT id, album_id, title, duration, file, price, cover, track_order, created_at FROM tracks WHERE album_id = '{safe_id}' ORDER BY track_order, created_at LIMIT 50")
    else:
        cursor.execute("SELECT id, album_id, title, duration, file, price, cover, track_order, created_at FROM tracks ORDER BY created_at DESC LIMIT 100")
    
    return cursor.fetchall()

def get_media_file(cursor, media_id: str) -> Optional[Dict]:
    safe_id = media_id.replace("'", "''")
    cursor.execute(f"SELECT * FROM media_files WHERE id = '{safe_id}'")
    return cursor.fetchone()

def get_stats(cursor, track_id: Optional[str] = None) -> Dict:
    if track_id:
        safe_id = track_id.replace("'", "''")
        cursor.execute(f"SELECT * FROM track_stats WHERE track_id = '{safe_id}'")
        return cursor.fetchone() or {}
    else:
        cursor.execute('''
            SELECT 
                COALESCE(SUM(plays_count), 0) as total_plays,
                COALESCE(SUM(downloads_count), 0) as total_downloads,
                COUNT(*) as tracked_tracks
            FROM track_stats
        ''')
        totals = cursor.fetchone()
        
        cursor.execute('''
            SELECT t.id, t.title, 
                   COALESCE(ts.plays_count, 0) as plays_count, 
                   COALESCE(ts.downloads_count, 0) as downloads_count
            FROM track_stats ts
            JOIN tracks t ON ts.track_id = t.id
            WHERE ts.plays_count > 0
            ORDER BY ts.plays_count DESC
            LIMIT 10
        ''')
        top_tracks = cursor.fetchall()
        
        return {
            'totals': totals,
            'top_tracks': top_tracks if top_tracks else []
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

def save_media_file(cursor, conn, file_id: str, file_type: str, data: str) -> str:
    if not data or len(data) < 100:
        return file_id
    
    safe_id = file_id.replace("'", "''")
    safe_type = file_type.replace("'", "''")
    safe_data = data.replace("'", "''")
    now = datetime.now().isoformat()
    
    cursor.execute(f"SELECT id FROM media_files WHERE id = '{safe_id}'")
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(f"UPDATE media_files SET data = '{safe_data}', file_type = '{safe_type}' WHERE id = '{safe_id}'")
    else:
        cursor.execute(f"INSERT INTO media_files (id, file_type, data, created_at) VALUES ('{safe_id}', '{safe_type}', '{safe_data}', '{now}')")
    
    conn.commit()
    return file_id

def create_album(cursor, conn, data: Dict) -> Dict:
    album_id = data.get('id', str(int(datetime.now().timestamp() * 1000))).replace("'", "''")
    title = data['title'].replace("'", "''")
    artist = data['artist'].replace("'", "''")
    cover_data = data.get('cover', '')
    price = data.get('price', 0)
    description = data.get('description', '').replace("'", "''")
    now = datetime.now().isoformat()
    
    cover_id = ''
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{album_id}"
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    
    cursor.execute(f'''
        INSERT INTO albums (id, title, artist, cover, price, description, tracks_count, created_at)
        VALUES ('{album_id}', '{title}', '{artist}', '{cover_id}', {price}, '{description}', 0, '{now}')
        RETURNING *
    ''')
    conn.commit()
    return cursor.fetchone()

def create_track(cursor, conn, data: Dict) -> Dict:
    track_id = data.get('id', str(int(datetime.now().timestamp() * 1000))).replace("'", "''")
    album_id = data.get('album_id', '').replace("'", "''")
    title = data['title'].replace("'", "''")
    duration = data['duration'].replace("'", "''")
    file_data = data.get('file', '')
    price = data.get('price', 0)
    cover_data = data.get('cover', '')
    track_order = data.get('track_order', 0)
    now = datetime.now().isoformat()
    
    file_id = file_data if len(file_data) < 100 else ''
    if file_data and len(file_data) > 100:
        file_id = f"audio_{track_id}"
        save_media_file(cursor, conn, file_id, 'audio', file_data)
    
    cover_id = cover_data if len(cover_data) < 100 else ''
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{track_id}"
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    
    cursor.execute(f'''
        INSERT INTO tracks (id, album_id, title, duration, file, price, cover, track_order, created_at)
        VALUES ('{track_id}', '{album_id}', '{title}', '{duration}', '{file_id}', {price}, '{cover_id}', {track_order}, '{now}')
        RETURNING *
    ''')
    new_track = cursor.fetchone()
    conn.commit()
    
    if album_id:
        cursor.execute(f'''
            UPDATE albums 
            SET tracks_count = tracks_count + 1, updated_at = '{now}'
            WHERE id = '{album_id}'
        ''')
        conn.commit()
    
    return new_track

def update_album(cursor, conn, album_id: str, data: Dict) -> Dict:
    safe_id = album_id.replace("'", "''")
    title = data['title'].replace("'", "''")
    artist = data['artist'].replace("'", "''")
    cover_data = data.get('cover', '')
    price = data.get('price', 0)
    description = data.get('description', '').replace("'", "''")
    now = datetime.now().isoformat()
    
    cover_id = cover_data if len(cover_data) < 100 else ''
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{album_id}"
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    
    cursor.execute(f'''
        UPDATE albums 
        SET title = '{title}', artist = '{artist}', cover = '{cover_id}', price = {price}, description = '{description}', updated_at = '{now}'
        WHERE id = '{safe_id}'
        RETURNING *
    ''')
    conn.commit()
    return cursor.fetchone()

def update_track(cursor, conn, track_id: str, data: Dict) -> Dict:
    safe_id = track_id.replace("'", "''")
    title = data['title'].replace("'", "''")
    duration = data['duration'].replace("'", "''")
    file_path = data.get('file', '').replace("'", "''")
    price = data.get('price', 0)
    track_order = data.get('track_order', 0)
    now = datetime.now().isoformat()
    
    cursor.execute(f'''
        UPDATE tracks 
        SET title = '{title}', duration = '{duration}', file = '{file_path}', price = {price}, track_order = {track_order}, updated_at = '{now}'
        WHERE id = '{safe_id}'
        RETURNING *
    ''')
    conn.commit()
    return cursor.fetchone()

def update_stat(cursor, conn, data: Dict) -> Dict:
    track_id = data['track_id'].replace("'", "''")
    stat_type = data.get('type', 'play')
    now = datetime.now().isoformat()
    
    cursor.execute(f"SELECT * FROM track_stats WHERE track_id = '{track_id}'")
    existing = cursor.fetchone()
    
    if existing:
        if stat_type == 'play':
            cursor.execute(f'''
                UPDATE track_stats 
                SET plays_count = plays_count + 1, last_played_at = '{now}', updated_at = '{now}'
                WHERE track_id = '{track_id}'
                RETURNING *
            ''')
        else:
            cursor.execute(f'''
                UPDATE track_stats 
                SET downloads_count = downloads_count + 1, last_downloaded_at = '{now}', updated_at = '{now}'
                WHERE track_id = '{track_id}'
                RETURNING *
            ''')
    else:
        if stat_type == 'play':
            cursor.execute(f'''
                INSERT INTO track_stats (track_id, plays_count, last_played_at, created_at)
                VALUES ('{track_id}', 1, '{now}', '{now}')
                RETURNING *
            ''')
        else:
            cursor.execute(f'''
                INSERT INTO track_stats (track_id, downloads_count, last_downloaded_at, created_at)
                VALUES ('{track_id}', 1, '{now}', '{now}')
                RETURNING *
            ''')
    
    conn.commit()
    return cursor.fetchone()

def delete_album(cursor, conn, album_id: str) -> Dict:
    safe_id = album_id.replace("'", "''")
    
    cursor.execute(f"DELETE FROM tracks WHERE album_id = '{safe_id}'")
    cursor.execute(f"DELETE FROM albums WHERE id = '{safe_id}'")
    conn.commit()
    
    return {'success': True, 'deleted_album_id': album_id}

def delete_track(cursor, conn, track_id: str) -> Dict:
    safe_id = track_id.replace("'", "''")
    
    cursor.execute(f"DELETE FROM tracks WHERE id = '{safe_id}'")
    conn.commit()
    
    return {'success': True, 'deleted_track_id': track_id}

def error_response(message: str, status_code: int) -> Dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': message})
    }