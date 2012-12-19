/*
  Weighted Circles with Pie Chart
  Display data in weighted circles with Pie Chart displaying secondary data
  Dave Stevens
 */

wCirclesPie = (function(params) {
		function wCirclesPie(params) {
			/* Check if passed any parameters */
			if(typeof params == 'undefined') {
				params = {};
			}

			this.radius = params['radius'] || 100;
			this.padding = params['padding'] || 0;
			this.width = 0;
			this.height = 0;
			this.d = [];
		}

		wCirclesPie.prototype.data = function(data)
		{
			var total = 0;
			for(var i in data) {
				var size = 0;
				for(var j in data[i]) {
					size += data[i][j];
				}
				total += size;
				this.d[i] = {'size': size, 'radius': '', data: data[i]};
			}

			/* Find largest */
			var lsize = 0;
			for(var i in this.d) {
				lsize = (this.d[i].size > lsize) ? this.d[i].size : lsize;
			}
			var larea = (Math.PI * Math.pow(this.radius, 2));

			/* Calculate weight of each circle */
			for(var i in this.d) {
				this.d[i].radius = Math.floor(Math.sqrt((larea * (this.d[i].size / lsize)) / Math.PI));
			}

			this.position();
		};

		wCirclesPie.prototype.position = function()
		{
			for(var i in this.d) {
				for(var t=0;t<this.radius * 50;t+=0.2) {
					var c = {'x': (t * Math.cos(t)),
					         'y': (t * Math.sin(t)),
					         'r': this.d[i].radius
					};
					/* check that there are no collisions */
					if(!this.collision(c)) {
						/* connect to toPlaced object */
						this.d[i].pos = c;
						break;
					}
				}
			}
			/* Calculate bounding box */
			var x_max = -200;
			var y_max = -200;
			var x_min = 200;
			var y_min = 200;
			for(var i in this.d) {
				x_max = ((this.d[i].pos.x + this.d[i].radius) > x_max) ? (this.d[i].pos.x + this.d[i].radius) : x_max;
				x_min = ((this.d[i].pos.x - this.d[i].radius) < x_min) ? (this.d[i].pos.x - this.d[i].radius) : x_min;
				y_max = ((this.d[i].pos.y + this.d[i].radius) > y_max) ? (this.d[i].pos.y + this.d[i].radius) : y_max;
				y_min = ((this.d[i].pos.y - this.d[i].radius) < y_min) ? (this.d[i].pos.y - this.d[i].radius) : y_min;
			}
			this.width = ((x_max > Math.abs(x_min)) ? x_max : Math.abs(x_min)) * 2;
			this.height = (y_max + Math.abs(y_min));

			/* position items relative to this width and height */
			for(var i in this.d) {
				this.d[i].pos.x = (this.d[i].pos.x - this.d[i].radius) + (this.width/2);
				this.d[i].pos.y = (this.d[i].pos.y - this.d[i].radius) + Math.abs(y_min);
			}
		};

		/* Return 1 for collision, 0 for success */
		wCirclesPie.prototype.collision = function(c)
		{
			for(var i in this.d) {
				if(this.d[i].pos) {
					var dis = Math.sqrt(Math.pow(this.d[i].pos.x - c.x, 2) + Math.pow(this.d[i].pos.y - c.y, 2));
					if((dis - this.padding) <= (this.d[i].radius + c.r)) {
						return 1;
					}
				}
			}
			return 0;
		};

		wCirclesPie.prototype.draw = function()
		{
			var div = $('<div/>', {width: this.width + 'px', height: this.height + 'px', css: {position: 'relative', margin: '0 auto'}});
			var leg = [];
			for(var i in this.d) {
				var cir = $('<div/>', {class: 'wCirclePie',
				                       css:
				                       {'top': this.d[i].pos.y,
				                        'left': this.d[i].pos.x,
				                        'width': this.d[i].radius * 2,
				                        'height': this.d[i].radius * 2,
				                       }});
				/* Generate the Slices */
				/* Work on 360 degree */
				var total = 0;
				for(var j in this.d[i].data) {
					/* Generate Legend */
					if(leg[j] === undefined) {
						leg[j] = 1;
					}
					var per = this.d[i].data[j] / this.d[i].size;
					if((total < 180) && ((total + (per * 360)) > 180) && ((per * 360) > 180)) {
						/* Needs splitting into two sections */
						/* First create the upto 180 section */
						var sec2 = Math.abs(180 - (per * 360));
						var sec1 = (per * 360) - sec2;

						var slice = $('<div/>', {class: 'slice',
						                         css: {'-webkit-transform': 'rotate(' + total + 'deg)',
						                               '-moz-transform': 'rotate(' + total + 'deg)',
						                               '-o-transform': 'rotate(' + total + 'deg)',
						                               'transform': 'rotate(' + total + 'deg)',
						                               'width': (this.d[i].radius * 2),
						                               'height': (this.d[i].radius * 2),
						                               'clip': 'rect(0px ' + (this.d[i].radius * 2) + 'px '  + (this.d[i].radius * 2) + 'px ' + this.d[i].radius + 'px)'}});
						var pie = $('<div/>', {class: 'pie ' + j,
						                       css: {'-webkit-transform': 'rotate(' + sec1 + 'deg)',
						                             '-moz-transform': 'rotate(' + sec1 + 'deg)',
						                             '-o-transform': 'rotate(' + sec1 + 'deg)',
						                             'transform': 'rotate(' + sec1 + 'deg)',
						                             'width': (this.d[i].radius * 2),
						                             'height': (this.d[i].radius * 2),
						                             'clip': 'rect(0px, ' + this.d[i].radius + 'px, ' + (this.d[i].radius * 2) + 'px, 0px)'}});
						slice.append(pie);
						cir.append(slice);

						/* Then the rest */
						var slice = $('<div/>', {class: 'slice',
						                         css: {'-webkit-transform': 'rotate(' + (total + sec1) + 'deg)',
						                               '-moz-transform': 'rotate(' + (total + sec1) + 'deg)',
						                               '-o-transform': 'rotate(' + (total + sec1) + 'deg)',
						                               'transform': 'rotate(' + (total + sec1) + 'deg)',
						                               'width': (this.d[i].radius * 2),
						                               'height': (this.d[i].radius * 2),
						                               'clip': 'rect(0px ' + (this.d[i].radius * 2) + 'px '  + (this.d[i].radius * 2) + 'px ' + this.d[i].radius + 'px)'}});
						var pie = $('<div/>', {class: 'pie ' + j,
						                       css: {'-webkit-transform': 'rotate(' + sec2 + 'deg)',
						                             '-moz-transform': 'rotate(' + sec2 + 'deg)',
						                             '-o-transform': 'rotate(' + sec2 + 'deg)',
						                             'transform': 'rotate(' + sec2 + 'deg)',
						                             'width': (this.d[i].radius * 2),
						                             'height': (this.d[i].radius * 2),
						                             'clip': 'rect(0px, ' + this.d[i].radius + 'px, ' + (this.d[i].radius * 2) + 'px, 0px)'}});
						slice.append(pie);
						cir.append(slice);
					}
					else {
						var slice = $('<div/>', {class: 'slice',
						                         css: {'-webkit-transform': 'rotate(' + total + 'deg)',
						                               '-moz-transform': 'rotate(' + total + 'deg)',
						                               '-o-transform': 'rotate(' + total + 'deg)',
						                               'transform': 'rotate(' + total + 'deg)',
						                               'width': (this.d[i].radius * 2),
						                               'height': (this.d[i].radius * 2),
						                               'clip': 'rect(0px ' + (this.d[i].radius * 2) + 'px '  + (this.d[i].radius * 2) + 'px ' + this.d[i].radius + 'px)'}});
						var pie = $('<div/>', {class: 'pie ' + j,
						                       css: {'-webkit-transform': 'rotate(' + (per * 360) + 'deg)',
						                             '-moz-transform': 'rotate(' + (per * 360) + 'deg)',
						                             '-o-transform': 'rotate(' + (per * 360) + 'deg)',
						                             'transform': 'rotate(' + (per * 360) + 'deg)',
						                             'width': (this.d[i].radius * 2),
						                             'height': (this.d[i].radius * 2),
						                             'clip': 'rect(0px, ' + this.d[i].radius + 'px, ' + (this.d[i].radius * 2) + 'px, 0px)'}});
						slice.append(pie);
						cir.append(slice);
					}
					total += (per * 360);
				}
				var label = $('<p/>', {text: i,
				                       class: 'wLabelPie',
				                       css: {'padding-top': this.d[i].radius + 'px',
				                             'width': (this.d[i].radius * 2)}});
				cir.append(label);
				div.append(cir);
			}

			/* Create legend */
			var legend = $('<div/>', {class: 'legend'});
			for(var i in leg) {
				var label = $('<div/>', {class: 'legend-label', text: i});
				var color = $('<div/>', {class: i + ' legend-color'});
				legend.append(color, label);
			}
			div.append(legend);
			return div;
		};

		return wCirclesPie;
	})();
