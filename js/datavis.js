/*
 */

var data_url = 'data/data.json';
var tmp;
var gmaps = [];
$(document).ready(function() {
		$.getJSON(data_url,
		          function(data) {
			          /* Display data in table */
			          //populate_table(data);

			          /* Gender Pie Chart */
			          //pie_chart(extract_data('gender', data), 'gender');

			          /* Date of Birth */

			          /* Post Code Map */
			          //map(extract_data('postcode', data), 'postcode');

			          /* Favorite Brand Pie Chart */
			          //pie_chart(extract_data('fav_brand', data), 'fav_brand');
			          /* Favorite Brand Circles */
			          //weighted_circles(extract_data('fav_brand', data), 'fav_brand_circles', {radius: 85, padding: 1});

			          /* Device Pie Chart */
			          //pie_chart(extract_data('device', data), 'device');
			          /* Device Circles */
			          //weighted_circles(extract_data('device', data), 'device_circles');

			          /* Slider Bar Chart */
			          //bar_chart(extract_data('slider', data), 'slider');
			          /* Slider Circles */
			          //weighted_circles(extract_data('slider', data), 'slider_circles', {radius: 30, padding: 5, colors:['rgba(255, 255, 255, 1)']});

			          /* Check Box Venn Diagram */
			          //venn_diagram(extract_data(['user', 'checkbox'], data), 'checkbox');

			          /* Latitude and Longitude Map */
			          //map(extract_data(['latitude', 'longitude', 'user'], data), 'latitude_longitude');

			          /* Favorite Brand / Gender */
			          //weighted_circle_pie(data, ['fav_brand', 'gender'], 'fav_brand_gender', {padding: 2, radius: 80});

			          /* Favorite Brand / Device */
			          weighted_circle_pie(data, ['fav_brand', 'device'], 'fav_brand_device', {padding: 2, radius: 80});

			          /* Create global pointer, to make debugging easier */
			          tmp = data;
		          });
	});

/* Sample colors */
var css_colors = ['rgba(  0,   0,   0, 0.5)',
                  'rgba(255,   0,   0, 0.5)',
                  'rgba(  0, 255,   0, 0.5)',
                  'rgba(255, 255,   0, 0.5)',
                  'rgba(  0,   0, 255, 0.5)',
                  'rgba(255,   0, 255, 0.5)',
                  'rgba(  0, 255, 255, 0.5)',
                  'rgba(255, 255, 255, 0.5)',
	];
var css_color = 0;

