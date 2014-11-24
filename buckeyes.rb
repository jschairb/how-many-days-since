require 'sinatra'

require 'active_support/core_ext/time'
require 'active_support/core_ext/date/conversions'

helpers do
  def random_image_path
    images = Dir.glob("public/images/*.{gif,jpg,png}").
      map { |f| f.gsub("public/", "") }
    images.sample
  end
end

get '/' do
  @days_since = (Date.civil(2011,11,26) - Date.parse(Time.now.to_s)).to_i.abs
  @title = "How many days since Michigan has beaten Ohio State?"

  Time.zone = "Eastern Time (US & Canada)"
  @time = Time.zone.now.strftime("%I:%M %p")

  @image = random_image_path

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
    <script type="text/javascript">

      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-1518490-11']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>
  </body>
</html>

@@index
<p id="days_since"><span id="days_count"><%= @days_since %></span> days.</p>
<p id="logo"><img src="<%= @image %>" /></p>
<p id="phrase">It's <span id="time"><%= @time %></span> in Columbus and Michigan still sucks.</p>
