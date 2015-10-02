# Homepage (Root path)
get '/' do
  erb :index
end

get '/api/:stock' do |stock|
  today = Date.current
  day = today.day
  month = today.month
  year = today.year
  
  Net::HTTP.get("ichart.yahoo.com", "/table.csv?s=#{stock}&a=#{month}&b=#{day}&c=#{year-5}&d=#{month}&e=#{day}&f=#{year}&g=d&ignore=.csv")
end