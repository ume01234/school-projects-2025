#!/usr/bin/env ruby
# encoding: utf-8
require 'cgi'
require 'sqlite3'
cgi = CGI.new
puts cgi.header("text/html; charset=UTF-8")

results = []
question = "好きな調味料は？"

begin
    db = SQLite3::Database.new("report1026.db")
    db.transaction {
        db.execute("SELECT name, COUNT(*) FROM votes GROUP BY name;") { |row|
            results << [row[0], row[1]]
        }
    }
    db.close

    data_rows = results.map { |name, count| "['#{name}', #{count}]" }.join(",\n")

print <<EOB
<html>
  <head>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script type="text/javascript">
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['調味料', '票数'],
          #{data_rows}
        ]);

        var options = {
          title: '#{question}',
          pieHole: 0.4
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
      }
    </script>
  </head>
  <body>
    <h1>投票結果 - グラフ</h1>
    <div id="piechart" style="width: 900px; height: 500px;"></div>
    <p><a href="https://cgi.u.tsukuba.ac.jp/~s2311585/local_only/wp/view_result2.rb">投票結果に戻る</a></p>
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