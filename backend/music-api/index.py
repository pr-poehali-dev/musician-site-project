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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('path', '')
    print(f'[DEBUG] Method: {method}, Path: {path}')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if path == 'telegram' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            print(f'[DEBUG] Telegram webhook: {json.dumps(body)}')
            result = handle_telegram_webhook(cursor, conn, body)
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        
        if method == 'GET':
            if path == 'albums':
                result = get_albums(cursor)
            elif path == 'tracks':
                album_id = event.get('queryStringParameters', {}).get('album_id')
                result = get_tracks(cursor, album_id)
            elif path == 'track-file':
                track_id = event.get('queryStringParameters', {}).get('id')
                if not track_id:
                    return error_response('Track ID is required', 400)
                result = get_track_file(cursor, track_id)
                if not result:
                    return error_response('Track file not found', 404)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps(result, default=str)
                }
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
                'isBase64Encoded': False,
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
            elif path == 'media':
                media_id = body.get('id')
                file_type = body.get('file_type', 'audio')
                data = body.get('data', '')
                if not media_id or not data:
                    return error_response('Media ID and data are required', 400)
                print(f'[DEBUG] Saving media file: {media_id}, type: {file_type}, size: {len(data)}')
                result = save_media_file(cursor, conn, media_id, file_type, data)
                cursor.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': result}, default=str)
                }
            elif path == 'stat':
                result = update_stat(cursor, conn, body)
            elif path == 'order':
                result = create_web_order(cursor, conn, body)
                cursor.close()
                conn.close()
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps(result, default=str)
                }
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
        error_msg = str(e)
        print(f'[ERROR] Exception: {error_msg}')
        print(f'[ERROR] Traceback: {traceback.format_exc()}')
        
        # Закрываем соединение перед возвратом ошибки
        if 'cursor' in locals() and cursor:
            try:
                cursor.close()
            except:
                pass
        if 'conn' in locals() and conn:
            try:
                conn.close()
            except:
                pass
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': error_msg})
        }

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
    albums_raw = cursor.fetchall()
    print(f'[DEBUG] Found {len(albums_raw)} albums')
    
    albums = []
    for album_row in albums_raw:
        try:
            album = dict(album_row)
            album_id = str(album['id']).replace("'", "''")
            print(f'[DEBUG] Getting tracks for album: {album_id}')
            cursor.execute(f"""
                SELECT t.id, t.album_id, t.title, t.duration, t.price, t.cover, t.track_order, t.created_at,
                       COALESCE(ts.plays_count, 0) as plays_count
                FROM tracks t
                LEFT JOIN track_stats ts ON t.id = ts.track_id
                WHERE t.album_id = '{album_id}'
                ORDER BY t.track_order, t.created_at
                LIMIT 50
            """)
            tracks_raw = cursor.fetchall()
            
            album['trackList'] = [dict(track) for track in tracks_raw] if tracks_raw else []
            print(f'[DEBUG] Found {len(tracks_raw) if tracks_raw else 0} tracks for album {album_id}')
            albums.append(album)
        except Exception as e:
            print(f'[ERROR] Failed to get tracks for album: {e}')
            album = dict(album_row)
            album['trackList'] = []
            albums.append(album)
    
    print(f'[DEBUG] Returning albums with tracks')
    return albums

def get_tracks(cursor, album_id: Optional[str] = None) -> List[Dict]:
    if album_id:
        safe_id = album_id.replace("'", "''")
        cursor.execute(f"""
            SELECT t.id, t.album_id, t.title, t.duration, t.price, t.cover, t.track_order, t.created_at,
                   COALESCE(ts.plays_count, 0) as plays_count
            FROM tracks t
            LEFT JOIN track_stats ts ON t.id = ts.track_id
            WHERE t.album_id = '{safe_id}'
            ORDER BY t.track_order, t.created_at
            LIMIT 50
        """)
    else:
        cursor.execute("""
            SELECT t.id, t.album_id, t.title, t.duration, t.price, t.cover, t.track_order, t.created_at,
                   COALESCE(ts.plays_count, 0) as plays_count
            FROM tracks t
            LEFT JOIN track_stats ts ON t.id = ts.track_id
            ORDER BY t.created_at DESC
            LIMIT 100
        """)
    
    tracks_raw = cursor.fetchall()
    return [dict(track) for track in tracks_raw] if tracks_raw else []

