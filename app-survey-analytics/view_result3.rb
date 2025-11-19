#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
print cgi.header("text/html; charset=UTF-8")

begin
  survey_id = cgi['survey_id'].to_i

  db = SQLite3::Database.new("report1026.db")
  survey = db.execute("SELECT title FROM surveys WHERE id = ?", [survey_id]).first
  results = db.execute("SELECT choices.choice, COUNT(votes.id) 
  FROM choices 
  LEFT JOIN votes ON choices.id = votes.choice_id 
  WHERE choices.survey_id = ? 
  GROUP BY choices.id", [survey_id])
  db.close

  if survey.nil?
    raise "アンケートが見つかりません。"
  end

  question = survey[0]
  result_list = results.map do |choice, count|
    "<li>#{choice}: #{count}票</li>"
  end.join("\n")

rescue => ex
  question = "エラー"
  result_list = "<p>エラー: #{ex.message}</p>"
end

print <<-HTML
<html>
  <head>
    <meta charset="UTF-8">
    <title>投票結果</title>
  </head>
  <body>
    <h1>投票結果</h1>
    <h2>#{question}</h2>
    <ul>
      #{result_list}
    </ul>
    <p><a href="index.rb">トップページに戻る</a></p>
  </body>
</html>
HTML