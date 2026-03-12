'''
Управление альбомами и треками для админ-панели сайта.
Args: event с httpMethod, body, headers (X-Authorization с admin_-токеном); context с request_id
Returns: HTTP-ответ с данными альбомов/треков или результатом операции
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p39135821_musician_site_projec'
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data, status=200):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', **CORS}, 'body': json.dumps(data, default=str)}

def err(msg, status=400):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', **CORS}, 'body': json.dumps({'error': msg})}

def is_admin(token):
    return token and token.startswith('admin_')

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers', {})
    token = headers.get('X-Authorization') or headers.get('x-authorization')
    params = event.get('queryStringParameters') or {}
    path = params.get('path', '')

    # POST /track/play — публичный, без авторизации
    if method == 'POST' and path == 'track/play':
        body = json.loads(event.get('body', '{}'))
        track_id = body.get('track_id')
        if not track_id:
            return err('track_id required')
        conn = get_db()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                tid = str(track_id).replace("'", "''")
                cur.execute(f'''
                    INSERT INTO {SCHEMA}.track_stats (track_id, plays_count, last_played_at, created_at, updated_at)
                    VALUES ('{tid}', 1, NOW(), NOW(), NOW())
                    ON CONFLICT (track_id)
                    DO UPDATE SET plays_count = {SCHEMA}.track_stats.plays_count + 1,
                                  last_played_at = NOW(), updated_at = NOW()
                    RETURNING plays_count
                ''')
                result = cur.fetchone()
                conn.commit()
                return ok({'plays_count': result['plays_count']})
        finally:
            conn.close()

    # GET /albums — публичный список всех альбомов
    if method == 'GET' and path == 'albums':
        conn = get_db()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f'''
                    SELECT id, title, cover, price, created_at, artist, description
                    FROM {SCHEMA}.albums
                    ORDER BY created_at DESC
                ''')
                return ok([dict(a) for a in cur.fetchall()])
        finally:
            conn.close()

    # GET /tracks — публичный список треков альбома
    if method == 'GET' and path == 'tracks':
        album_id = params.get('album_id')
        if not album_id:
            return err('album_id required')
        conn = get_db()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                aid = album_id.replace("'", "''")
                cur.execute(f'''
                    SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                           t.label, t.genre, t.album_id, t.created_at,
                           COALESCE(ts.plays_count, 0) as plays_count
                    FROM {SCHEMA}.tracks t
                    LEFT JOIN {SCHEMA}.track_stats ts ON t.id = ts.track_id
                    WHERE t.album_id = '{aid}'
                    ORDER BY t.track_order ASC, t.created_at ASC
                ''')
                return ok([dict(t) for t in cur.fetchall()])
        finally:
            conn.close()

    # GET /tracks/top — публичный топ треков
    if method == 'GET' and path == 'tracks/top':
        limit = min(int(params.get('limit', 10)), 50)
        conn = get_db()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f'''
                    SELECT t.id, t.title, t.duration, t.file, t.price, t.cover,
                           t.label, t.genre, t.album_id, t.created_at,
                           COALESCE(ts.plays_count, 0) as plays_count,
                           a.title as album_title
                    FROM {SCHEMA}.tracks t
                    LEFT JOIN {SCHEMA}.track_stats ts ON t.id = ts.track_id
                    LEFT JOIN {SCHEMA}.albums a ON t.album_id = a.id
                    ORDER BY COALESCE(ts.plays_count, 0) DESC, t.created_at DESC
                    LIMIT {limit}
                ''')
                return ok([dict(t) for t in cur.fetchall()])
        finally:
            conn.close()

    # Всё остальное требует admin-токена
    if not is_admin(token):
        return err('Admin authentication required', 401)

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            # POST /albums — создать альбом
            if method == 'POST' and path == 'albums':
                body = json.loads(event.get('body', '{}'))
                title = body.get('title', '').replace("'", "''")
                artist = body.get('artist', '').replace("'", "''")
                cover = body.get('cover_url', body.get('cover', '')).replace("'", "''")
                price = float(body.get('price', 0))
                description = body.get('description', '').replace("'", "''")
                if not title:
                    return err('title required')
                cur.execute(f'''
                    INSERT INTO {SCHEMA}.albums (id, title, artist, cover, price, description, created_at)
                    VALUES (gen_random_uuid()::text, '{title}', '{artist}', '{cover}', {price}, '{description}', NOW())
                    RETURNING id, title, artist, cover, price, description, created_at
                ''')
                conn.commit()
                return ok(dict(cur.fetchone()), 201)

            # PUT /albums?id=... — обновить альбом
            if method == 'PUT' and path == 'albums':
                album_id = params.get('id', '').replace("'", "''")
                if not album_id:
                    return err('id required')
                body = json.loads(event.get('body', '{}'))
                updates = []
                for field, col in [('title','title'),('artist','artist'),('cover_url','cover'),('cover','cover'),('description','description')]:
                    if field in body:
                        val = body[field].replace("'", "''")
                        updates.append(f"{col} = '{val}'")
                if 'price' in body:
                    updates.append(f"price = {float(body['price'])}")
                if not updates:
                    return err('no fields to update')
                cur.execute(f'''
                    UPDATE {SCHEMA}.albums SET {', '.join(updates)}
                    WHERE id = '{album_id}'
                    RETURNING id, title, artist, cover, price, description, created_at
                ''')
                row = cur.fetchone()
                if not row:
                    return err('album not found', 404)
                conn.commit()
                return ok(dict(row))

            # DELETE /albums?id=... — удалить альбом
            if method == 'DELETE' and path == 'albums':
                album_id = params.get('id', '').replace("'", "''")
                if not album_id:
                    return err('id required')
                cur.execute(f"DELETE FROM {SCHEMA}.albums WHERE id = '{album_id}'")
                if cur.rowcount == 0:
                    return err('album not found', 404)
                conn.commit()
                return ok({'message': 'deleted'})

            # POST /tracks — создать трек
            if method == 'POST' and path == 'tracks':
                body = json.loads(event.get('body', '{}'))
                album_id = body.get('album_id', '').replace("'", "''")
                title = body.get('title', '').replace("'", "''")
                duration = str(body.get('duration', '')).replace("'", "''")
                file_ = body.get('file', body.get('file_url', '')).replace("'", "''")
                cover = body.get('cover', body.get('cover_url', '')).replace("'", "''")
                price = float(body.get('price', 0))
                label = body.get('label', '').replace("'", "''")
                genre = body.get('genre', '').replace("'", "''")
                if not title or not album_id:
                    return err('title and album_id required')
                cur.execute(f'''
                    INSERT INTO {SCHEMA}.tracks (id, album_id, title, duration, file, cover, price, label, genre, created_at)
                    VALUES (gen_random_uuid()::text, '{album_id}', '{title}', '{duration}', '{file_}', '{cover}', {price}, '{label}', '{genre}', NOW())
                    RETURNING id, album_id, title, duration, file, cover, price, label, genre, created_at
                ''')
                conn.commit()
                return ok(dict(cur.fetchone()), 201)

            # PUT /tracks?id=... — обновить трек
            if method == 'PUT' and path == 'tracks':
                track_id = params.get('id', '').replace("'", "''")
                if not track_id:
                    return err('id required')
                body = json.loads(event.get('body', '{}'))
                updates = []
                for field, col in [('title','title'),('duration','duration'),('file','file'),('file_url','file'),('cover','cover'),('cover_url','cover'),('label','label'),('genre','genre')]:
                    if field in body:
                        val = str(body[field]).replace("'", "''")
                        updates.append(f"{col} = '{val}'")
                if 'price' in body:
                    updates.append(f"price = {float(body['price'])}")
                if 'track_order' in body:
                    updates.append(f"track_order = {int(body['track_order'])}")
                if not updates:
                    return err('no fields to update')
                cur.execute(f'''
                    UPDATE {SCHEMA}.tracks SET {', '.join(updates)}
                    WHERE id = '{track_id}'
                    RETURNING id, album_id, title, duration, file, cover, price, label, genre, created_at
                ''')
                row = cur.fetchone()
                if not row:
                    return err('track not found', 404)
                conn.commit()
                return ok(dict(row))

            # DELETE /tracks?id=... — удалить трек
            if method == 'DELETE' and path == 'tracks':
                track_id = params.get('id', '').replace("'", "''")
                if not track_id:
                    return err('id required')
                cur.execute(f"DELETE FROM {SCHEMA}.tracks WHERE id = '{track_id}'")
                if cur.rowcount == 0:
                    return err('track not found', 404)
                conn.commit()
                return ok({'message': 'deleted'})

            # DELETE /stats/reset — сбросить статистику
            if method == 'DELETE' and path == 'stats/reset':
                cur.execute(f'TRUNCATE TABLE {SCHEMA}.track_stats')
                conn.commit()
                return ok({'message': 'stats reset'})

            return err('not found', 404)
    finally:
        conn.close()
