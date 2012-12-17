/*
  Venn.js
  Create Venn Diagrams
  Dave Stevens
 */

/* Venn Object
   - Modify parameters
   - Position Elements and Containers
   - Composed of Container and Element objects
 */
Venn = (function(params) {
		function Venn(params) {
			/* Variables */
			this.data = [];
			this.sets = [];
			this.containers = [];
			this.elements = [];

			this.width = 0;
			this.height = 0;

			/* Check if passed any parameters */
			if(typeof params == 'undefined') {
				params = {};
			}

			/* Default parameters */

			/* Colors of containers */
			this.colors = params['colors'] || ['rgba(255, 0, 0, 0.5)',
			                                   'rgba(0, 255, 0, 0.5)',
			                                   'rgba(0, 0, 255, 0.5)'];
			this.element_color = params['elementColor'] || 'rgba(255, 255, 255, 1)';

			/* Largest diameter of Container */
			this.max_size = params['maxSize'] || 200;

			/* Size of Elements within Containers */
			this.element_size = params['elementSize'] || 20;
			this.element_padding = params['elementPadding'] || 5;

			/* Scale containers and elements based on distribution */
			this.container_scale = params['containerScale'] || true;
			this.element_scale = params['elementScale'] || false;

			/* Output type (svg only at the moment) */
			this.type = params['type'] || 'svg';
		}

/* Pass either a set of data points of single objects
   eg. {label:'', data:[0,1,2,3]}
*/
		Venn.prototype.addData = function(d)
		{
			if(d instanceof Array) {
				this.data = d;
			}
			else {
				this.data.push(d);
			}
			return true;
		};

		Venn.prototype.compute = function()
		{
			/* Sort data by largest number of items */
			this.data.sort(function(a, b) {
					if(a.data.length === b.data.length) { return 0; }
					return (a.data.length > b.data.length) ? -1 : 1;
				});

			/* Generate this.data.length containers */
			for(var i in this.data) {
				this.containers.push(new Container({label: this.data[i].label}));
			}

			/* Calculate sizes of containers */
			if(this.container_scale) {
				/* Calculate size based on number of Elements within Container */
				var total = 0;
				for(var i in this.data) {
					total += this.data[i].data.length;
				}

				var largestArea = (Math.PI * Math.pow(this.max_size, 2));
				for(var i=1;i<this.data.length;++i) {
					var diameter = Math.sqrt((largestArea * (this.data[i].data.length/this.data[0].data.length)) / Math.PI);
					this.containers[i].setRadius(diameter/2);
				}
			}

			/* Calculate sets of data (overlaps) */
			this.set = generateSets(this.data);

			/* Position Containers */
			positionContainers(this.containers, this.data, this.set, this.max_size);

			/* Generate Elements */
			/* Calculate positions of Elements */
			positionElements(this.elements, this.set, this.containers, this.element_size, this.element_padding);

			/* Calculate Size of Venn */
			for(var i in this.containers) {
				this.width = ((this.containers[i].cx + this.containers[i].radius) > this.width) ? (this.containers[i].cx + this.containers[i].radius) : this.width;
				this.height = ((this.containers[i].cy + this.containers[i].radius) > this.height) ? (this.containers[i].cy + this.containers[i].radius) : this.height;
			}
			/* Take into account border size */
			this.width += 2;
			this.height += 2;
		};
/*
  Output Venn Diagram to div
*/
		Venn.prototype.draw = function(div)
		{
			/* Create html element based on type */
			switch(this.type) {
				case 'svg':
				var el = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + this.width + 'px" height="' + this.height + 'px">';
				for(var i in this.containers) {
					this.containers[i].setBgColor(this.colors[i]);
					var c = this.containers[i].draw(this.type);
					el += c;
				}
				for(var i in this.elements) {
					this.elements[i].setBgColor(this.element_color);
					var e = this.elements[i].draw(this.type);
					el += e;
				}
				el += '</svg>';
				$('#' + div).html(el);
				break;
				default:
				console.warn('Unimplemented: ' + this.type);
				break;
			}
			/* Draw all Containers and Elements */
			return true;
		};

		var positionElements = function(elements, set, containers, element_size, padding)
		{
			/* Each set */
			for(var i in set) {
				var _in = [];
				var _out = [];
				var cx, cy, r;

				/* Calculate the centerpoint of each set */
				if(set[i].parent.length > 1) {
					/* Intersection */

					if(set[2].data.length <= 0) {
						/* Fully in container[0] */
						cx = containers[1].getCX();
						cy = containers[1].getCY();
						r = containers[1].getRadius();
					}
					else {
						/* Find center point */
						cx = containers[1].getCX() - ((containers[1].getCX() - containers[0].getCX())/2);
						cy = containers[0].getCY();
						r = (containers[0].getRadius() > containers[1].getRadius()) ? containers[1].getRadius() : containers[0].getRadius();
					}
					_in = containers;
				}
				else {
					/* Single Container */
					if(i == 0) {
						cx = containers[0].getCX();
						cy = containers[0].getCY();
						r = containers[0].getRadius();
						_in.push(containers[0]);
						_out.push(containers[1]);
					}
					else {
						cx = containers[1].getCX();
						cy = containers[1].getCY();
						r = containers[1].getRadius();
						_in.push(containers[1]);
						_out.push(containers[0]);
					}
				}

				/* Each element within each set */
				for(var j in set[i].data) {
					/* Work out position of each element */
					for(var t=0;t<r;t+=0.1) {
						var c = {'x': (t * Math.cos(t)) + cx,
						         'y': (t * Math.sin(t)) + cy,
						         'r': element_size
						};
						/* check that there are no collisions */
						if(!checkCircles(c, _in, _out, padding) && !checkCollisions(c, elements, padding)) {
							/* connect to toPlaced object */
							elements.push(new Element({'radius': c.r,
										   'label': set[i].data[j].toString(),
										   'cx': c.x,
										   'cy': c.y}));
							break;
						}
					}
				}
			}
		};

		/* Check that there are no collisions with other elements already placed */
		var checkCollisions = function(c, e, padding)
		{
			for(var i in e) {
				var dis = Math.sqrt(Math.pow(e[i].cx - c.x, 2) + Math.pow(e[i].cy - c.y, 2));
				if((dis - padding) <= (e[i].radius + c.r)) {
					return 1;
				}
			}
			return 0;
		};

		/* Check that element position is within correct circle boundaries */
		var checkCircles = function(c, _in, _out, padding)
		{
			/* Check that c is within these boundaries */
			for(var i in _in) {
				var dis = Math.sqrt(Math.pow(_in[i].cx - c.x, 2) + Math.pow(_in[i].cy - c.y, 2));
				if((dis + padding) > Math.abs(_in[i].radius -  c.r)) {
					return 1;
				}
			}
			/* Check that c is outside these boundaries */
			for(var i in _out) {
				if(_out[i]) {
					var dis = Math.sqrt(Math.pow(_out[i].cx - c.x, 2) + Math.pow(_out[i].cy - c.y, 2));
					if((dis - padding) < (_out[i].radius + c.r)) {
						return 1;
					}
				}
			}
			return 0;
		};

		var positionContainers = function(containers, data, set, max_size)
		{
			/* Positions are relative to top left corner (0, 0) */
			/* Based on overlap of Elements */
			containers[0].setCX(max_size/2);
			containers[0].setCY(max_size/2);

			if(containers.length > 1) {
				/* Place containers[1] realtive to containers[0] */
				var dis = containers[1].getRadius() +
					containers[0].getRadius();
				if(set[1].data.length > 0) {
					if(data[1].data.length <= 0) {
						/* Fully in the other Container */
						if(data[0].data.length == data[1].data.length) {
							/* Full overlap */
							dis = 10;
						}
						else {
							/* Less items causing overlap */
							var rad = containers[1].getRadius();
							dis -= (2 * rad);
						}
					}
					else {
						dis -= Math.sqrt(((Math.PI * Math.pow(containers[1].getRadius(), 2)) * (set[1].data.length/data[1].data.length))/Math.PI);
					}
				}
				containers[1].setCX(containers[0].getCX() + dis);
				containers[1].setCY(max_size/2);
			}
		};

		var generateSets = function(data)
		{
			var set = [];
			/* Create first set */
			set.push({label: data[0].label, data: data[0].data, parent: [data[0]]});

			for(var i=1;i<data.length;++i) {
				var _set = [];

				/* Loop over all other data and compare with set */
				for(var j=0;j<set.length;++j) {
					var tmp = getSimilar(data[i].data, set[j].data);
					var prnt = [data[i]];
					if(set[j].parent) {
						for(k in set[j].parent) {
							prnt.push(set[j].parent[k]);
						}
					}
					else {
						prnt.push(set[j]);
					}
					_set.push({label: data[i].label + ' & ' + set[j].label,
						   data: tmp,
								parent: prnt});
				}
				_set.push({label: data[i].label, data: data[i].data, parent: [data[i]]});
				set = set.concat(_set);
			}
			return set;
		};

		var getSimilar = function(a, b)
		{
			var ab = [];
			for(var x in a) {
				for(var y in b) {
					if(b[y] == a[x]) {
						ab.push(a[x]);
						continue;
					}
				}
			}
			/* remove from a & b */
			for(var y=0;y<(ab.length);y++) {
				for(var x=0;x<(a.length);x++) {
					if(a[x] === ab[y]) {
						a.splice(x,1);
						continue;
					}
				}
				for(var x=0;x<(b.length);x++) {
					if(b[x] === ab[y]) {
						b.splice(x,1);
						continue;
					}
				}
			}
			return ab;
		};

/* Get and Set parameters */
/* Colors for containes */
		Venn.prototype.setColors = function(colors)
		{
			this.colors = colors;
			return true;
		};
		Venn.prototype.getColors = function()
		{
			return this.colors;
		};
		Venn.prototype.setElementColor = function(color)
		{
			this.element_color = color;
			return true;
		};
		Venn.prototype.getElementColor = function()
		{
			return this.element_color;
		};

/* Max size of diameters of containers */
		Venn.prototype.setMaxSize = function(max_size)
		{
			this.max_size = max_size;
			return true;
		};
		Venn.prototype.getMaxSize = function()
		{
			return this.max_size;
		};

/* Scale size of containers based on number of elements per group */
		Venn.prototype.setContainerScale = function(scale)
		{
			this.container_scale = scale
			return true;
		};
		Venn.prototype.getContainerScale = function()
		{
			return this.container_scale;
		};

/* Scale size of elements based on values associated with them */
		Venn.prototype.setElementScale = function(scale)
		{
			this.element_scale = scale
			return true;
		};
		Venn.prototype.getElementScale = function()
		{
			return this.element_scale;
		};

/* Output in different formats */
		Venn.prototype.setType = function(type)
		{
			this.type = type;
			return true;
		};
		Venn.prototype.getType = function()
		{
			return this.type;
		};

/* Output width and height */
		Venn.prototype.getWidth = function()
		{
			return this.width;
		};
		Venn.prototype.getHeight = function()
		{
			return this.height;
		};

		return Venn;
	})();

