#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
puts cgi.header("text/html; charset=UTF-8")

print <<-HTML
    <html><body>
    投票ありがとうございます。
    <p><a href="https://cgi.u.tsukuba.ac.jp/~s2311585/local_only/wp/view_result2.rb">投票結果を見る</a></p>
    <p><a href="https://cgi.u.tsukuba.ac.jp/~s2311585/local_only/wp/enquete_form2.rb">投票に戻る</a></p>
    </body></html>
    HTML

begin
    answers=cgi.params['answer']
    db = SQLite3::Database.new("report1026.db")
    db.transaction(){
        answers.each{|answer|
            db.execute("INSERT INTO votes VALUES(?);",[answer])
        }
    }
    db.close

rescue => ex
    print <<-HTML
    <html><body>
        <pre>#{ex.message}</pre>
        <pre>#{ex.backtrace}</pre>
    </body></html>
    HTML
end