window.onload = function() {

	if ( ( isIE() && isIE() <= 9 ) || isTablet() ) {
		window.smoothScroll = new SmoothScroll( false );
	}
	else {
		window.smoothScroll = new SmoothScroll( true );
	}

	// setTimeout( function() { setItemFixedStatus(); }, 1000)
}

function transformer(el, value) {
	el.style.webkitTransform = value;
	el.style.mozTransform = value;
	el.style.msTransform = value;
	el.style.oTransform = value;
}

function SmoothScroll( isFakeScroll ) {
	this.el = document.querySelector('.js-smooth-scroll');

	if( this.el == void 0 ) { return; }

	this.onResize 				= this.onResize.bind( this );
	this.onClick				= this.onClick.bind( this );
	this.onFakeScroll			= this.onFakeScroll.bind( this );
	this.onScroll				= this.onScroll.bind( this );
	this.render					= this.render.bind( this );
	this.setCurrentScrollValue	= this.setCurrentScrollValue.bind( this );
	this.setScrollValue			= this.setScrollValue.bind( this );

	this.easing = 0.1;
	this.width 	= 0;
	this.height = 0;
	this.winWidth 	 = 0;
	this.winHeight 	 = 0;
	this.scrollValue = 0;
	this.currentScrollValue = 0;
	this.lastScrollValue 	= 0;
	this.isFakeScroll 		= isFakeScroll != void 0 ? isFakeScroll : true;
	this.isActive 	 = this.isFakeScroll;

	this.getSizes();

	this.fixedElements = initFixedElements( this );
	this.anchors = initAnchors( this );

	this.scrollbar = new Scrollbar( this );

	console.log('smoothscroll ready');

	this.render();

	if( this.isFakeScroll ) {

		document.body.classList.add('is-smooth-scroll');

		window.scrollTo(0, 0);
		window.addEventListener('touchmove', this.preventMobile, {passive: false});

		VirtualScroll.on( this.onFakeScroll );
	}
	else {
		window.addEventListener('scroll', this.onScroll);
	}

	window.addEventListener('click', this.onClick); // basically to debug stuffs

};

SmoothScroll.prototype.getSizes = function() {
	this.width 	= this.el.offsetWidth;
	this.height = this.el.offsetHeight;


	this.winWidth  = window.innerWidth;
	this.winHeight = window.innerHeight;

	this.scrollMax = this.height - this.winHeight;
};

SmoothScroll.prototype.onResize = function() {
	this.getSizes();
	this.scrollbar.onResize();

	for( var i = 0 ; i < this.fixedElements.length ; i++ ) {
		this.fixedElements[i].onResize();
	}

	for( var i = 0 ; i < this.anchors.length ; i++ ) {
		this.anchors[i].onResize();
	}
};

SmoothScroll.prototype.onFakeScroll = function( event ) {
	this.scrollValue += event.deltaY;
}

SmoothScroll.prototype.onScroll = function( event ) {
	this.scrollValue = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
}

SmoothScroll.prototype.render = function() {
	if( !this.isActive ) { return; }

	this.scrollValue = Math.max( -this.scrollMax, this.scrollValue);
	this.scrollValue = Math.min(0, this.scrollValue);

	this.currentScrollValue += ( this.scrollValue - this.currentScrollValue ) * this.easing;

	if( this.currentScrollValue < this.lastScrollValue - 1 || this.currentScrollValue > this.lastScrollValue + 1 ) {
		transformer( this.el, 'translateY(' + (this.currentScrollValue) + 'px) translateZ(0)' );
	}


	this.scrollbar.render();

	this.lastScrollValue = this.currentScrollValue;

	requestAnimationFrame( this.render );
}

SmoothScroll.prototype.onClick = function() {
	// this.isActive = !this.isActive;
}

SmoothScroll.prototype.preventMobile = function(event) {
	event.preventDefault();
}

SmoothScroll.prototype.setCurrentScrollValue = function( value ) {
	this.currentScrollValue = value;
	this.scrollValue 		= value;

	return value;
}

SmoothScroll.prototype.setScrollValue = function( value ) {
	this.scrollValue = value;

	return value;
}


