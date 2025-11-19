#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
print cgi.header("text/html; charset=UTF-8")

begin
  db = SQLite3::Database.new("report1026.db")

  if cgi.request_method == "POST"
    title = cgi['title']
    choices = cgi.params['choices']

    db.transaction do
      survey_id = db.execute("INSERT INTO surveys (title) VALUES (?)", [title]).last_insert_row_id
      choices.each do |choice|
        db.execute("INSERT INTO choices (survey_id, choice) VALUES (?, ?)", [survey_id, choice])
      end
    end

    print "<p>アンケートが作成されました！</p>"
    print '<a href="index.rb">トップページに戻る</a>'
  else
    print <<-HTML
    <form method="POST" action="create_survey.rb">
      アンケート名: <input type="text" name="title" required><br>
      選択肢1: <input type="text" name="choices" required><br>
      選択肢2: <input type="text" name="choices" required><br>
      選択肢3: <input type="text" name="choices"><br>
      <input type="submit" value="作成">
    </form>
    <a href="index.rb">トップページに戻る</a>
    HTML
  end
rescue => ex
  print "<p>エラー: #{ex.message}</p>"
end
