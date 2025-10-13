'''
Business: Telegram бот для продажи музыкальных треков и альбомов
Args: event - dict с httpMethod, body (webhook от Telegram)
      context - object с request_id, function_name
Returns: HTTP response dict для Telegram
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

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

def get_albums(cursor) -> List[Dict]:
    cursor.execute('''
        SELECT 
            a.id,
            a.title,
            a.artist,
            a.price,
            a.description,
            COUNT(t.id) as tracks_count
        FROM albums a
        LEFT JOIN tracks t ON t.album_id = a.id
        GROUP BY a.id, a.title, a.artist, a.price, a.description
        ORDER BY a.created_at DESC
    ''')
    return cursor.fetchall()

def get_album_tracks(cursor, album_id: str) -> List[Dict]:
    safe_id = album_id.replace("'", "''")
    cursor.execute(f'''
        SELECT id, title, duration, price
        FROM tracks
        WHERE album_id = '{safe_id}'
        ORDER BY created_at
    ''')
    return cursor.fetchall()

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

def handle_start_command(chat_id: int, first_name: str):
    text = f'''👋 Привет, <b>{first_name}</b>!

Я бот для покупки музыкальных треков и альбомов.

<b>Команды:</b>
/catalog - Посмотреть каталог альбомов
/help - Помощь
/mycart - Моя корзина'''
    
    send_telegram_message(chat_id, text)

def handle_catalog_command(chat_id: int, cursor):
    albums = get_albums(cursor)
    
    if not albums:
        send_telegram_message(chat_id, '📁 Каталог пуст')
        return
    
    text = '<b>🎵 Каталог альбомов:</b>\n\n'
    
    keyboard = {'inline_keyboard': []}
    
    for album in albums:
        text += f'🎼 <b>{album["title"]}</b>\n'
        text += f'👤 {album["artist"]}\n'
        text += f'💿 Треков: {album["tracks_count"]}\n'
        text += f'💰 {album["price"]} ₽\n\n'
        
        keyboard['inline_keyboard'].append([
            {'text': f'🎧 {album["title"]}', 'callback_data': f'album_{album["id"]}'}
        ])
    
    send_telegram_message(chat_id, text, keyboard)

def handle_album_details(chat_id: int, cursor, album_id: str):
    safe_id = album_id.replace("'", "''")
    cursor.execute(f"SELECT * FROM albums WHERE id = '{safe_id}'")
    album = cursor.fetchone()
    
    if not album:
        send_telegram_message(chat_id, '❌ Альбом не найден')
        return
    
    tracks = get_album_tracks(cursor, album_id)
    
    text = f'🎼 <b>{album["title"]}</b>\n'
    text += f'👤 {album["artist"]}\n'
    text += f'💰 Цена альбома: {album["price"]} ₽\n\n'
    
    if album.get('description'):
        text += f'📝 {album["description"]}\n\n'
    
    text += '<b>Треки:</b>\n'
    
    keyboard = {'inline_keyboard': []}
    
    for idx, track in enumerate(tracks, 1):
        text += f'{idx}. {track["title"]} - {track["duration"]} ({track["price"]} ₽)\n'
        keyboard['inline_keyboard'].append([
            {'text': f'🎵 Купить "{track["title"]}"', 'callback_data': f'buy_track_{track["id"]}'}
        ])
    
    keyboard['inline_keyboard'].append([
        {'text': f'💿 Купить весь альбом ({album["price"]} ₽)', 'callback_data': f'buy_album_{album_id}'}
    ])
    keyboard['inline_keyboard'].append([
        {'text': '« Назад к каталогу', 'callback_data': 'catalog'}
    ])
    
    send_telegram_message(chat_id, text, keyboard)

def handle_buy_track(chat_id: int, cursor, conn, user_id: int, username: str, first_name: str, track_id: str):
    safe_id = track_id.replace("'", "''")
    cursor.execute(f"SELECT t.*, a.title as album_title FROM tracks t JOIN albums a ON t.album_id = a.id WHERE t.id = '{safe_id}'")
    track = cursor.fetchone()
    
    if not track:
        send_telegram_message(chat_id, '❌ Трек не найден')
        return
    
    items = [{
        'type': 'track',
        'id': track['id'],
        'title': track['title'],
        'album': track['album_title'],
        'price': track['price']
    }]
    
    order_id = create_order(cursor, conn, user_id, username, first_name, items, track['price'])
    
    text = f'''✅ <b>Заказ создан!</b>

Номер заказа: <code>{order_id}</code>

🎵 Трек: {track['title']}
💿 Альбом: {track['album_title']}
💰 Сумма: {track['price']} ₽

Для оплаты свяжитесь с администратором: @your_admin'''
    
    keyboard = {'inline_keyboard': [[
        {'text': '« Назад к каталогу', 'callback_data': 'catalog'}
    ]]}
    
    send_telegram_message(chat_id, text, keyboard)

def handle_buy_album(chat_id: int, cursor, conn, user_id: int, username: str, first_name: str, album_id: str):
    safe_id = album_id.replace("'", "''")
    cursor.execute(f"SELECT * FROM albums WHERE id = '{safe_id}'")
    album = cursor.fetchone()
    
    if not album:
        send_telegram_message(chat_id, '❌ Альбом не найден')
        return
    
    items = [{
        'type': 'album',
        'id': album['id'],
        'title': album['title'],
        'artist': album['artist'],
        'price': album['price']
    }]
    
    order_id = create_order(cursor, conn, user_id, username, first_name, items, album['price'])
    
    text = f'''✅ <b>Заказ создан!</b>

Номер заказа: <code>{order_id}</code>

💿 Альбом: {album['title']}
👤 Исполнитель: {album['artist']}
💰 Сумма: {album['price']} ₽

Для оплаты свяжитесь с администратором: @your_admin'''
    
    keyboard = {'inline_keyboard': [[
        {'text': '« Назад к каталогу', 'callback_data': 'catalog'}
    ]]}
    
    send_telegram_message(chat_id, text, keyboard)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        print(f'[DEBUG] Received update: {json.dumps(body)}')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if 'message' in body:
            message = body['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            user = message['from']
            
            if text == '/start':
                handle_start_command(chat_id, user.get('first_name', 'друг'))
            elif text == '/catalog':
                handle_catalog_command(chat_id, cursor)
            elif text == '/help':
                handle_start_command(chat_id, user.get('first_name', 'друг'))
            else:
                send_telegram_message(chat_id, 'Используйте /catalog для просмотра каталога')
        
        elif 'callback_query' in body:
            callback = body['callback_query']
            chat_id = callback['message']['chat']['id']
            data = callback['data']
            user = callback['from']
            
            if data == 'catalog':
                handle_catalog_command(chat_id, cursor)
            elif data.startswith('album_'):
                album_id = data.replace('album_', '')
                handle_album_details(chat_id, cursor, album_id)
            elif data.startswith('buy_track_'):
                track_id = data.replace('buy_track_', '')
                handle_buy_track(chat_id, cursor, conn, user['id'], user.get('username', ''), user.get('first_name', ''), track_id)
            elif data.startswith('buy_album_'):
                album_id = data.replace('buy_album_', '')
                handle_buy_album(chat_id, cursor, conn, user['id'], user.get('username', ''), user.get('first_name', ''), album_id)
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
        
    except Exception as e:
        import traceback
        print(f'[ERROR] {str(e)}')
        print(f'[ERROR] Traceback: {traceback.format_exc()}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
