# ルーティング（URLと処理の対応）
from flask import Blueprint, render_template, request, redirect, session, current_app, jsonify, flash
import datetime

from .gomi_utils import get_today_and_week_schedule
from .gpt_utils import get_chat_response

main = Blueprint('main', __name__)

@main.route('/select-location', methods=['GET', 'POST'])
def select_location():
    if request.method == 'POST':
        area_name = request.form['area_name'].replace('　', '').strip()
        print("入力された地域名："+ repr(area_name))
        cursor1 = current_app.db.cursor(dictionary=True, buffered=True)
        cursor1.execute("SELECT classification FROM area_mapping WHERE area_name = %s", (area_name,))
        result = cursor1.fetchone()
        cursor1.close()
        
        cursor2 = current_app.db.cursor(dictionary=True, buffered=True)
        cursor2.execute("SELECT area_name FROM area_mapping")
        rows = cursor2.fetchall()
        cursor2.close()

        if result:
            session['area_name'] = area_name
            session['classification'] = result['classification']
            return redirect('/dashboard')
        else:
            flash("その地域は登録されていません。")
            return redirect('/select-location')

    return render_template('select_location.html')

@main.route('/dashboard')
def dashboard():
    if 'classification' not in session:
        return redirect('/select-location')

    classification = session['classification']
    today = datetime.date.today()
    week_schedule = get_today_and_week_schedule(current_app.db, classification, today)

    return render_template('dashboard.html',
                           area_name=session['area_name'],
                           today=today,
                           schedule=week_schedule)

@main.route('/chat')
def chat():
    if 'classification' not in session:
        return redirect('/select-location')
    return render_template('chat.html')

@main.route('/api/chat', methods=['POST'])
def api_chat():
    if 'classification' not in session:
        return jsonify({'error': '地域が未設定です'}), 400

    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'error': 'メッセージが空です'}), 400

    classification = session['classification']
    response = get_chat_response(user_message, classification)
    return jsonify({'response': response})

@main.route('/change-location')
def change_location():
    session.pop('area_name', None)
    session.pop('classification', None)
    return redirect('/select-location')