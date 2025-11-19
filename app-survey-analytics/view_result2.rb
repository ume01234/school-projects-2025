#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
puts cgi.header("text/html; charset=UTF-8")

results = Hash.new(0)
count = 0
question = "好きな調味料は？"

begin
    db=SQLite3::Database.new("report1026.db")
    db.transaction(){
        db.execute("SELECT*FROM votes;"){|rows|
            results[rows[0]] += 1
            count += 1
        }
    }
    db.close

    keys = results.map { |key, value| "<li>#{key}: #{value}票</li>" }

print <<EOB
<html>
<body>
    <h1>投票結果</h1>
    <h2>#{question}</h2>
    <div>投票総数 : #{count}</div>
    <ul>
    #{keys.join("\n")}
    </ul>
    <p><a href="https://cgi.u.tsukuba.ac.jp/~s2311585/local_only/wp/view_chart.rb">グラフで見る</a></p>
    <p><a href="https://cgi.u.tsukuba.ac.jp/~s2311585/local_only/wp/enquete_form2.rb">投票に戻る</a></p>
</body></html>
EOB
rescue => ex
print <<EOB
    <html>
    <body>
    <pre>#{ex.message}</pre>
    <pre>#{ex.backtrace}</pre>
    </body>
    </html>
EOB
end