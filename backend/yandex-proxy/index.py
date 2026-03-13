import json
import urllib.request
import urllib.parse
import urllib.error


def handler(event: dict, context) -> dict:
    """Прокси для получения прямой ссылки на аудиофайл с Яндекс.Диска"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    public_url = params.get('url', '')

    if not public_url:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'url parameter is required'})
        }

    try:
        api_url = f"https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key={urllib.parse.quote(public_url)}"
        req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})

        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            direct_url = data.get('href')

        if not direct_url:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Direct URL not found in response'})
            }

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'url': direct_url})
        }

    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        return {
            'statusCode': e.code,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Yandex API error: {e.code}', 'detail': body[:200]})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
