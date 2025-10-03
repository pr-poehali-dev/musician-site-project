import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram bot webhook for music shop
    Args: event with Telegram update data
          context with request_id
    Returns: HTTP response
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Bot token not configured'}),
                'isBase64Encoded': False
            }
        
        update = json.loads(event.get('body', '{}'))
        
        # Обработка сообщений
        if 'message' in update:
            message = update['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            
            # Проверяем что токен валидный (не тестовый)
            if len(bot_token) > 20:
                # Команда /start
                if text == '/start':
                    response_text = (
                        "🎵 Добро пожаловать в Vintage Music Shop!\n\n"
                        "Доступные команды:\n"
                        "/catalog - Каталог треков и альбомов\n"
                        "/cart - Корзина\n"
                        "/help - Помощь"
                    )
                    send_message(bot_token, chat_id, response_text)
                
                # Команда /catalog
                elif text == '/catalog':
                    response_text = (
                        "📀 Каталог музыки:\n\n"
                        "Для покупки треков перейдите на сайт:\n"
                        "Там вы можете прослушать треки и добавить в корзину."
                    )
                    send_message(bot_token, chat_id, response_text)
                
                # Команда /help
                elif text == '/help':
                    response_text = (
                        "ℹ️ Как купить музыку:\n\n"
                        "1. Перейдите на сайт магазина\n"
                        "2. Выберите трек или альбом\n"
                        "3. Добавьте в корзину\n"
                        "4. Оформите заказ через бота\n\n"
                        "По вопросам: @support"
                    )
                    send_message(bot_token, chat_id, response_text)
                
                else:
                    response_text = "Используйте /start для начала работы"
                    send_message(bot_token, chat_id, response_text)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def send_message(bot_token: str, chat_id: int, text: str) -> None:
    import urllib.request
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = json.dumps({
        'chat_id': chat_id,
        'text': text
    }).encode('utf-8')
    
    req = urllib.request.Request(
        url, 
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req)