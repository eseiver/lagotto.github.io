var data;
var colors = ["#304345","#789aa1","#a0d5d6","#ad9a27","#a17f78"];
var api_key = d3.select("#api_key").attr('data-api_key');

var l = 400; // left margin
var r = 50; // right margin
var w = 420; // width of drawing area
var h = 30;  // bar height
var s = 1;   // spacing between bars

d3.json("http://almhack.crowdometer.org/api/v3/sources?api_key=" + api_key, function(error, json) {
  data = json;

  var formatFixed = d3.format(",.0f");

  // Articles tab
  var chart = d3.select("div#articles").append("svg")
    .attr("width", w + l + r)
    .attr("height", data.length * (h + 2 * s) + 30)
    .attr("class", "chart")
    .append("g")
    .attr("transform", "translate(230,20)");

  var x = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.article_count; })])
    .range([0, w]);
  var y = d3.scale.ordinal()
    .domain(data.map(function(d) { return d.display_name; }))
    .rangeBands([0, (h + 2 * s) * data.length]);
  var z = d3.scale.ordinal()
    .domain(data.map(function(d) { return d.group; }))
    .range(colors);

  chart.selectAll("text.labels")
    .data(data)
    .enter().append("a").attr("xlink:href", function(d) { return "http://almhack.crowdometer.org/sources/" + d.name; }).append("text")
    .attr("x", 0)
    .attr("y", function(d) { return y(d.display_name) + y.rangeBand() / 2; })
    .attr("dx", -230) // padding-right
    .attr("dy", ".35em") // vertical-align: middle
    .text(function(d) { return d.display_name; });
  chart.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("fill", function(d) { return z(d.group); })
    .attr("y", function(d,i) { return y(d.display_name); })
    .attr("height", h)
    .attr("width", function(d) { return x(d.article_count); });
  chart.selectAll("text.values")
    .data(data)
    .enter().append("text")
    .attr("x", function(d) { return x(d.article_count); })
    .attr("y", function(d) { return y(d.display_name) + y.rangeBand() / 2; })
    .attr("dx", 5) // padding-right
    .attr("dy", ".35em") // vertical-align: middle
    .text(function(d) { return number_with_delimiter(d.article_count); });

  function number_with_delimiter(number) {
    if(number !== 0) {
      return formatFixed(number);
    } else {
      return null;
    }
  }
});