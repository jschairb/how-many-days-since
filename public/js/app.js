$(document).ready(function(){
  var timezone = "America/Detroit";
  $.getJSON("http://json-time.appspot.com/time.json?tz="+timezone+"&callback=?",
    function(data){
      $("#time").text(data.hour + ":" + data.minute);
    });
});