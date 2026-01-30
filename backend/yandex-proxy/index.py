"""
Прокси для потокового воспроизведения файлов с Яндекс.Диска
Обходит ограничения CORS и позволяет воспроизводить аудио в браузере
"""
import json
import urllib.request
import urllib.parse
from urllib.error import HTTPError, URLError

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Range',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {})
    public_url = params.get('url')
    
    if not public_url:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing url parameter'})
        }
    
    try:
        api_url = f'https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key={urllib.parse.quote(public_url)}'
        
        with urllib.request.urlopen(api_url, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        if 'href' not in data:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'File not found'})
            }
        
        download_url = data['href']
        
        headers = {}
        request_headers = event.get('headers', {})
        range_header = request_headers.get('range') or request_headers.get('Range')
        if range_header:
            headers['Range'] = range_header
        
        req = urllib.request.Request(download_url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=30) as file_response:
            file_data = file_response.read()
            content_type = file_response.headers.get('Content-Type', 'audio/mpeg')
            content_length = file_response.headers.get('Content-Length')
            content_range = file_response.headers.get('Content-Range')
            status_code = 200 if not range_header else 206
            
            response_headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': content_type,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600'
            }
            
            if content_length:
                response_headers['Content-Length'] = content_length
            
            if content_range:
                response_headers['Content-Range'] = content_range
            
            import base64
            body = base64.b64encode(file_data).decode('utf-8')
            
            return {
                'statusCode': status_code,
                'headers': response_headers,
                'body': body,
                'isBase64Encoded': True
            }
    
    except HTTPError as e:
        return {
            'statusCode': e.code,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'HTTP error: {e.code}'})
        }
    except URLError as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Network error: {str(e.reason)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
