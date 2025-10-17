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
