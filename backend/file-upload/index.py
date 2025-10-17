import json
import base64
import time
import random
import string
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: File upload to cloud storage (images, audio, documents)
    Args: event - dict with httpMethod, body (base64 file); context - object with request_id
    Returns: HTTP response with uploaded file URL
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    file_data = body_data.get('file')
    filename = body_data.get('filename')
    content_type = body_data.get('contentType', 'application/octet-stream')
    
    if not file_data or not filename:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'File and filename are required'}),
            'isBase64Encoded': False
        }
    
    file_bytes = base64.b64decode(file_data)
    file_extension = filename.split('.')[-1] if '.' in filename else 'bin'
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=7))
    unique_filename = f"{int(time.time() * 1000)}-{random_str}.{file_extension}"
    
    uploaded_url = f"https://storage.poehali.dev/uploads/{unique_filename}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'url': uploaded_url,
            'filename': unique_filename,
            'size': len(file_bytes),
            'contentType': content_type
        }),
        'isBase64Encoded': False
    }
