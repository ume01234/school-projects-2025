#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
print cgi.header("text/html; charset=UTF-8")

begin
  survey_id = cgi['survey_id'].to_i
  db = SQLite3::Database.new("report1026.db")

  db.transaction do
    db.execute("DELETE FROM votes WHERE choice_id IN (SELECT id FROM choices WHERE survey_id = ?)", [survey_id])
    db.execute("DELETE FROM choices WHERE survey_id = ?", [survey_id])
    db.execute("DELETE FROM surveys WHERE id = ?", [survey_id])
  end
  db.close

  print "<p>アンケートを削除しました。</p>"
  print '<a href="index.rb">トップページに戻る</a>'
rescue => ex
  print "<p>エラー: #{ex.message}</p>"
end
