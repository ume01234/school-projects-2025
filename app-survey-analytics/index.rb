#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
print cgi.header("text/html; charset=UTF-8")

begin
  db = SQLite3::Database.new("report1026.db")

  surveys = db.execute("SELECT id, title FROM surveys;")
  db.close

  survey_list_html = surveys.map do |id, title|
    <<-HTML
      <div>
        <strong>#{title}</strong>：
        <a href="enquete_form3.rb?survey_id=#{id}">投票へ</a>：
        <a href="view_result3.rb?survey_id=#{id}">結果を見る</a>
      </div>
    HTML
  end.join("\n")

rescue => ex
  survey_list_html = "<p>エラー: #{ex.message}</p>"
end

print <<-HTML
<html><head>
    <meta charset="UTF-8">
    <title>アンケートシステム</title>
    </head><body>
    <h1>[新規投票作成・集計システム]</h1>
    <div class="container">
      <a href="create_survey.rb">新規アンケート作成</a><br>
      <h2>アンケート一覧</h2>
      #{survey_list_html}
    </div>
  </body>
</html>HTML
