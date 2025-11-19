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
  choices = db.execute("SELECT id, choice FROM choices WHERE survey_id = ?", [survey_id])
  db.close

  if survey.nil? || choices.empty?
    raise "アンケートが見つからないか、選択肢が存在しません。"
  end

  question = survey[0]
  choice_html = choices.map do |id, choice|
    "<div><input type='radio' name='choice_id' value='#{id}'>#{choice}</div>"
  end.join("\n")

rescue => ex
  question = "エラー"
  choice_html = "<p>エラー: #{ex.message}</p>"
end

print <<-HTML
<html>
  <head>
    <meta charset="UTF-8">
    <title>アンケートに投票</title>
  </head>
  <body>
    <h1>アンケート投票</h1>
    <form action="vote3.rb" method="post">
      <h2>#{question}</h2>
      #{choice_html}
      <input type="hidden" name="survey_id" value="#{survey_id}">
      <input type="submit" value="送信">
      <input type="reset" value="クリア">
    </form>
    <p style="text-align: center;"><a href="index.rb">トップページに戻る</a></p>
  </body>
</html>
HTML