def get_track_file(cursor, track_id: str) -> Optional[Dict]:
    safe_id = track_id.replace("'", "''")
    cursor.execute(f"SELECT file FROM tracks WHERE id = '{safe_id}'")
    result = cursor.fetchone()
    if not result or not result['file']:
        return None
    
    file_ref = result['file']
    
    # Если file начинается с audio_ - это ID медиафайла, загружаем из media_files
    if file_ref.startswith('audio_'):
        media_file = get_media_file(cursor, file_ref)
        if media_file:
            return {'file': media_file['data']}
        return None
    
    # Иначе это прямая ссылка или base64
    return {'file': file_ref}

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
    print(f'[DEBUG] create_album called with data: {data}')
    album_id = data.get('id', str(int(datetime.now().timestamp() * 1000))).replace("'", "''")
    title = data['title'].replace("'", "''")
    artist = data['artist'].replace("'", "''")
    cover_data = data.get('cover', '')
    price = data.get('price', 0)
    description = data.get('description', '').replace("'", "''")
    now = datetime.now().isoformat()
    
    print(f'[DEBUG] Album fields - id: {album_id}, title: {title}, artist: {artist}')
    
    cover_id = None
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{album_id}"
        print(f'[DEBUG] Saving cover image with id: {cover_id}')
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    
    print(f'[DEBUG] Inserting album into database...')
    cover_value = f"'{cover_id}'" if cover_id else 'NULL'
    cursor.execute(f'''
        INSERT INTO albums (id, title, artist, cover, price, description, tracks_count, created_at, user_id)
        VALUES ('{album_id}', '{title}', '{artist}', {cover_value}, {price}, '{description}', 0, '{now}', NULL)
        RETURNING *
    ''')
    conn.commit()
    result = cursor.fetchone()
    print(f'[DEBUG] Album created successfully: {result}')
    return result

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
    
    file_id = None
    if file_data and len(file_data) > 100:
        file_id = f"audio_{track_id}"
        save_media_file(cursor, conn, file_id, 'audio', file_data)
    elif file_data and len(file_data) > 0 and len(file_data) < 100:
        file_id = file_data
    
    cover_id = None
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{track_id}"
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    elif cover_data and len(cover_data) > 0 and len(cover_data) < 100:
        cover_id = cover_data
    
    file_value = f"'{file_id}'" if file_id else 'NULL'
    cover_value = f"'{cover_id}'" if cover_id else 'NULL'
    cursor.execute(f'''
        INSERT INTO tracks (id, album_id, title, duration, file, price, cover, track_order, created_at)
        VALUES ('{track_id}', '{album_id}', '{title}', '{duration}', {file_value}, {price}, {cover_value}, {track_order}, '{now}')
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
    
    cover_id = None
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{album_id}"
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    elif cover_data and len(cover_data) > 0 and len(cover_data) < 100:
        cover_id = cover_data
    
    cover_value = f"'{cover_id}'" if cover_id else 'NULL'
    cursor.execute(f'''
        UPDATE albums 
        SET title = '{title}', artist = '{artist}', cover = {cover_value}, price = {price}, description = '{description}', updated_at = '{now}'
        WHERE id = '{safe_id}'
        RETURNING *
    ''')
    conn.commit()
    return cursor.fetchone()

def update_track(cursor, conn, track_id: str, data: Dict) -> Dict:
    safe_id = track_id.replace("'", "''")
    title = data['title'].replace("'", "''")
    duration = data['duration'].replace("'", "''")
    file_data = data.get('file', '')
    price = data.get('price', 0)
    track_order = data.get('track_order', 0)
    now = datetime.now().isoformat()
    
    file_id = None
    if file_data and len(file_data) > 100:
        file_id = f"audio_{track_id}"
        save_media_file(cursor, conn, file_id, 'audio', file_data)
    elif file_data and len(file_data) > 0 and len(file_data) < 100:
        file_id = file_data
    
    file_value = f"'{file_id}'" if file_id else 'NULL'
    cursor.execute(f'''
        UPDATE tracks 
        SET title = '{title}', duration = '{duration}', file = {file_value}, price = {price}, track_order = {track_order}, updated_at = '{now}'
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

def send_telegram_message(chat_id: int, text: str, reply_markup: Dict = None) -> bool:
    import urllib.request
    import urllib.parse
    
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not token:
        print('[ERROR] TELEGRAM_BOT_TOKEN not found')
        return False
    
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    if reply_markup:
        data['reply_markup'] = json.dumps(reply_markup)
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status == 200
    except Exception as e:
        print(f'[ERROR] Failed to send message: {e}')
        return False

def create_order(cursor, conn, user_id: int, username: str, first_name: str, items: List[Dict], total: int) -> str:
    order_id = f'order_{int(datetime.now().timestamp() * 1000)}'
    items_json = json.dumps(items, ensure_ascii=False).replace("'", "''")
    safe_username = (username or '').replace("'", "''")
    safe_first_name = (first_name or '').replace("'", "''")
    
    cursor.execute(f'''
        INSERT INTO orders (id, user_id, username, first_name, items, total_price, status)
        VALUES ('{order_id}', {user_id}, '{safe_username}', '{safe_first_name}', '{items_json}', {total}, 'pending')
    ''')
    conn.commit()
    
    return order_id

def handle_telegram_webhook(cursor, conn, body: Dict) -> Dict:
    if 'message' in body:
        message = body['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        user = message['from']
        
        if text == '/start':
            msg = f'''👋 Привет, <b>{user.get('first_name', 'друг')}</b>!

Я бот для покупки музыкальных треков и альбомов.

<b>Команды:</b>
/catalog - Посмотреть каталог альбомов
/help - Помощь'''
            send_telegram_message(chat_id, msg)
        elif text == '/catalog':
            albums = get_albums(cursor)
            
            if not albums:
                send_telegram_message(chat_id, '📁 Каталог пуст')
                return {'ok': True}
            
            msg = '<b>🎵 Каталог альбомов:</b>\n\n'
            keyboard = {'inline_keyboard': []}
            
            for album in albums:
                msg += f'🎼 <b>{album["title"]}</b>\n'
                msg += f'👤 {album["artist"]}\n'
                msg += f'💿 Треков: {album["tracks_count"]}\n'
                msg += f'💰 {album["price"]} ₽\n\n'
                
                keyboard['inline_keyboard'].append([
                    {'text': f'🎧 {album["title"]}', 'callback_data': f'album_{album["id"]}'}
                ])
            
            send_telegram_message(chat_id, msg, keyboard)
        elif text == '/help':
            msg = '''<b>Помощь по боту:</b>

/catalog - Посмотреть все альбомы
/start - Начать работу с ботом

Для покупки выберите альбом из каталога.'''
            send_telegram_message(chat_id, msg)
        else:
            send_telegram_message(chat_id, 'Используйте /catalog для просмотра каталога')
    
    elif 'callback_query' in body:
        callback = body['callback_query']
        chat_id = callback['message']['chat']['id']
        data = callback['data']
        user = callback['from']
        
        if data == 'catalog':
            albums = get_albums(cursor)
            msg = '<b>🎵 Каталог альбомов:</b>\n\n'
            keyboard = {'inline_keyboard': []}
            
            for album in albums:
                msg += f'🎼 <b>{album["title"]}</b>\n'
                msg += f'👤 {album["artist"]}\n'
                msg += f'💰 {album["price"]} ₽\n\n'
                
                keyboard['inline_keyboard'].append([
                    {'text': f'🎧 {album["title"]}', 'callback_data': f'album_{album["id"]}'}
                ])
            
            send_telegram_message(chat_id, msg, keyboard)
            
        elif data.startswith('album_'):
            album_id = data.replace('album_', '')
            safe_id = album_id.replace("'", "''")
            cursor.execute(f"SELECT * FROM albums WHERE id = '{safe_id}'")
            album = cursor.fetchone()
            
            if not album:
                send_telegram_message(chat_id, '❌ Альбом не найден')
                return {'ok': True}
            
            tracks = get_tracks(cursor, album_id)
            
            msg = f'🎼 <b>{album["title"]}</b>\n'
            msg += f'👤 {album["artist"]}\n'
            msg += f'💰 Цена альбома: {album["price"]} ₽\n\n'
            
            if album.get('description'):
                msg += f'📝 {album["description"]}\n\n'
            
            msg += '<b>Треки:</b>\n'
            
            keyboard = {'inline_keyboard': []}
            
            for idx, track in enumerate(tracks, 1):
                msg += f'{idx}. {track["title"]} - {track["duration"]} ({track["price"]} ₽)\n'
                keyboard['inline_keyboard'].append([
                    {'text': f'🎵 Купить "{track["title"]}"', 'callback_data': f'buy_track_{track["id"]}'}
                ])
            
            keyboard['inline_keyboard'].append([
                {'text': f'💿 Купить весь альбом ({album["price"]} ₽)', 'callback_data': f'buy_album_{album_id}'}
            ])
            keyboard['inline_keyboard'].append([
                {'text': '« Назад к каталогу', 'callback_data': 'catalog'}
            ])
            
            send_telegram_message(chat_id, msg, keyboard)
            
        elif data.startswith('buy_track_'):
            track_id = data.replace('buy_track_', '')
            safe_id = track_id.replace("'", "''")
            cursor.execute(f"SELECT t.*, a.title as album_title FROM tracks t JOIN albums a ON t.album_id = a.id WHERE t.id = '{safe_id}'")
            track = cursor.fetchone()
            
            if not track:
                send_telegram_message(chat_id, '❌ Трек не найден')
                return {'ok': True}
            
            items = [{
                'type': 'track',
                'id': track['id'],
                'title': track['title'],
                'album': track['album_title'],
                'price': track['price']
            }]
            
            order_id = create_order(cursor, conn, user['id'], user.get('username', ''), user.get('first_name', ''), items, track['price'])
            
            msg = f'''✅ <b>Заказ создан!</b>

Номер заказа: <code>{order_id}</code>

🎵 Трек: {track['title']}
💿 Альбом: {track['album_title']}
💰 Сумма: {track['price']} ₽

Для оплаты свяжитесь с администратором'''
            
            keyboard = {'inline_keyboard': [[
                {'text': '« Назад к каталогу', 'callback_data': 'catalog'}
            ]]}
            
            send_telegram_message(chat_id, msg, keyboard)
            
        elif data.startswith('buy_album_'):
            album_id = data.replace('buy_album_', '')
            safe_id = album_id.replace("'", "''")
            cursor.execute(f"SELECT * FROM albums WHERE id = '{safe_id}'")
            album = cursor.fetchone()
            
            if not album:
                send_telegram_message(chat_id, '❌ Альбом не найден')
                return {'ok': True}
            
            items = [{
                'type': 'album',
                'id': album['id'],
                'title': album['title'],
                'artist': album['artist'],
                'price': album['price']
            }]
            
            order_id = create_order(cursor, conn, user['id'], user.get('username', ''), user.get('first_name', ''), items, album['price'])
            
            msg = f'''✅ <b>Заказ создан!</b>

Номер заказа: <code>{order_id}</code>

💿 Альбом: {album['title']}
👤 Исполнитель: {album['artist']}
💰 Сумма: {album['price']} ₽

Для оплаты свяжитесь с администратором'''
            
            keyboard = {'inline_keyboard': [[
                {'text': '« Назад к каталогу', 'callback_data': 'catalog'}
            ]]}
            
            send_telegram_message(chat_id, msg, keyboard)
    
    return {'ok': True}

def create_web_order(cursor, conn, data: Dict) -> Dict:
    order_id = f'order_{int(datetime.now().timestamp() * 1000)}'
    name = data.get('name', '').replace("'", "''")
    telegram = data.get('telegram', '').replace("'", "''")
    email = data.get('email', '').replace("'", "''")
    items = data.get('items', [])
    total = data.get('total', 0)
    
    items_json = json.dumps(items, ensure_ascii=False).replace("'", "''")
    
    cursor.execute(f'''
        INSERT INTO orders (id, user_id, username, first_name, items, total_price, status, telegram_username, contact_info)
        VALUES ('{order_id}', 0, '{telegram}', '{name}', '{items_json}', {total}, 'pending', '{telegram}', '{email}')
    ''')
    conn.commit()
    
    msg = f'''✅ <b>Новый заказ с сайта!</b>

Номер заказа: <code>{order_id}</code>
👤 Покупатель: {name}
📱 Telegram: @{telegram}

<b>Заказ:</b>
'''
    
    for item in items:
        msg += f'• {item.get("title")} '
        if item.get('quantity', 1) > 1:
            msg += f'x{item.get("quantity")} '
        msg += f'({item.get("price")} ₽)\n'
    
    msg += f'\n💰 <b>Итого: {total} ₽</b>\n\n'
    msg += 'Свяжитесь с покупателем для уточнения деталей оплаты.'
    
    try:
        import urllib.request
        import urllib.parse
        
        token = os.environ.get('TELEGRAM_BOT_TOKEN')
        owner_chat_id = os.environ.get('TELEGRAM_OWNER_CHAT_ID')
        
        if token and owner_chat_id:
            url = f'https://api.telegram.org/bot{token}/sendMessage'
            data_to_send = {
                'chat_id': owner_chat_id,
                'text': msg,
                'parse_mode': 'HTML'
            }
            
            req = urllib.request.Request(
                url,
                data=json.dumps(data_to_send).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            
            with urllib.request.urlopen(req) as response:
                response_data = json.loads(response.read().decode('utf-8'))
                print(f'[DEBUG] Notification sent to owner: {response_data}')
        else:
            print(f'[WARN] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_CHAT_ID')
    except Exception as e:
        print(f'[WARN] Failed to send Telegram notification: {e}')
        import traceback
        print(f'[ERROR] Traceback: {traceback.format_exc()}')
    
    return {
        'success': True,
        'order_id': order_id,
        'message': 'Заказ успешно создан!'
    }