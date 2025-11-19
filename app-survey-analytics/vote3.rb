#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
puts cgi.header("text/html; charset=UTF-8")

begin
  choice_id = cgi['choice_id']
  db = SQLite3::Database.new("report1026.db")

  db.transaction do
    db.execute("INSERT INTO votes (choice_id) VALUES (?)", [choice_id])
  end
  db.close

  print <<-HTML
  <html>
    <body>
      <p>投票ありがとうございました！</p>
      <a href="index.rb">トップページに戻る</a>
    </body>
  </html>
  HTML
rescue => ex
  print "<p>エラー: #{ex.message}</p>"
end
