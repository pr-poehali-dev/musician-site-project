'''
Business: User authentication system - registration, login, logout, session management
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with auth tokens or user data
'''

import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def verify_session(token: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT s.user_id, s.expires_at, u.email, u.username, u.display_name, u.avatar_url
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()
            ''', (token,))
            return cur.fetchone()
    finally:
        conn.close()

def check_registration_rate_limit(ip_address: str) -> tuple[bool, Optional[str]]:
    '''
    Проверяет ограничение на количество регистраций с IP.
    Возвращает (allowed: bool, error_message: Optional[str])
    Лимиты: 3 попытки в час, блокировка на 1 час после превышения
    '''
    MAX_ATTEMPTS = 3
    BLOCK_DURATION_MINUTES = 60
    TIME_WINDOW_MINUTES = 60
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Получаем запись для данного IP
            cur.execute('''
                SELECT attempt_count, first_attempt_at, last_attempt_at, blocked_until
                FROM registration_attempts
                WHERE ip_address = %s
            ''', (ip_address,))
            record = cur.fetchone()
            
            now = datetime.now()
            
            # Если записи нет - создаем новую
            if not record:
                cur.execute('''
                    INSERT INTO registration_attempts (ip_address, attempt_count, first_attempt_at, last_attempt_at)
                    VALUES (%s, 1, NOW(), NOW())
                ''', (ip_address,))
                conn.commit()
                return (True, None)
            
            # Проверяем блокировку
            if record['blocked_until'] and record['blocked_until'] > now:
                minutes_left = int((record['blocked_until'] - now).total_seconds() / 60)
                return (False, f'Слишком много попыток регистрации. Попробуйте через {minutes_left} мин.')
            
            # Проверяем временное окно
            time_since_first = (now - record['first_attempt_at']).total_seconds() / 60
            
            # Если прошло больше TIME_WINDOW_MINUTES - сбрасываем счетчик
            if time_since_first > TIME_WINDOW_MINUTES:
                cur.execute('''
                    UPDATE registration_attempts
                    SET attempt_count = 1, first_attempt_at = NOW(), last_attempt_at = NOW(), blocked_until = NULL
                    WHERE ip_address = %s
                ''', (ip_address,))
                conn.commit()
                return (True, None)
            
            # Увеличиваем счетчик
            new_count = record['attempt_count'] + 1
            
            # Если превышен лимит - блокируем
            if new_count > MAX_ATTEMPTS:
                blocked_until = now + timedelta(minutes=BLOCK_DURATION_MINUTES)
                cur.execute('''
                    UPDATE registration_attempts
                    SET attempt_count = %s, last_attempt_at = NOW(), blocked_until = %s
                    WHERE ip_address = %s
                ''', (new_count, blocked_until, ip_address))
                conn.commit()
                return (False, f'Превышен лимит попыток регистрации ({MAX_ATTEMPTS} в час). Попробуйте через {BLOCK_DURATION_MINUTES} мин.')
            
            # Обновляем счетчик
            cur.execute('''
                UPDATE registration_attempts
                SET attempt_count = %s, last_attempt_at = NOW()
                WHERE ip_address = %s
            ''', (new_count, ip_address))
            conn.commit()
            
            attempts_left = MAX_ATTEMPTS - new_count
            if attempts_left == 0:
                return (True, None)
            
            return (True, None)
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
    
    path = event.get('queryStringParameters', {}).get('path', '')
    
    # POST /register - Регистрация нового пользователя
    if method == 'POST' and path == 'register':
        # Получаем IP адрес
        ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
        
        # Проверяем rate limit
        allowed, error_msg = check_registration_rate_limit(ip_address)
        if not allowed:
            return {
                'statusCode': 429,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': error_msg})
            }
        
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        username = body.get('username')
        display_name = body.get('display_name', username)
        
        if not email or not password or not username:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email, password and username are required'})
            }
        
        password_hash = hash_password(password)
        
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    INSERT INTO users (email, password_hash, username, display_name)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, email, username, display_name, created_at
                ''', (email, password_hash, username, display_name))
                user = cur.fetchone()
                
                cur.execute('''
                    INSERT INTO artist_profiles (user_id, bio, is_public)
                    VALUES (%s, %s, %s)
                ''', (user['id'], '', True))
                
                token = generate_token()
                expires_at = datetime.now() + timedelta(days=30)
                
                cur.execute('''
                    INSERT INTO sessions (user_id, token, expires_at)
                    VALUES (%s, %s, %s)
                ''', (user['id'], token, expires_at))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': dict(user)
                    }, default=str)
                }
        except psycopg2.IntegrityError:
            conn.rollback()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User with this email or username already exists'})
            }
        finally:
            conn.close()
    
    # POST /login - Вход пользователя
    if method == 'POST' and path == 'login':
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email and password are required'})
            }
        
        password_hash = hash_password(password)
        
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    SELECT id, email, username, display_name, avatar_url
                    FROM users
                    WHERE email = %s AND password_hash = %s
                ''', (email, password_hash))
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'})
                    }
                
                token = generate_token()
                expires_at = datetime.now() + timedelta(days=30)
                
                cur.execute('''
                    INSERT INTO sessions (user_id, token, expires_at)
                    VALUES (%s, %s, %s)
                ''', (user['id'], token, expires_at))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': dict(user)
                    })
                }
        finally:
            conn.close()
    
    # POST /logout - Выход пользователя
    if method == 'POST' and path == 'logout':
        token = event.get('headers', {}).get('x-auth-token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No auth token provided'})
            }
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute('UPDATE sessions SET expires_at = NOW() WHERE token = %s', (token,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Logged out successfully'})
            }
        finally:
            conn.close()
    
    # GET /me - Получение данных текущего пользователя
    if method == 'GET' and path == 'me':
        token = event.get('headers', {}).get('x-auth-token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No auth token provided'})
            }
        
        session = verify_session(token)
        
        if not session:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired token'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': session['user_id'],
                'email': session['email'],
                'username': session['username'],
                'display_name': session['display_name'],
                'avatar_url': session['avatar_url']
            })
        }
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'})
    }