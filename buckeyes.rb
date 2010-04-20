require 'rubygems'
require 'sinatra'
get '/' do
  @days_since = (Date.parse("11/23/2003") - Date.parse(Time.now.to_s)).to_i.abs
  @title = "How many days since Michigan has beaten Ohio State?"
  erb :index
end

__END__

@@layout
<DOCTYPE html>
<html>
  <head>
    <title><%= @title %></title>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <link rel="stylesheet" href="/css/style.css" type="text/css" media="screen, projection">
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
    <script src="/js/app.js"></script>
  </head>
  <body>
    <h1><%= @title %></h1>
    <div id="content">
      <%= yield %>
    </div>
  </body>
</html>

@@index
<p id="days_since"><span id="days_count"><%= @days_since %></span> days.</p>
<p id="logo"><img src="images/ohio-state-200px.png" /></p>
<p>It's <span id="time"><%= Time.now.strftime("%I:%M %p %Z") %></span> in Columbus and Michigan still sucks.</p>
