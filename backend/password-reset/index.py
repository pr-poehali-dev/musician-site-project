'''
Business: Password reset system - request reset link and reset password
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with success message or error
'''

import json
import secrets
import hashlib
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)

def create_reset_token(username: str) -> str:
    token = generate_reset_token()
    expires_at = datetime.now() + timedelta(hours=1)
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                INSERT INTO password_reset_tokens (username, token, expires_at)
                VALUES (%s, %s, %s)
            ''', (username, token, expires_at))
            conn.commit()
            return token
    finally:
        conn.close()

def verify_reset_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT username FROM password_reset_tokens
                WHERE token = %s AND expires_at > NOW() AND used = FALSE
            ''', (token,))
            result = cur.fetchone()
            return result['username'] if result else None
    finally:
        conn.close()

def mark_token_used(token: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                UPDATE password_reset_tokens
                SET used = TRUE
                WHERE token = %s
            ''', (token,))
            conn.commit()
    finally:
        conn.close()

def update_password(username: str, new_password_hash: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                UPDATE admin_credentials
                SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
                WHERE username = %s
            ''', (new_password_hash, username))
            conn.commit()
    finally:
        conn.close()

def send_reset_email(email: str, token: str, site_url: str):
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        raise Exception('SMTP credentials not configured')
    
    reset_url = f"{site_url}/auth?reset_token={token}"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Восстановление пароля администратора'
    msg['From'] = smtp_user
    msg['To'] = email
    
    text = f'''
Здравствуйте!

Вы запросили восстановление пароля для админ-панели.

Перейдите по ссылке для сброса пароля:
{reset_url}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
'''
    
    html = f'''
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #5D4037;">Восстановление пароля</h2>
      <p>Здравствуйте!</p>
      <p>Вы запросили восстановление пароля для админ-панели.</p>
      <p style="margin: 30px 0;">
        <a href="{reset_url}" 
           style="background-color: #5D4037; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Восстановить пароль
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Ссылка действительна в течение 1 часа.
      </p>
      <p style="color: #666; font-size: 14px;">
        Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
      </p>
    </div>
  </body>
</html>
'''
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
    server.quit()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
    
    action = event.get('queryStringParameters', {}).get('action', 'request')
    
    if method == 'POST' and action == 'request':
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body = json.loads(body_str)
        
        email = body.get('email', '')
        admin_email = os.environ.get('ADMIN_EMAIL', '')
        
        if not admin_email:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Email not configured'})
            }
        
        if email.lower() != admin_email.lower():
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Если email существует, письмо отправлено'})
            }
        
        try:
            token = create_reset_token('admin')
            
            site_url = event.get('headers', {}).get('origin', 'https://shmelidze.ru')
            
            send_reset_email(admin_email, token, site_url)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Письмо с инструкциями отправлено на email'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': f'Ошибка отправки email: {str(e)}'})
            }
    
    if method == 'POST' and action == 'reset':
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body = json.loads(body_str)
        
        token = body.get('token', '')
        new_password = body.get('newPassword', '')
        
        if not token or not new_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Token and new password required'})
            }
        
        if len(new_password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'})
            }
        
        username = verify_reset_token(token)
        
        if not username:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Неверный или истекший токен'})
            }
        
        new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        update_password(username, new_password_hash)
        mark_token_used(token)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'message': 'Пароль успешно изменен'})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
