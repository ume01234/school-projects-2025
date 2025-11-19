#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
puts cgi.header("text/html; charset=UTF-8")

begin
  db = SQLite3::Database.new("report1026.db")

  # 登録済みアンケートを取得
  surveys = db.execute("SELECT id, question FROM questions ORDER BY id DESC")

  print <<-HTML
  <html>
    <head>
      <meta charset="UTF-8">
      <title>アンケート一覧</title>
    </head>
    <body>
      <h1>アンケート一覧</h1>
      <ul>
  HTML

  surveys.each do |survey|
    print "<li><a href='enquete_form2.rb?id=#{survey[0]}'>#{survey[1]}</a></li>"
  end

  print <<-HTML
      </ul>
      <p><a href="create_survey.rb">新しいアンケートを作成する</a></p>
    </body>
  </html>
  HTML
rescue => ex
  print <<-HTML
  <html>
    <body>
      <p>エラー: #{ex.message}</p>
      <pre>#{ex.backtrace.join("\n")}</pre>
    </body>
  </html>
  HTML
end