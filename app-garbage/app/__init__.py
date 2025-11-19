# Flaskアプリの初期化
from flask import Flask
from config import Config
import mysql.connector

def create_app():
    app = Flask(__name__, static_folder='../static')
    app.config.from_object(Config)

    # DB接続
    app.db = mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB'],
        port=app.config['MYSQL_PORT'],
        charset='utf8mb4',
        use_unicode=True,
        autocommit=True,
        pool_reset_session=True
    )

    # ルートを登録
    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app