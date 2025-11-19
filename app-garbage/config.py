# DB接続やAPIキーなどの設定
import os
from dotenv import load_dotenv

# .env ファイルから環境変数を読み込む
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecretkey")
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB = os.getenv("MYSQL_DB", "gomi_app")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))