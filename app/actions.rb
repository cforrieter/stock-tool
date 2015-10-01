# Homepage (Root path)
get '/' do
  erb :index
end

get '/api/:stock' do |stock|
  Net::HTTP.get("ichart.yahoo.com", "/table.csv?s=#{stock}")
end