from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "visitors": [],
        "orders": [],
        "reviews": [],
        "promotions": [
            {"id": 1, "robux": 1000, "price": 1000, "quantity": 50},
            {"id": 2, "robux": 2500, "price": 2500, "quantity": 25},
            {"id": 3, "robux": 5000, "price": 5000, "quantity": 10}
        ],
        "nextReviewId": 1,
        "nextOrderId": 1,
        "stats": {"total_sold": 15847, "happy_clients": 2394}
    }

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/api/visitors', methods=['POST'])
def add_visitor():
    data = load_data()
    visitor = {
        'ip': request.remote_addr,
        'timestamp': datetime.now().isoformat(),
        'user_agent': request.headers.get('User-Agent')
    }
    data['visitors'].append(visitor)
    save_data(data)
    return jsonify({'status': 'success'})

@app.route('/api/reviews', methods=['GET', 'POST'])
def handle_reviews():
    data = load_data()
    
    if request.method == 'GET':
        return jsonify(data['reviews'])
    
    elif request.method == 'POST':
        review_data = request.json
        review = {
            'id': data['nextReviewId'],
            'name': review_data['name'],
            'rating': review_data['rating'],
            'text': review_data['text'],
            'timestamp': datetime.now().isoformat()
        }
        data['reviews'].append(review)
        data['nextReviewId'] += 1
        save_data(data)
        return jsonify({'status': 'success', 'id': review['id']})

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = load_data()
    order_data = request.json
    order = {
        'id': data['nextOrderId'],
        'username': order_data['username'],
        'robux_amount': order_data['robux_amount'],
        'price': order_data['price'],
        'status': 'pending',
        'timestamp': datetime.now().isoformat()
    }
    data['orders'].append(order)
    data['nextOrderId'] += 1
    data['stats']['total_sold'] += order_data['robux_amount']
    data['stats']['happy_clients'] += 1
    save_data(data)
    return jsonify({'status': 'success', 'id': order['id']})

@app.route('/api/robux/price', methods=['GET'])
def get_robux_price():
    robux_amount = request.args.get('amount', type=int)
    # Курс: 1 рубль = 1 Robux
    price = robux_amount
    return jsonify({'robux': robux_amount, 'price': price})

@app.route('/api/roblox/player/<username>', methods=['GET'])
def search_roblox_player(username):
    # В реальном приложении здесь будет запрос к Roblox API
    # Для демонстрации возвращаем mock данные
    mock_players = [
        {"id": 123456789, "name": username, "avatar": ""},
        {"id": 987654321, "name": f"{username}_pro", "avatar": ""},
        {"id": 555555555, "name": f"{username}123", "avatar": ""}
    ]
    return jsonify(mock_players)

@app.route('/api/roblox/player/<user_id>/places', methods=['GET'])
def get_player_places(user_id):
    # В реальном приложении здесь будет запрос к Roblox API
    # Для демонстрации возвращаем mock данные
    mock_places = [
        {"id": 1, "name": "Adventure World", "description": "Приключенческая игра с Battle Pass"},
        {"id": 2, "name": "Racing Extreme", "description": "Гоночная игра с сезонным пропуском"},
        {"id": 3, "name": "Fantasy RPG", "description": "Ролевая игра с системой боевого пропуска"}
    ]
    return jsonify(mock_places)

@app.route('/api/roblox/place/<place_id>/verify', methods=['POST'])
def verify_place_ownership(place_id):
    # В реальном приложении здесь будет проверка владения плейсом
    # Для демонстрации всегда возвращаем успех
    verification_data = request.json
    return jsonify({
        'verified': True,
        'has_battle_pass': True,
        'place_name': 'Adventure World'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