function initAnchors( smoothScroll ) {
	var itemsEl = document.querySelectorAll('.js-anchor');
	var items = new Array();

	if( itemsEl == void 0 || itemsEl.length == 0 ) { return; }

	for( var i = 0 ; i < itemsEl.length ; i++ ) {
		items.push( new Anchor( itemsEl[i], smoothScroll ) );
	}

	return this.items;
}


function Anchor( el, smoothScroll ) {
	this.onClick  = this.onClick.bind( this );
	this.onResize = this.onResize.bind( this );

	this.el = el;
	this.targetId 	= this.el.getAttribute( 'data-anchor' );
	this.target 	= document.querySelector( '#' + this.targetId );
	this.targetTop 	= 0;
	this.scroll 	= smoothScroll;

	this.onResize();

	this.el.addEventListener('click', this.onClick);
}

Anchor.prototype.onClick = function( event ) {
	event.preventDefault();

	if( this.target == void 0 ) { return; }

	this.scroll.setScrollValue( -this.targetTop );
}

Anchor.prototype.onResize = function( event ) {
	if( this.target != void 0 ) {
		this.targetTop = getAbsolutePosition( this.target );
	}
}


function Scrollbar( scroll ) {

	this.onResize 		= this.onResize.bind( this );
	this.render  		= this.render.bind( this );
	this.onMouseMove  	= this.onMouseMove.bind( this );
	this.onMouseUp  	= this.onMouseUp.bind( this );
	this.onMouseDown  	= this.onMouseDown.bind( this );

	this.isActive 	= true;
	this.isVisible 	= true;
	this.scroll 	= scroll;
	this.container 	= document.getElementById( 'scrollbar-container' );
	this.el 		= document.getElementById( 'scrollbar' );
	this.scaleY 	= 1;

	if( this.el == void 0 || this.container == void 0 ) { return; }

	this.styles();
	this.onResize();

	this.container.addEventListener('mousedown', this.onMouseDown);
	window.addEventListener('mouseup', this.onMouseUp)
	window.addEventListener('mousemove', this.onMouseMove)
}

Scrollbar.prototype.onResize = function() {
	this.scaleY = this.scroll.winHeight / this.scroll.height;

	transformer( this.el, 'scale(1,' + this.scaleY + ') translate3d( 0, 0, 0)' );
}

Scrollbar.prototype.render = function() {
	transformer( this.el, 'scale(1,' + this.scaleY + ') translate3d( 0, ' + -this.scroll.currentScrollValue + 'px, 0)' );
}

Scrollbar.prototype.onMouseDown = function( event ) {
	this.isMouseDown = true;

	this.setScrollPosition( event );
}

Scrollbar.prototype.onMouseUp = function() {
	this.isMouseDown = false;
}

Scrollbar.prototype.onMouseMove = function( event ) {
	if( !this.isMouseDown ) { return; }

	this.setScrollPosition( event );
}

Scrollbar.prototype.setScrollPosition = function( event ) {
	var position = event.clientY / this.scaleY;

	position -= this.scaleY * this.scroll.height * .5;

	// this.scroll.setCurrentScrollValue( -position );

	this.scroll.setScrollValue( -position );
}



Scrollbar.prototype.styles = function() {
	this.container.style.position 	= 'absolute';
	this.container.style.top 		= 0;
	this.container.style.right 		= 0;
	this.container.style.height 	= '100vh';
	this.container.style.width 		= '10px';

	this.el.style.position 	= 'absolute';
	this.el.style.top 		= 0;
	this.el.style.left 		= 0;
	this.el.style.height 	= '100%';
	this.el.style.width 	= '100%';
	this.el.style.transformOrigin = '50% 0';

	if( !this.scroll.isFakeScroll ) {
		this.container.style.display = 'none';
		this.el.style.display = 'none';
	}
}


function initFixedElements( smoothScroll ) {
	this.els 	= document.querySelectorAll('.js-fixed-element');
	this.items 	= new Array();

	if( this.els == void 0 || this.els.length == 0 ) { return; }

	for( var i = 0 ; i < this.els.length ; i++ ) {
		this.items.push( new ItemFixed( this.els[i], smoothScroll ) );
	}

	return this.items;
}

function setItemFixedStatus( el, status ) {

	for( var i = 0 ; i < window.smoothScroll.fixedElements.length ; i++ ) {
		if( window.smoothScroll.fixedElements[i] === el && typeof status === 'boolean' ) {
			window.smoothScroll.fixedElements[i] = status;
			return;
		}
	}
}

