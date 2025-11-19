#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
print cgi.header("text/html; charset=UTF-8")

begin
    io = open("question.txt", "r:UTF-8")
    question = io.gets.chomp
    choices = []
    while line = io.gets
        line.chomp!
        choices.push("<div><input type='checkbox' name='answer' value='#{line}'>#{line}</div>")
    end
    io.close

print <<EOB
<html>
    <head>
        <meta charset="UTF-8">
        <title>投票システム</title>
    </head>
    <body>
        <h1>投票システム</h1>
        <h2>#{question}</h2>
        <form action="https://cgi.u.tsukuba.ac.jp/~s2311585/local_only/wp/vote2.rb" method="post">
            #{choices.join("\n")}
            <input type="submit" value="送信">
            <input type="reset" value="クリア">
        </form>
        <a href="view_result2.rb">投票結果を見る</a>
    </body>
</html>
EOB
rescue => ex
print <<EOB
<html><body>
    <p>#{ex.message}</p>
    <p>#{ex.backtrace}</p>
</body></html>
EOB
end