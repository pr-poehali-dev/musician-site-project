'''
Business: API для управления музыкальной библиотекой (альбомы, треки, статистика, блог)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с request_id, function_name, memory_limit_in_mb
Returns: HTTP response dict с альбомами, треками, статистикой или постами блога
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

def upload_to_s3(file_content: bytes, key: str, content_type: str) -> str:
    import boto3
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=file_content,
        ContentType=content_type,
        CacheControl='public, max-age=31536000',
        Metadata={
            'Access-Control-Allow-Origin': '*'
        }
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return cdn_url

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
        
        if path.startswith('blog/'):
            result = handle_blog(cursor, conn, event, method, path)
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result, default=str)
            }
        
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
            if path == 'migrate-to-s3':
                result = migrate_audio_to_s3(cursor, conn)
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps(result, default=str)
                }
            elif path == 'convert-urls':
                result = convert_urls_to_base64(cursor, conn)
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps(result, default=str)
                }
            elif path == 'albums':
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
            elif path == 'track-stream':
                file_key = event.get('queryStringParameters', {}).get('file_key')
                if not file_key:
                    return error_response('File key is required', 400)
                
                media_file_id = file_key
                if not file_key.startswith('audio_'):
                    safe_track_id = file_key.replace("'", "''")
                    cursor.execute(f"SELECT file FROM tracks WHERE id = '{safe_track_id}'")
                    track_result = cursor.fetchone()
                    if not track_result or not track_result.get('file'):
                        return error_response('Track not found', 404)
                    media_file_id = track_result['file']
                
                safe_key = media_file_id.replace("'", "''")
                cursor.execute(f"SELECT data, file_type FROM media_files WHERE id = '{safe_key}'")
                result = cursor.fetchone()
                
                if not result or not result.get('data'):
                    return error_response('Audio file not found', 404)
                
                audio_data = result['data']
                
                if audio_data.startswith('https://cdn.poehali.dev/'):
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'url': audio_data, 'type': 'redirect'})
                    }
                
                if audio_data.startswith('data:audio/'):
                    audio_data = audio_data.split(',', 1)[1]
                
                cursor.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'audio/mpeg',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=31536000'
                    },
                    'isBase64Encoded': True,
                    'body': audio_data
                }
            elif path == 'stats':
                track_id = event.get('queryStringParameters', {}).get('track_id')
                result = get_stats(cursor, track_id)
            elif path == 'tracks/top':
                username = event.get('queryStringParameters', {}).get('username')
                limit = int(event.get('queryStringParameters', {}).get('limit', 5))
                result = get_top_tracks(cursor, username, limit)
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
                
                if data.startswith('http://') or data.startswith('https://'):
                    import urllib.request
                    print(f'[DEBUG] Downloading media from Yandex.Disk: {data[:100]}...')
                    try:
                        req = urllib.request.Request(data, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=45) as response:
                            file_content = response.read()
                            print(f'[DEBUG] Downloaded {len(file_content)} bytes, uploading to S3...')
                            
                            s3_key = f'audio/{media_id}.mp3'
                            s3_url = upload_to_s3(file_content, s3_key, 'audio/mpeg')
                            print(f'[DEBUG] Uploaded to S3: {s3_url}')
                            
                            data = s3_url
                    except Exception as e:
                        print(f'[ERROR] Failed to download/upload media: {str(e)}')
                        cursor.close()
                        conn.close()
                        return error_response(f'Не удалось загрузить файл: {str(e)}', 502)
                
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

def handle_blog(cursor, conn, event: Dict[str, Any], method: str, path: str) -> Dict[str, Any]:
    post_id = event.get('queryStringParameters', {}).get('id')
    
    if method == 'GET' and path == 'blog/posts':
        cursor.execute('''
            SELECT id, title, content, author, created_at, updated_at
            FROM blog_posts
            ORDER BY created_at DESC
        ''')
        posts = cursor.fetchall()
        return {'posts': posts}
    
    elif method == 'POST' and path == 'blog/posts':
        body = json.loads(event.get('body', '{}'))
        title = body.get('title')
        content = body.get('content')
        author = body.get('author', 'Дмитрий Шмелидзэ')
        
        if not title or not content:
            raise Exception('Title and content are required')
        
        post_id = str(int(datetime.now().timestamp() * 1000))
        cursor.execute('''
            INSERT INTO blog_posts (id, title, content, author)
            VALUES (%s, %s, %s, %s)
        ''', (post_id, title, content, author))
        conn.commit()
        
        return {'success': True, 'post_id': post_id}
    
    elif method == 'PUT' and path == 'blog/posts':
        if not post_id:
            raise Exception('Post ID is required')
        
        body = json.loads(event.get('body', '{}'))
        title = body.get('title')
        content = body.get('content')
        
        if not title or not content:
            raise Exception('Title and content are required')
        
        cursor.execute('''
            UPDATE blog_posts
            SET title = %s, content = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (title, content, post_id))
        conn.commit()
        
        return {'success': True}
    
    elif method == 'DELETE' and path == 'blog/posts':
        if not post_id:
            raise Exception('Post ID is required')
        
        cursor.execute('DELETE FROM blog_posts WHERE id = %s', (post_id,))
        conn.commit()
        
        return {'success': True}
    
    else:
        raise Exception('Invalid blog path or method')