/* Circle data
   used for both container and elements
*/
Circle = (function(params) {
		function Circle(params) {
			/* Check if passed any parameters */
			if(typeof params == 'undefined') {
				params = {};
			}

			this.radius = params['radius'] || 100;
			this.bg_color = params['bg_color'] || 'rgba(0, 0, 0, 0)';
			this.border_color = params['border_color'] || 'rgba(0, 0, 0, 1)';
			this.cx = params['cx'] || undefined;
			this.cy = params['cy'] || undefined;
			this.label = params['label'] || undefined;
		}

		Circle.prototype.setRadius = function(radius)
		{
			this.radius = radius;
			return true;
		};
		Circle.prototype.getRadius = function()
		{
			return this.radius;
		};

		Circle.prototype.setBgColor = function(bg_color)
		{
			this.bg_color = bg_color;
			return true;
		};
		Circle.prototype.getBgColor = function()
		{
			return this.bg_color;
		};

		Circle.prototype.setBorderColor = function(border_color)
		{
			this.border_color = border_color;
			return true;
		};
		Circle.prototype.getBorderColor = function()
		{
			return this.border_color;
		};

		Circle.prototype.setCX = function(cx)
		{
			this.cx = cx;
			return true;
		};
		Circle.prototype.getCX = function()
		{
			return this.cx;
		};

		Circle.prototype.setCY = function(cy)
		{
			this.cy = cy;
			return true;
		};
		Circle.prototype.getCY = function()
		{
			return this.cy;
		};

		Circle.prototype.setLabel = function(label)
		{
			this.label = label;
			return true;
		};
		Circle.prototype.getLabel = function()
		{
			return this.label;
		};

		return Circle;
	})();

