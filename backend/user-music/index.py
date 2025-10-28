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
            token_escaped = token.replace("'", "''")
            cur.execute(f'''
                SELECT user_id FROM sessions 
                WHERE token = '{token_escaped}' AND expires_at > NOW()
            ''')
            result = cur.fetchone()
            return result['user_id'] if result else None
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    print(f'[DEBUG] Method: {method}, Headers: {event.get("headers", {})}')
    
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
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    path = event.get('queryStringParameters', {}).get('path', '')
    
    print(f'[DEBUG] Token: {token[:20] if token else "NONE"}..., Path: {path}')
    
    # POST /admin-login - Простая авторизация админки по паролю
    if method == 'POST' and path == 'admin-login':
        body = json.loads(event.get('body', '{}'))
        password = body.get('password')
        
        ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'music2025admin')
        
        if password == ADMIN_PASSWORD:
            import secrets
            admin_token = secrets.token_urlsafe(32)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'token': admin_token, 'role': 'admin'})
            }
        else:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный пароль'})
            }
    
    if not token and method != 'GET':
        print('[DEBUG] No token for non-GET request - returning 401')
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    user_id = verify_session(token) if token else None
    print(f'[DEBUG] User ID from token: {user_id}')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # GET /profile?username=... - Получить профиль артиста
            if method == 'GET' and path == 'profile':
                username = event.get('queryStringParameters', {}).get('username')
                
                if not username:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Username required'})
                    }
                
                username_escaped = username.replace("'", "''")
                cur.execute(f'''
                    SELECT u.username, u.display_name, u.avatar_url, u.bio,
                           ap.bio as profile_bio, ap.banner_url, ap.social_links, ap.is_public
                    FROM users u
                    LEFT JOIN artist_profiles ap ON u.id = ap.user_id
                    WHERE u.username = '{username_escaped}'
                ''')
                
                profile = cur.fetchone()
                if not profile:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Artist not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(profile), default=str)
                }
            
            # GET /albums?username=... - Получить альбомы пользователя
            if method == 'GET' and path == 'albums':
                username = event.get('queryStringParameters', {}).get('username')
                
                if username:
                    username_escaped = username.replace("'", "''")
                    cur.execute(f'''
                        SELECT a.id, a.title, a.cover, a.price, a.created_at,
                               a.artist, a.description
                        FROM t_p39135821_musician_site_projec.albums a
                        WHERE a.artist = '{username_escaped}'
                        ORDER BY a.created_at DESC
                    ''')
                elif user_id:
                    cur.execute(f'''
                        SELECT id, title, cover, price, created_at, artist, description
                        FROM t_p39135821_musician_site_projec.albums
                        WHERE user_id = {int(user_id)}
                        ORDER BY created_at DESC
                    ''')
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
                    album_id_escaped = album_id.replace("'", "''")
                    cur.execute(f'''
                        SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                               t.label, t.genre, t.album_id, t.created_at, u.username, u.display_name,
                               COALESCE(ts.plays_count, 0) as plays_count
                        FROM t_p39135821_musician_site_projec.tracks t
                        JOIN t_p39135821_musician_site_projec.users u ON t.user_id = u.id
                        LEFT JOIN t_p39135821_musician_site_projec.track_stats ts ON t.id = ts.track_id
                        WHERE t.album_id = '{album_id_escaped}'
                        ORDER BY t.track_order ASC, t.created_at ASC
                    ''')
                elif username:
                    username_escaped = username.replace("'", "''")
                    cur.execute(f'''
                        SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                               t.label, t.genre, t.album_id, t.created_at,
                               COALESCE(ts.plays_count, 0) as plays_count
                        FROM t_p39135821_musician_site_projec.tracks t
                        JOIN t_p39135821_musician_site_projec.users u ON t.user_id = u.id
                        LEFT JOIN t_p39135821_musician_site_projec.track_stats ts ON t.id = ts.track_id
                        WHERE u.username = '{username_escaped}'
                        ORDER BY t.created_at DESC
                    ''')
                elif user_id:
                    cur.execute(f'''
                        SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                               t.label, t.genre, t.album_id, t.created_at,
                               COALESCE(ts.plays_count, 0) as plays_count
                        FROM t_p39135821_musician_site_projec.tracks t
                        LEFT JOIN t_p39135821_musician_site_projec.track_stats ts ON t.id = ts.track_id
                        WHERE t.user_id = {int(user_id)}
                        ORDER BY t.created_at DESC
                    ''')
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
            
            # GET /tracks/top?limit=10 - Получить топ треков по прослушиваниям
            if method == 'GET' and path == 'tracks/top':
                limit = int(event.get('queryStringParameters', {}).get('limit', 10))
                username = event.get('queryStringParameters', {}).get('username')
                
                if username:
                    username_escaped = username.replace("'", "''")
                    cur.execute(f'''
                        SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                               t.label, t.genre, t.album_id, t.created_at,
                               COALESCE(ts.plays_count, 0) as plays_count,
                               u.username, u.display_name,
                               a.title as album_title
                        FROM t_p39135821_musician_site_projec.tracks t
                        LEFT JOIN t_p39135821_musician_site_projec.users u ON t.user_id = u.id
                        LEFT JOIN t_p39135821_musician_site_projec.track_stats ts ON t.id = ts.track_id
                        LEFT JOIN t_p39135821_musician_site_projec.albums a ON t.album_id = a.id
                        WHERE u.username = '{username_escaped}'
                        ORDER BY COALESCE(ts.plays_count, 0) DESC, t.created_at DESC
                        LIMIT {int(limit)}
                    ''')
                else:
                    cur.execute(f'''
                        SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                               t.label, t.genre, t.album_id, t.created_at,
                               COALESCE(ts.plays_count, 0) as plays_count,
                               u.username, u.display_name,
                               a.title as album_title
                        FROM t_p39135821_musician_site_projec.tracks t
                        LEFT JOIN t_p39135821_musician_site_projec.users u ON t.user_id = u.id
                        LEFT JOIN t_p39135821_musician_site_projec.track_stats ts ON t.id = ts.track_id
                        LEFT JOIN t_p39135821_musician_site_projec.albums a ON t.album_id = a.id
                        ORDER BY COALESCE(ts.plays_count, 0) DESC, t.created_at DESC
                        LIMIT {int(limit)}
                    ''')
                
                tracks = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(t) for t in tracks], default=str)
                }
            
            # POST /track/play - Увеличить счётчик прослушиваний
            if method == 'POST' and path == 'track/play':
                body = json.loads(event.get('body', '{}'))
                track_id = body.get('track_id')
                
                if not track_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'track_id is required'})
                    }
                
                track_id_escaped = str(track_id).replace("'", "''")
                cur.execute(f'''
                    INSERT INTO t_p39135821_musician_site_projec.track_stats 
                    (track_id, plays_count, last_played_at, created_at, updated_at)
                    VALUES ('{track_id_escaped}', 1, NOW(), NOW(), NOW())
                    ON CONFLICT (track_id) 
                    DO UPDATE SET 
                        plays_count = t_p39135821_musician_site_projec.track_stats.plays_count + 1,
                        last_played_at = NOW(),
                        updated_at = NOW()
                    RETURNING plays_count
                ''')
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'plays_count': result['plays_count']})
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
                artist = body.get('artist', '')
                cover = body.get('cover_url', '')
                price = body.get('price', 0)
                description = body.get('description', '')
                
                if not title:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Title is required'})
                    }
                
                title_escaped = title.replace("'", "''")
                artist_escaped = artist.replace("'", "''")
                cover_escaped = cover.replace("'", "''")
                description_escaped = description.replace("'", "''")
                cur.execute(f'''
                    INSERT INTO t_p39135821_musician_site_projec.albums 
                    (id, user_id, title, artist, cover, price, description, created_at)
                    VALUES (gen_random_uuid()::text, {int(user_id)}, '{title_escaped}', '{artist_escaped}', '{cover_escaped}', {float(price)}, '{description_escaped}', NOW())
                    RETURNING id, title, artist, cover, price, description, created_at
                ''')
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
                duration = body.get('duration', '0:00')
                file = body.get('file_url', '')
                cover = body.get('cover', '')
                price = body.get('price', 129)
                label = body.get('label', '')
                genre = body.get('genre', '')
                
                if not title or not album_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Title and album_id are required'})
                    }
                
                album_id_escaped = album_id.replace("'", "''")
                cur.execute(f"SELECT id FROM t_p39135821_musician_site_projec.albums WHERE id = '{album_id_escaped}' AND user_id = {int(user_id)}")
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album not found or access denied'})
                    }
                
                title_escaped = title.replace("'", "''")
                duration_escaped = duration.replace("'", "''")
                file_escaped = file.replace("'", "''")
                cover_escaped = cover.replace("'", "''")
                label_escaped = label.replace("'", "''")
                genre_escaped = genre.replace("'", "''")
                cur.execute(f'''
                    INSERT INTO t_p39135821_musician_site_projec.tracks 
                    (id, user_id, album_id, title, duration, file, cover, price, label, genre, created_at)
                    VALUES (gen_random_uuid()::text, {int(user_id)}, '{album_id_escaped}', '{title_escaped}', '{duration_escaped}', '{file_escaped}', '{cover_escaped}', {float(price)}, '{label_escaped}', '{genre_escaped}', NOW())
                    RETURNING id, title, duration, file, cover, price, label, genre, album_id, created_at
                ''')
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
                
                album_id_escaped = album_id.replace("'", "''")
                cur.execute(f"SELECT id FROM albums WHERE id = '{album_id_escaped}' AND user_id = {int(user_id)}")
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Album not found or access denied'})
                    }
                
                updates = []
                if 'title' in body:
                    title_escaped = body['title'].replace("'", "''")
                    updates.append(f"title = '{title_escaped}'")
                if 'cover_url' in body:
                    cover_url_escaped = body['cover_url'].replace("'", "''")
                    updates.append(f"cover_url = '{cover_url_escaped}'")
                if 'price' in body:
                    updates.append(f"price = {float(body['price'])}")
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                cur.execute(f'''
                    UPDATE albums SET {', '.join(updates)}, updated_at = NOW()
                    WHERE id = '{album_id_escaped}'
                    RETURNING id, title, cover_url, price, created_at, updated_at
                ''')
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
                
                track_id_escaped = track_id.replace("'", "''")
                cur.execute(f"SELECT id FROM tracks WHERE id = '{track_id_escaped}' AND user_id = {int(user_id)}")
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track not found or access denied'})
                    }
                
                updates = []
                if 'title' in body:
                    title_escaped = body['title'].replace("'", "''")
                    updates.append(f"title = '{title_escaped}'")
                if 'duration' in body:
                    duration_escaped = body['duration'].replace("'", "''")
                    updates.append(f"duration = '{duration_escaped}'")
                if 'preview_url' in body:
                    preview_url_escaped = body['preview_url'].replace("'", "''")
                    updates.append(f"preview_url = '{preview_url_escaped}'")
                if 'file_url' in body:
                    file_url_escaped = body['file_url'].replace("'", "''")
                    updates.append(f"file_url = '{file_url_escaped}'")
                if 'price' in body:
                    updates.append(f"price = {float(body['price'])}")
                if 'label' in body:
                    label_escaped = body['label'].replace("'", "''")
                    updates.append(f"label = '{label_escaped}'")
                if 'genre' in body:
                    genre_escaped = body['genre'].replace("'", "''")
                    updates.append(f"genre = '{genre_escaped}'")
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                cur.execute(f'''
                    UPDATE tracks SET {', '.join(updates)}, updated_at = NOW()
                    WHERE id = '{track_id_escaped}'
                    RETURNING id, title, duration, preview_url, file_url, price, label, album_id, created_at, updated_at
                ''')
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
                
                track_id_escaped = track_id.replace("'", "''")
                cur.execute(f"DELETE FROM tracks WHERE id = '{track_id_escaped}' AND user_id = {int(user_id)}")
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
            
            # POST /track-play - Увеличить счётчик прослушиваний
            if method == 'POST' and path == 'track-play':
                body = json.loads(event.get('body', '{}'))
                track_id = body.get('track_id')
                
                if not track_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track ID is required'})
                    }
                
                # Проверяем существование трека
                track_id_escaped = str(track_id).replace("'", "''")
                cur.execute(f"SELECT id FROM tracks WHERE id = '{track_id_escaped}'")
                if not cur.fetchone():
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Track not found'})
                    }
                
                # Создаем запись статистики если её нет, или увеличиваем счётчик
                cur.execute(f'''
                    INSERT INTO track_stats (track_id, plays_count, last_played_at, created_at, updated_at)
                    VALUES ('{track_id_escaped}', 1, NOW(), NOW(), NOW())
                    ON CONFLICT (track_id) 
                    DO UPDATE SET 
                        plays_count = track_stats.plays_count + 1,
                        last_played_at = NOW(),
                        updated_at = NOW()
                    RETURNING plays_count
                ''')
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'plays_count': result['plays_count']})
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
                
                album_id_escaped = album_id.replace("'", "''")
                cur.execute(f"DELETE FROM albums WHERE id = '{album_id_escaped}' AND user_id = {int(user_id)}")
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
            
            # DELETE /stats/reset - Сбросить всю статистику треков
            if method == 'DELETE' and path == 'stats/reset':
                if not user_id:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Authentication required'})
                    }
                
                cur.execute('TRUNCATE TABLE t_p39135821_musician_site_projec.track_stats')
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'All stats reset successfully'})
                }
            
            # PUT /profile - Обновить профиль пользователя
            if method == 'PUT' and path == 'profile':
                if not user_id:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Authentication required'})
                    }
                
                body = json.loads(event.get('body', '{}'))
                
                updates = []
                if 'display_name' in body:
                    display_name_escaped = body['display_name'].replace("'", "''")
                    updates.append(f"display_name = '{display_name_escaped}'")
                if 'bio' in body:
                    bio_escaped = body['bio'].replace("'", "''")
                    updates.append(f"profile_bio = '{bio_escaped}'")
                if 'avatar_url' in body:
                    avatar_url_escaped = body['avatar_url'].replace("'", "''")
                    updates.append(f"avatar_url = '{avatar_url_escaped}'")
                if 'banner_url' in body:
                    banner_url_escaped = body['banner_url'].replace("'", "''")
                    updates.append(f"banner_url = '{banner_url_escaped}'")
                
                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                cur.execute(f'''
                    UPDATE t_p39135821_musician_site_projec.users 
                    SET {', '.join(updates)}
                    WHERE id = {int(user_id)}
                    RETURNING id, username, display_name, avatar_url, banner_url, profile_bio
                ''')
                user = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(user), default=str)
                }
            
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'})
            }
    finally:
        conn.close()