function ItemFixed( el, smoothScroll ) {
	this.update 	= this.update.bind( this );
	this.onResize 	= this.onResize.bind( this );

	this.el 			= el;
	this.scroll 		= smoothScroll;
	this.containerId 	= this.el.getAttribute('data-container-id');
	this.container 		= { top: 0, height: 0 };
	this.isActive 		= this.el.getAttribute('data-is-fixed');

	if( this.containerId != void 0 ) {
		this.containerEl = document.querySelector( '#' + this.containerId );
	}

	this.onResize();
	this.update();
}


ItemFixed.prototype.onResize = function() {
	this.top 			= this.el.offsetTop;
	this.height 		= this.el.offsetHeight;
	this.bottomPosition = this.top + this.height;

	if( !this.scroll.isFakeScroll && this.containerId == void 0 ){ this.setFixedPosition(); }

	if( this.containerId == void 0 ) { return; }

	this.container.top 		= getAbsolutePosition( this.containerEl ) - this.scroll.currentScrollValue;
	this.container.height 	= this.containerEl.offsetHeight;
}	

ItemFixed.prototype.setFixedPosition = function() {
	this.el.style.position = "fixed";
	this.el.style.top = this.top + 'px';
	this.el.style.left = this.el.offsetLeft + 'px';
}


ItemFixed.prototype.update = function() {
	this.checkStatus();

	if( this.isActive ) {

		var scrollValue = 0;

		if( this.scroll.isFakeScroll ) {
			scrollValue = -this.scroll.currentScrollValue;
		}
		else {
			scrollValue = this.scroll.scrollValue;
		}

		// IF NO WRAPPER
		if( this.containerId != void 0 ) {
			var delta = scrollValue - this.container.top;
			var marginBottom = this.container.height - this.bottomPosition;

			// IF FAKESCROLL
			if( this.scroll.isFakeScroll ) {
				if( delta < marginBottom && delta > 0 ) {
					transformer( this.el, 'translateY(' + delta +'px)' );
				}
				else if ( delta > marginBottom ) {
					transformer( this.el, 'translateY(' + marginBottom +'px)' );
				}
				else if( delta < 0 ) {
					transformer( this.el, 'translateY(0)' );
				}
			}
			// IF NO FAKESCROLL
			else {
				if( delta < marginBottom && delta > 0 ){
					transformer( this.el, 'translateY(' + delta +'px)' );
				}
				else if ( delta > marginBottom ) {
					transformer( this.el, 'translateY(' + marginBottom +'px)' );
				}
				else if( delta < 0 ) {
					transformer( this.el, 'translateY(0)' );
				}
			}
		}
		// IF WRAPPER
		else {
			if( this.scroll.isFakeScroll ) {
				var delta = scrollValue;

				transformer( this.el, 'translateY(' + delta +'px) translateZ(0)' );
			}
		}
	}

	if( this.scroll.isFakeScroll ) {
		requestAnimationFrame( this.update );
	}
	// FALLBACK IE9
	else {
		setTimeout( this.update, 17 );
	}
}

ItemFixed.prototype.checkStatus = function() {
	var isActive = this.el.getAttribute('data-is-fixed');

	if( isActive == null || isActive == void 0 || isActive == 'false' ) {
		isActive = false;
	}
	else if( isActive == true || isActive == 'true' ) {
		isActive = true;
	}

	this.isActive = isActive;
}

function getAbsolutePosition( el ) {
	var bodyRect = document.body.getBoundingClientRect(),
	elemRect = el.getBoundingClientRect(),
	offset   = elemRect.top - bodyRect.top;

	return offset;
}


