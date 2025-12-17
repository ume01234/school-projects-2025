# 軽量なnginxベースイメージを使用
FROM nginx:alpine

# 静的ファイルをコピー
COPY eye/ /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# カスタムnginx設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ポート80を公開
EXPOSE 80

# nginxを起動
CMD ["nginx", "-g", "daemon off;"]

