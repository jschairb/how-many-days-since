require 'sinatra'

require 'active_support/core_ext/date/conversions'

set :last_defeat, "11/26/2011"

get '/' do
  @days_since = (Date.civil(2003,11,23) - Date.parse(Time.now.to_s)).to_i.abs
  @title = "How many days since Michigan has beaten Ohio State?"

  Time.zone = "Eastern Time (US & Canada)"
  @time = Time.zone.now.strftime("%I:%M %p")

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
    <div id="footer">
      an <a href="https://twitter.com/jschairb">@<span class="danzig">jschairb</span></a> joint
    </div>
  </body>
</html>

@@index
<p id="days_since"><span id="days_count"><%= @days_since %></span> days.</p>
<p id="logo"><img src="pitiful-michigan-fans.jpg" /></p>
<p id="phrase">It's <span id="time"><%= @time %></span> in Columbus and Michigan still sucks.</p>
