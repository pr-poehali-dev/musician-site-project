'''
Business: Admin authentication - login and password management for admin panel
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with auth token or error
'''

import json
import secrets
import hashlib
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def verify_admin_token(token: str) -> bool:
    if not token or not token.startswith('admin_'):
        return False
    return True

def get_admin_credentials(username: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                'SELECT username, password_hash FROM admin_credentials WHERE username = %s',
                (username,)
            )
            return cur.fetchone()
    finally:
        conn.close()

def update_admin_password(username: str, new_password_hash: str) -> bool:
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE admin_credentials SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE username = %s',
                (new_password_hash, username)
            )
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    action = event.get('queryStringParameters', {}).get('action', 'login')
    
    if method == 'POST' and action == 'login':
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body = json.loads(body_str)
        password = body.get('password', '')
        
        if not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Password is required'})
            }
        
        admin = get_admin_credentials('admin')
        if not admin:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Admin not found'})
            }
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if password_hash == admin['password_hash']:
            token = 'admin_' + generate_token()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'token': token,
                    'username': admin['username']
                })
            }
        else:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Неверный пароль'})
            }
    
    if method == 'POST' and action == 'change-password':
        headers = event.get('headers', {})
        headers_lower = {k.lower(): v for k, v in headers.items()}
        token = headers_lower.get('x-auth-token', '')
        
        if not verify_admin_token(token):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Unauthorized'})
            }
        
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body = json.loads(body_str)
        
        current_password = body.get('currentPassword', '')
        new_password = body.get('newPassword', '')
        
        if not current_password or not new_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Current and new password required'})
            }
        
        if len(new_password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Password must be at least 6 characters'})
            }
        
        admin = get_admin_credentials('admin')
        if not admin:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Admin not found'})
            }
        
        current_password_hash = hashlib.sha256(current_password.encode()).hexdigest()
        
        if current_password_hash != admin['password_hash']:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Неверный текущий пароль'})
            }
        
        new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        if update_admin_password('admin', new_password_hash):
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Password updated successfully'})
            }
        else:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Failed to update password'})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }