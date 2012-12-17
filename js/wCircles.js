/*
  Weighted Circles
  Display data in weighted circles
  Dave Stevens
 */

wCircles = (function(params) {
		function wCircles(params) {
			/* Check if passed any parameters */
			if(typeof params == 'undefined') {
				params = {};
			}

			this.radius = params['radius'] || 100;
			this.padding = params['padding'] || 0;
			this.colors = params['colors'] || ['rgba(255, 0, 0, 0.5)',
			                                   'rgba(0, 255, 0, 0.5)',
			                                   'rgba(0, 0, 255, 0.5)'];
			this.border_color = params['border_color'] || 'rgba(0, 0, 0, 1)';
			this.width = 0;
			this.height = 0;
			this.d = [];
		}

		wCircles.prototype.data = function(data)
		{
			var total = 0;
			for(var i in data) {
				total += data[i][1];
				this.d[data[i][0]] = {'size': data[i][1], 'radius': ''};
			}

			/* Calculate weight of each circle based on percentage of total */
			var lsize = data[0][1];
			var larea = (Math.PI * Math.pow(this.radius, 2));

			for(var i in this.d) {
				this.d[i].radius = Math.sqrt((larea * (this.d[i].size / lsize)) / Math.PI);
			}

			this.position();
		};

		wCircles.prototype.position = function()
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
		wCircles.prototype.collision = function(c)
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

		wCircles.prototype.draw = function()
		{
			var div = $('<div/>', {width: this.width + 'px', height: this.height + 'px', css: {position: 'relative', margin: '0 auto'}});
			var c = 0;
			for(var i in this.d) {
				var cir = $('<div/>', {class: 'wCircle',
				                       css:
				                       {'top': this.d[i].pos.y,
				                        'left': this.d[i].pos.x,
				                        'width': this.d[i].radius * 2,
				                        'height': this.d[i].radius * 2,
				                        'background-color': this.colors[(c++)%this.colors.length]
				                       }});
				var label = $('<p/>', {text: i,
				                       class: 'wLabel',
				                       css: {'padding-top': this.d[i].radius + 'px'}});
				cir.append(label);
				div.append(cir);
			}

			return div;
		};

		return wCircles;
	})();