var weighted_circle_pie = function(data, sets, container, params)
{
	var c = [];
	for(var i in data) {
		if(c[data[i][sets[0]]]) {
		}
		else {
			c[data[i][sets[0]]] = [];
		}

		/* Update sets within c[data[i][sets[0]]] */
		if(c[data[i][sets[0]]][data[i][sets[1]]]) {
			c[data[i][sets[0]]][data[i][sets[1]]]++;
		}
		else {
			c[data[i][sets[0]]][data[i][sets[1]]] = 1;
		}
	}

	/* Generate on the fly colors */
	var a = extract_data(sets[1], data);
	a = count_instances(a[sets[1]]);
	for(var i in a) {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = '.' + a[i][0] + ' { background-color: ' + css_colors[(css_color++ % css_colors.length)] + '; }';
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	var w = new wCirclesPie(params);
	w.data(c);
	$('#' + container).append(w.draw());
};

var weighted_circles = function(data, container, params)
{
	for(var e in data) {
		var d = count_instances(data[e]);
		/* Sort by most occuring */
		d.sort(function(a, b) {
				if(a[1] === b[1]) { return 0;}
				return (a[1] > b[1]) ? -1 : 1;
			});

		var c = new wCircles(params);
		c.data(d);
		$('#' + container).append(c.draw());
	}
};

/* Prepare data and view for Venn Diagram
 */
var venn_diagram = function(data, container)
{
	/* Requires data in the form {label:'', data:[0,1,2,3]} */
	var d = [];
	for(var i in data['user']) {
		d.push({label: data['user'][i], data: data['checkbox'][i].response});
	}

	/* Create html page elements */
	var cont = $('<div/>', {id: container + '_controls', class: 'chart'});

	/* Create three drop down boxes */
	var select_l = $('<select/>', {id: container + '_left', class: 'venn-sel select-left'});
	var select_r = $('<select/>', {id: container + '_center', class: 'venn-sel select-right'});

	$('<option/>', {value: '', text: 'Select User'}).appendTo(select_l);
	$('<option/>', {value: '', text: 'Select User'}).appendTo(select_r);

	for(var i in d) {
		$('<option/>', {value: JSON.stringify(d[i]), text: d[i].label}).appendTo(select_l);
		$('<option/>', {value: JSON.stringify(d[i]), text: d[i].label}).appendTo(select_r);
	}

	cont.append(select_l);
	cont.append(select_r);
	$('#' + container).append(cont);
	$('<div/>', {id: container + '_venn', class: 'chart'}).appendTo($('#' + container));

	/* Link venn-sel select options to trigger new Venn drawing */
	$('.venn-sel').change(function() {
			var container = $(this).parent().parent().attr('id');
			var v = new Venn({elementSize: 18, elementPadding: 2});
			var venn_data = [];
			$('#' + container + ' .venn-sel').each(function() {
					if($(this).val() != '') {
						venn_data.push(JSON.parse($(this).val()));
					}
				});
			v.addData(venn_data);
			v.compute();
			$('#' + container + '_venn').width(v.getWidth());
			v.draw(container + '_venn');

			var leg = $('<div/>', {class: 'venn-legend'});
			for(var i in v.containers) {
				var label = $('<div/>', {class: 'label', text: v.containers[i].label});
				var color = $('<div/>', {class: 'color', css: {
							'background-color': v.containers[i].bg_color,
							'border': '1px solid ' + v.containers[i].border_color
						}});
				leg.append(color, label);
			}
			$('#' + container + '_venn').append(leg);
		});
};

/* Create data structure to display data in bar chart -
   using jqPlot library */
var bar_chart = function(data, container)
{
	/* Plot a bar chart for each item in data */
	/* Prepare data */
	var d = [];
	var series = [];
	var ticks = [];

	for(var e in data) {
		d.push(count_instances(data[e]));
		series.push({label:e});
	}
	for(var i in d[0]) {
		ticks.push(i);
	}

	/* Create a div instance to render the chart in */
	$('<div/>', {id: container + '_bar', class: 'chart'}).appendTo($('#' + container));

	var plot1 = $.jqplot(container + '_bar', d, {
		seriesDefaults:{
			renderer:$.jqplot.BarRenderer,
			rendererOptions: {fillToZero: true}
		},
		series: series,
		legend: {
			show: true,
			placement: 'outsideGrid'
			},
		axes: {
			xaxis: {
				renderer: $.jqplot.CategoryAxisRenderer,
				ticks: ticks
			},
			yaxis: {
				pad: 1.05,
				tickOptions: {formatString: '%d'}
			}
		}
		});

	$('<div/>', {id: container + '_data', class: 'chart-data'}).appendTo($('#' + container));
	/* Bind a data click to show information */
	$('#' + container + '_bar').bind('jqplotDataClick',
	                         function (ev, seriesIndex, pointIndex, data) {
		                         var d = data.toString().split(',');
		                         $('#' + container + '_data').html(d[0] + ': ' + d[1]);
	                         }
		);
};

/*
  Use label to retreive certain dataset from data
 */
var extract_data = function(label, data)
{
	if(label instanceof Array) {
		/* Multiple items to be returned */
		var t = {};
		label.forEach(function(l) {
				var dl = [];
				data.forEach(function(el) {
						if(el[l]) {
							dl.push(el[l]);
						}
					});
				t[l] = dl;
			});
		return t;
	}
	else {
		var t = {};
		var d = [];
		data.forEach(function(el) {
				if(el[label]) {
					d.push(el[label]);
				}
			});
		t[label] = d;
		return t;
	}
};

/* Create a map element using GoogleMaps API based on the passed data */
/* Send either object with 'latitude' and 'longitude' pairs or address to geocode */
var map = function(data, container)
{
	/* Create a div instance to render the map in */
	$('<div/>', {id: container + '_view', class: 'map-view'}).appendTo($('#' + container));

	/* Create a new map element */
	$('<div/>', {id: container + '_map', class: 'map'}).appendTo($('#' + container + '_view'));
	/* Create a new unordered list element */
	$('<ul/>', {id: container + '_ul'}).appendTo($('#' + container + '_view'));

	/* Create new map and create a global refence to it */
	gmaps[container] = new google.maps.Map($('#' + container + '_map')[0], {zoom: 5, mapTypeId: google.maps.MapTypeId.ROADMAP});

	if(data['longitude'] && data['latitude']) {
		for(var i in data['latitude']) {
			var latlng = new google.maps.LatLng(data['latitude'][i], data['longitude'][i]);
			console.log(latlng);
			gmaps[container].setCenter(latlng);
			var marker = new google.maps.Marker({
				map: gmaps[container],
				position: latlng
				});
			/* List item links */
			$('<li/>', {text: data['user'][i],
						onClick: 'gmaps[\'' + container + '\'].panTo(new google.maps.LatLng(' + data['latitude'][i] + ',' + data['longitude'][i] + '));'}).appendTo($('#' + container + '_ul'));
		}
	}
	else {
		/* Assume GeoCode is required */
		var geocoder = new google.maps.Geocoder();
		for(var e in data) {
			for(var i in data[e]) {
				geocoder.geocode({'address': data[e][i]}, function(results, status) {
						if(status == google.maps.GeocoderStatus.OK) {
							/* Create a new marker and a new list item */
							gmaps[container].setCenter(results[0].geometry.location);
							var marker = new google.maps.Marker({
								map: gmaps[container],
								position: results[0].geometry.location
								});
							/* List item links */
							$('<li/>', {text: results[0].address_components[0].long_name,
										onClick: 'gmaps[\'' + container + '\'].panTo(new google.maps.LatLng(' + results[0].geometry.location.Za + ',' + results[0].geometry.location.$a + '));'}).appendTo($('#' + container + '_ul'));
						}
						else {
							console.log('error: ' + status);
						}
					});
			}
		}
	}
};

/* Create correct data structure and create containers -
   for instance of jqPlot PieChart
*/
var pie_chart = function(data, container)
{
        /* Arrange data to required format */
	/* Array of Arrays [ ['label', value] ... ] */
	for(var e in data) {
		var d = count_instances(data[e]);

		/* Create a div instance to render the chart in */
		$('<div/>', {id: e + '_pie', class: 'chart'}).appendTo($('#' + container));

		var plot1 = $.jqplot(e + '_pie', [d], {
			seriesDefaults: {
				// Make this a pie chart.
				renderer: jQuery.jqplot.PieRenderer,
				rendererOptions: {
					showDataLabels: true
					}
			},
			legend: { show:true, location: 'e' }
			}
			);

		$('<div/>', {id: e + '_data', class: 'chart-data'}).appendTo($('#' + container));
		/* Bind a data click to show information */
		$('#' + e + '_pie').bind('jqplotDataClick',
		                         function (ev, seriesIndex, pointIndex, data) {
			                         var d = data.toString().split(',');
			                         $('#' + e + '_data').html(d[0] + ': ' + d[1]);
		                         }
			);
	}
};

/* Generate table view of all data from data.json */
var populate_table = function(data)
{
	var tbl = $('<table/>', {class: 'tbl', id: 'tbl'});
	/* Setup table headers */
	var thead = $('<thead/>');
	var row = $('<tr/>');
	for(var i in data[0]) {
		row.append($('<th/>', {text: i, scope: 'col'}));
	}
	thead.append(row);
	tbl.append(thead);

	/* Table content */
	var tbody = $('<tbody/>');
	var count = 0;
	for(var i in data) {
		var row = $('<tr/>', {class: (++count % 2) ? 'odd' : 'even'});
		for(var j in data[i]) {
			switch(typeof(data[i][j])) {
				case 'string':
				case 'number':
				case 'boolean':
					row.append($('<td/>', {text: data[i][j]}));
					break;
				case 'object':
					if(data[i][j] === null) {
						row.append($('<td/>', {text: ''}));
						break;
					}
					if(data[i][j].questionId){
						switch(typeof(data[i][j].response)) {
							case 'object':
								row.append($('<td/>', {text: data[i][j].response.join(', ')}));
								break;
							case 'string':
								row.append($('<td/>', {text: data[i][j].response.substr(0, 15) + '...', title: data[i][j].response}));
								break;
							default:
								console.warn('Unknown type: ' + data[i][j].reponse + ' - ' + typeof(data[i][j].response));
								break;
						}
					}
					break;
				default:
					   console.warn('Unknown type: ' + data[i][j] + ' - ' + typeof(data[i][j]));
					break;
			}
		}
		tbody.append(row);
	}
	tbl.append(tbody);
	$('#data').append(tbl);
	$('#tbl').tablesorter();
};

/* Return array of label:data pairs
   Count instances of occurences in a
 */
var count_instances = function(a)
{
	var d = [];
	a.sort();

	var count = 1;
	for(var i in a) {
		if(a[i] != a[i-1]) {
			if((i-1) >= 0) {
				d.push([a[i-1], count]);
			}
			count = 1;
		}
		else {
			++count;
		}
	}
	d.push([a[a.length-1], count]);

	return d;
}