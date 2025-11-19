import os
from dotenv import load_dotenv
import google.generativeai as genai

# .envファイルから環境変数を読み込む
load_dotenv()

def get_chat_response(message, classification):
    try:
        # APIキー取得と確認
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your-gemini-api-key-here":
            return "Gemini APIキーが設定されていません。.envファイルにGEMINI_API_KEYを設定してください。"

        # Gemini APIを設定
        genai.configure(api_key=api_key)

        # モデル指定（軽量版を使用）
        model = genai.GenerativeModel("gemini-1.5-flash")

        # システムプロンプトとして、最初の入力に組み込む
        system_prompt = f"{classification} に住んでいる人に向けて、つくば市のごみの捨て方を案内してください。"

        # システムプロンプトとユーザーメッセージを組み合わせて送信
        combined_prompt = f"{system_prompt}\n\nユーザーの質問: {message}"
        response = model.generate_content(combined_prompt)

        return response.text.strip()

    except Exception as e:
        error_message = str(e)

        if "quota" in error_message.lower() or "exceeded" in error_message.lower():
            return "申し訳ございません。Gemini APIの利用制限に達しました。しばらく時間をおいてから再試行してください。"
        elif "403" in error_message or "invalid_api_key" in error_message:
            return "Gemini APIキーが無効です。正しいAPIキーを.envファイルに設定してください。"
        else:
            return f"エラーが発生しました: {error_message}\n\n対処法：\n1. インターネット接続を確認\n2. Google Cloud ConsoleでAPI利用状況を確認\n3. しばらく時間をおいて再試行"



