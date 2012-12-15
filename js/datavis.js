/*
 */

var data_url = 'data/data.json';
var tmp;
$(document).ready(function() {
		$.getJSON(data_url,
		          function(data) {
			          populate_table(data);

			          /* Gender Pie Chart */
			          pie_chart(extract_data('gender', data), 'gender');

			          /* fav_brand Pie Chart */
			          pie_chart(extract_data('fav_brand', data), 'fav_brand');

			          /* device Pie Chart */
			          pie_chart(extract_data('device', data), 'device');

			          /* Create global pointer, to make debugging easier */
			          tmp = data;
		          });
	});

/*
  Use label to retreive certain dataset from data
 */
var extract_data = function(label, data)
{
	if(label instanceof Array) {
		/* Multiple items to be returned */
		var d = [];
		label.forEach(function(l) {
				var dl = [];
				data.forEach(function(el) {
						if(el[l]) {
							dl.push(el[l]);
						}
					});
				d.push({'label': l, 'data': dl});
			});
		return d;
	}
	else {
		var d = [];
		data.forEach(function(el) {
				if(el[label]) {
					d.push(el[label]);
				}
			});
		return {label: label, data: d};
	}
};

var pie_chart = function(data, container)
{
        /* Arrange data to required format */
	/* Array of Arrays [ ['label', value] ... ] */
	var d = [];
	var a = data.data;
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

	/* Create a div instance to render the chart in */
	$('<div/>', {id: container + '_pie', class: 'pie-chart'}).appendTo($('#' + container));

	var plot1 = $.jqplot(container + '_pie', [d], {
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

	$('<div/>', {id: container + '_data', class: 'click-data'}).appendTo($('#' + container));
	/* Bind a data click to show information */
	$('#' + container + '_pie').bind('jqplotDataClick',
	                                 function (ev, seriesIndex, pointIndex, data) {
		                                 var d = data.toString().split(',');
		                                 $('#' + container + '_data').html(d[0] + ': ' + d[1]);
	                                 }
		);
};

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
								row.append($('<td/>', {text: data[i][j].response}));
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