/* Container
   Displays data sets
   inherits from Circle
*/
Container = (function(params) {
		function Container(params) {
			Circle.call(this, params);
		}

		Container.prototype = new Circle;
		Container.prototype.constructor = Container;

/* Return element based on type passed */
		Container.prototype.draw = function(type)
		{
			switch(type) {
				case 'svg':
				var c = '<circle cx="' + (this.cx + 1) + '" ' +
				'cy="' + (this.cy + 1) + '" ' +
				'r="' + this.radius + '" ' +
				'stroke="' + this.border_color + '" ' +
				'stroke-width="1" ' +
				'fill="' + this.bg_color + '"/>';
				return c;
				break;
				default:
				console.warn('Unsupported type: ' + type);
				break;
			}
			return true;
		};

		return Container;
	})();

/* Element
   Internal items within Container
   inherits from Circle
 */
Element = (function(params) {
		function Element(params) {
			Circle.call(this, params);
		}

		Element.prototype = new Circle;
		Element.prototype.constructor = Element;

/* Return element based on type passed */
		Element.prototype.draw = function(type)
		{
			switch(type) {
				case 'svg':
				var c = '<circle cx="' + (this.cx + 1) + '" ' +
				'cy="' + (this.cy + 1) + '" ' +
				'r="' + this.radius + '" ' +
				'stroke="' + this.border_color + '" ' +
				'stroke-width="1" ' +
				'fill="' + this.bg_color + '"/>';

				c += '<text font-family="Verdana" ' +
				'font-size="' + 10 + '" ' +
				'text-anchor="middle" ' +
				'x="' + this.cx + '" ' +
				'y="' + (this.cy + 4) + '">' +
				this.label +
				'</text>';
				return c;
				break;
				default:
				console.warn('Unsupported type: ' + type);
				break;
			}
			return true;
		};


		return Element;
	})();
