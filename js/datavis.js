/*
 */

var data_url = 'data/data.json';

$(document).ready(function() {
		$.getJSON(data_url,
		          function(data) {
			          populate_table(data);
		          });
	});

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
