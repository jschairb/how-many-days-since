require 'sinatra'
require 'active_support'

set :last_defeat, "11/23/2003"

get '/' do
  @days_since = (Date.civil(2003,11,23) - Date.parse(Time.now.to_s)).to_i.abs
  @title = "How many days since Michigan has beaten Ohio State?"

  @time = Time.now.strftime("%I:%M %p")

  erb :index
end

__END__

@@layout
<!DOCTYPE html>
<html>
  <head>
    <title><%= @title %></title>
    <link href='reset.css' rel='stylesheet' />
    <link href='style.css' rel='stylesheet' type="text/css" />
  </head>
  <body>
    <h1><%= @title %></h1>
    <div id="content">
      <%= yield %>
    </div>
  </body>
</html>

@@index
<p id="logo"><img src="ohio-state-200px.png" /></p>
<p id="days_since"><span id="days_count"><%= @days_since %></span> days.</p>
<p>It's <span id="time"><%= @time %> CDT</span> in Columbus and Michigan still sucks.</p>