var VirtualScroll = (function(document) {
	var vs = {};
	var numListeners, listeners = [], initialized = false;
	var touchStartX, touchStartY;
	// [ These settings can be customized with the options() function below ]
	// Mutiply the touch action by two making the scroll a bit faster than finger movement
	var touchMult = 2;
	// Firefox on Windows needs a boost, since scrolling is very slow
	var firefoxMult = 15;
	// How many pixels to move with each key press
	var keyStep = 120;
	// General multiplier for all mousehweel including FF
	var mouseMult = 1;
	var bodyTouchAction;
	var hasWheelEvent = 'onwheel' in document;
	var hasMouseWheelEvent = 'onmousewheel' in document;
	var hasTouch = 'ontouchstart' in document;
	var hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
	var hasPointer = !!window.navigator.msPointerEnabled;
	var hasKeyDown = 'onkeydown' in document;
	var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
	var event = {
		y: 0,
		x: 0,
		deltaX: 0,
		deltaY: 0,
		originalEvent: null
	};
	vs.on = function(f) {
		if(!initialized) initListeners(); 
		listeners.push(f);
		numListeners = listeners.length;
	}
	vs.options = function(opt) {
		keyStep = opt.keyStep || 120;
		firefoxMult = opt.firefoxMult || 15;
		touchMult = opt.touchMult || 2;
		mouseMult = opt.mouseMult || 1;
	}
	vs.off = function(f) {
		listeners.splice(f, 1);
		numListeners = listeners.length;
		if(numListeners <= 0) destroyListeners();
	}
	var notify = function(e) {
		event.x += event.deltaX;
		event.y += event.deltaY;
		event.originalEvent = e;
		for(var i = 0; i < numListeners; i++) {
			listeners[i](event);
		}
	}
	var onWheel = function(e) {
		// In Chrome and in Firefox (at least the new one)
		event.deltaX = e.wheelDeltaX || e.deltaX * -1;
		event.deltaY = e.wheelDeltaY || e.deltaY * -1;
		// for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad 
		// real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
		if(isFirefox && e.deltaMode == 1) {
			event.deltaX *= firefoxMult;
			event.deltaY *= firefoxMult;
		} 
		event.deltaX *= mouseMult;
		event.deltaY *= mouseMult;
		notify(e);
	}
	var onMouseWheel = function(e) {
		// In Safari, IE and in Chrome if 'wheel' isn't defined
		event.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
		event.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;
		notify(e);	
	}
	var onTouchStart = function(e) {
		var t = (e.targetTouches) ? e.targetTouches[0] : e;
		touchStartX = t.pageX;	
		touchStartY = t.pageY;
	}
	var onTouchMove = function(e) {
		// e.preventDefault(); // < This needs to be managed externally
		var t = (e.targetTouches) ? e.targetTouches[0] : e;
		event.deltaX = (t.pageX - touchStartX) * touchMult;
		event.deltaY = (t.pageY - touchStartY) * touchMult;
		
		touchStartX = t.pageX;
		touchStartY = t.pageY;
		notify(e);
	}
	var onKeyDown = function(e) {
		// 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
		event.deltaX = event.deltaY = 0;
		switch(e.keyCode) {
			case 37:
				event.deltaX = -keyStep;
				break;
			case 39:
				event.deltaX = keyStep;
				break;
			case 38:
				event.deltaY = keyStep;
				break;
			case 40:
				event.deltaY = -keyStep;
				break;
		}
		notify(e);
	}
	var initListeners = function() {
		if(hasWheelEvent) document.addEventListener("wheel", onWheel);
		if(hasMouseWheelEvent) document.addEventListener("mousewheel", onMouseWheel);
		if(hasTouch) {
			document.addEventListener("touchstart", onTouchStart);
			document.addEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			bodyTouchAction = document.body.style.msTouchAction;
			document.body.style.msTouchAction = "none";
			document.addEventListener("MSPointerDown", onTouchStart, true);
			document.addEventListener("MSPointerMove", onTouchMove, true);
		}
		if(hasKeyDown) document.addEventListener("keydown", onKeyDown);
		initialized = true;
	}
	var destroyListeners = function() {
		if(hasWheelEvent) document.removeEventListener("wheel", onWheel);
		if(hasMouseWheelEvent) document.removeEventListener("mousewheel", onMouseWheel);
		if(hasTouch) {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			document.body.style.msTouchAction = bodyTouchAction;
			document.removeEventListener("MSPointerDown", onTouchStart, true);
			document.removeEventListener("MSPointerMove", onTouchMove, true);
		}
		if(hasKeyDown) document.removeEventListener("keydown", onKeyDown);
		initialized = false;
	}
	return vs;

})(document);

function isIE () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

function isTablet() {
	return (window.matchMedia("(max-width: 1081px)").matches);
}