def get_albums(cursor) -> List[Dict]:
    print('[DEBUG] Getting albums...')
    cursor.execute('''
        SELECT a.id, a.title, a.artist, a.cover, a.price, a.description, a.year, a.created_at, a.updated_at,
               COUNT(t.id) as tracks_count
        FROM albums a
        LEFT JOIN tracks t ON a.id = t.album_id
        GROUP BY a.id, a.title, a.artist, a.cover, a.price, a.description, a.year, a.created_at, a.updated_at
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
    
    # Возвращаем только file_ref (ID медиафайла), не загружаем сам base64
    # Frontend должен использовать track-stream для получения аудио
    return {'file': file_ref}

def get_media_file(cursor, media_id: str) -> Optional[Dict]:
    safe_id = media_id.replace("'", "''")
    cursor.execute(f"SELECT * FROM media_files WHERE id = '{safe_id}'")
    return cursor.fetchone()

def get_cdn_url(file_key: str) -> str:
    aws_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    return f"https://cdn.poehali.dev/projects/{aws_key}/bucket/{file_key}.mp3"

def get_top_tracks(cursor, username: Optional[str] = None, limit: int = 5) -> List[Dict]:
    if username:
        safe_username = username.replace("'", "''")
        cursor.execute(f'''
            SELECT 
                t.id,
                t.title,
                t.duration,
                t.price,
                COALESCE(ts.plays_count, 0) as plays_count,
                t.album_id,
                a.title as album_title,
                u.username,
                ap.display_name,
                a.cover
            FROM tracks t
            LEFT JOIN track_stats ts ON t.id = ts.track_id
            LEFT JOIN albums a ON t.album_id = a.id
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN artist_profiles ap ON u.id = ap.user_id
            WHERE u.username = '{safe_username}'
            ORDER BY COALESCE(ts.plays_count, 0) DESC
            LIMIT {limit}
        ''')
    else:
        cursor.execute(f'''
            SELECT 
                t.id,
                t.title,
                t.duration,
                t.price,
                COALESCE(ts.plays_count, 0) as plays_count,
                t.album_id,
                a.title as album_title,
                u.username,
                ap.display_name,
                a.cover
            FROM tracks t
            LEFT JOIN track_stats ts ON t.id = ts.track_id
            LEFT JOIN albums a ON t.album_id = a.id
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN artist_profiles ap ON u.id = ap.user_id
            ORDER BY COALESCE(ts.plays_count, 0) DESC
            LIMIT {limit}
        ''')
    
    return cursor.fetchall()

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
    year = data.get('year')
    now = datetime.now().isoformat()
    
    print(f'[DEBUG] Album fields - id: {album_id}, title: {title}, artist: {artist}')
    
    cover_id = None
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{album_id}"
        print(f'[DEBUG] Saving cover image with id: {cover_id}')
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    
    print(f'[DEBUG] Inserting album into database...')
    cover_value = f"'{cover_id}'" if cover_id else 'NULL'
    year_value = str(year) if year else 'NULL'
    cursor.execute(f'''
        INSERT INTO albums (id, title, artist, cover, price, description, year, tracks_count, created_at, user_id)
        VALUES ('{album_id}', '{title}', '{artist}', {cover_value}, {price}, '{description}', {year_value}, 0, '{now}', NULL)
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
    if file_data:
        if file_data.startswith('http://') or file_data.startswith('https://'):
            import urllib.request
            import base64
            print(f'[DEBUG] Downloading audio from Yandex.Disk: {file_data[:100]}...')
            try:
                req = urllib.request.Request(file_data, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=45) as response:
                    file_content = response.read()
                    print(f'[DEBUG] Downloaded {len(file_content)} bytes')
                    audio_data_b64 = base64.b64encode(file_content).decode('utf-8')
                    file_id = f"audio_{track_id}"
                    save_media_file(cursor, conn, file_id, 'audio', audio_data_b64)
                    print(f'[DEBUG] Audio cached as base64 in media_files')
            except Exception as e:
                print(f'[ERROR] Failed to download audio during track creation: {str(e)}')
                raise Exception(f'Не удалось загрузить аудиофайл с Яндекс.Диска: {str(e)}')
        elif file_data.startswith('data:'):
            file_id = f"audio_{track_id}"
            save_media_file(cursor, conn, file_id, 'audio', file_data)
        else:
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
    year = data.get('year')
    now = datetime.now().isoformat()
    
    cover_id = None
    if cover_data and len(cover_data) > 100:
        cover_id = f"cover_{album_id}"
        save_media_file(cursor, conn, cover_id, 'image', cover_data)
    elif cover_data and len(cover_data) > 0 and len(cover_data) < 100:
        cover_id = cover_data
    
    cover_value = f"'{cover_id}'" if cover_id else 'NULL'
    year_value = str(year) if year else 'NULL'
    cursor.execute(f'''
        UPDATE albums 
        SET title = '{title}', artist = '{artist}', cover = {cover_value}, price = {price}, description = '{description}', year = {year_value}, updated_at = '{now}'
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
    if file_data:
        if file_data.startswith('http://') or file_data.startswith('https://'):
            import urllib.request
            import base64
            print(f'[DEBUG] Downloading audio from Yandex.Disk: {file_data[:100]}...')
            try:
                req = urllib.request.Request(file_data, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=45) as response:
                    file_content = response.read()
                    print(f'[DEBUG] Downloaded {len(file_content)} bytes')
                    audio_data_b64 = base64.b64encode(file_content).decode('utf-8')
                    file_id = f"audio_{track_id}"
                    save_media_file(cursor, conn, file_id, 'audio', audio_data_b64)
                    print(f'[DEBUG] Audio cached as base64 in media_files')
            except Exception as e:
                print(f'[ERROR] Failed to download audio during track update: {str(e)}')
                raise Exception(f'Не удалось загрузить аудиофайл с Яндекс.Диска: {str(e)}')
        elif file_data.startswith('data:'):
            file_id = f"audio_{track_id}"
            save_media_file(cursor, conn, file_id, 'audio', file_data)
        else:
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

def migrate_audio_to_s3(cursor, conn) -> Dict:
    import base64
    
    cursor.execute("SELECT id, data FROM media_files WHERE file_type = 'audio' AND data NOT LIKE 'https://cdn.poehali.dev/%' LIMIT 5")
    audio_files = cursor.fetchall()
    
    migrated = 0
    failed = []
    
    for file_record in audio_files:
        file_id = file_record['id']
        base64_data = file_record['data']
        
        try:
            print(f'[DEBUG] Migrating {file_id} to S3...')
            
            if base64_data.startswith('data:audio/'):
                base64_data = base64_data.split(',', 1)[1]
            
            file_content = base64.b64decode(base64_data)
            print(f'[DEBUG] Decoded {len(file_content)} bytes')
            
            s3_key = f'audio/{file_id}.mp3'
            s3_url = upload_to_s3(file_content, s3_key, 'audio/mpeg')
            print(f'[DEBUG] Uploaded to S3: {s3_url}')
            
            safe_id = file_id.replace("'", "''")
            safe_url = s3_url.replace("'", "''")
            cursor.execute(f"UPDATE media_files SET data = '{safe_url}' WHERE id = '{safe_id}'")
            conn.commit()
            
            migrated += 1
            print(f'[DEBUG] ✓ Migrated {file_id} to S3')
        except Exception as e:
            print(f'[ERROR] Failed to migrate {file_id}: {str(e)}')
            failed.append({'id': file_id, 'error': str(e)})
            import traceback
            print(traceback.format_exc())
    
    return {
        'success': True,
        'migrated': migrated,
        'failed': len(failed),
        'failed_files': failed,
        'remaining': 'call again to migrate more files'
    }

def convert_urls_to_base64(cursor, conn) -> Dict:
    import urllib.request
    import base64
    
    cursor.execute("SELECT id, data FROM media_files WHERE file_type = 'audio' AND data LIKE 'http%'")
    url_files = cursor.fetchall()
    
    converted = 0
    failed = []
    
    for file_record in url_files:
        file_id = file_record['id']
        url = file_record['data']
        
        try:
            print(f'[DEBUG] Converting {file_id}: {url[:100]}...')
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=45) as response:
                file_content = response.read()
                audio_data_b64 = base64.b64encode(file_content).decode('utf-8')
                safe_id = file_id.replace("'", "''")
                cursor.execute(f"UPDATE media_files SET data = '{audio_data_b64.replace(chr(39), chr(39)*2)}' WHERE id = '{safe_id}'")
                conn.commit()
                converted += 1
                print(f'[DEBUG] ✓ Converted {file_id} ({len(file_content)} bytes)')
        except Exception as e:
            print(f'[ERROR] Failed to convert {file_id}: {str(e)}')
            failed.append({'id': file_id, 'error': str(e)})
    
    return {
        'success': True,
        'converted': converted,
        'failed': len(failed),
        'failed_files': failed
    }