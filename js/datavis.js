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

			          /* Device Pie Chart */
			          //pie_chart(extract_data('device', data), 'device');

			          /* Slider Bar Chart */
			          bar_chart(extract_data('slider', data), 'slider');

			          /* Check Box */

			          /* Latitude and Longitude Map */
			          //map(extract_data(['latitude', 'longitude', 'user'], data), 'latitude_longitude');

			          /* Create global pointer, to make debugging easier */
			          tmp = data;
		          });
	});

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