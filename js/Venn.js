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
			this.containers = [];

			/* Check if passed any parameters */
			if(typeof params == 'undefined') {
				params = {};
			}

			/* Default parameters */

			/* Colors of containers */
			this.colors = params['colors'] || ['rgba(255, 0, 0, 1)',
			                                   'rgba(0, 255, 0, 1)',
			                                   'rgba(0, 0, 255, 1)'];

			/* Largest diameter of Container */
			this.max_size = params['max_size'] || 200;

			/* Scale containers and elements based on distribution */
			this.container_scale = params['container_scale'] || false;
			this.element_scale = params['element_scale'] || false;

			/* Output type (svg only at the moment) */
			this.type = params['type'] || 'svg';
		}

/* Pass either a set of data points of single objects
   eg. {label:'', data:[0,1,2,3]}
*/
		Venn.prototype.addData = function(d)
		{
			console.log(d);
			if(d instanceof Array) {
				this.data = d;
			}
			else {
				this.data.push(d);
			}
			return true;
		};

/*
  Output Venn Diagram to div
*/
		Venn.prototype.draw = function(div)
		{
			console.log('DRAW: ' + div);
			return true;
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

		Circle.prototype.setRaduis = function(radius)
		{
			this.radius = radius;
			return true;
		};
		Circle.prototype.getRaidus = function()
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
			return true;
		};


		return Element;
	})();
