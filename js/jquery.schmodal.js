/*
 *  jQuery Schmodal 0.1
 *  
 *  Author: Shane Beliveau
 *  Website: http://shanebeliveau.com
 *
 *  Licensed under the GPL license:
 *  http://opensource.org/licenses/GPL-2.0
 *
 */

;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "schmodal",
        defaults = {
        	action			: 'load',
        	bg_close		: true,
        	close_img		: 'images/schmodal_close.png',
        	disable_scroll	: false,
        	fadein_time		: 500,
        	left_offset		: '50%',
        	min_width		: false,
        	screen_min		: false,
        	trigger			: '.schmodal_open',
            width			: '50%'
        };

    // The actual plugin constructor
    function Schmodal( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Schmodal.prototype = {

        init: function() {
            
        	var $elem 	             = $(this.element),
				$opts                = this.options,
				$inner               = $elem.html(),
				$content             = "",
				_overflow,
				_height;

				// Add some more values to options
				$opts.w_height		 = $(window).height(),
				$opts.w_width		 = $(window).width(),
                $opts.close_bg_click = ($opts.bg_close) ? ', .schmodal_fade' : '';

	            // Hide the original element
	            $elem.hide();

	            // Build the content from the original item.
	            $content += '<div class="schmodal_modal">';
	            $content += ( $opts.bg_close ) ? '<a href="#"><img class="schmodal_close" src="'+ $opts.close_img +'" title="Close" alt="Close" width="25" height="25" /></a>' : '';
	        	$content += '<div class="schmodal_content group">'+ $inner +'</div>';
	            $content += '</div>';
	        	$content += '<div class="schmodal_fade"></div>';
	            
	            // Add the modal to the DOM and fire the open action
	            $elem = $('<div />', { html: $content, class: 'schmodal' }).appendTo('body');
	            
	            // Open to modal as long as the screen_min is valid if set
	            if( $opts.screen_min && $opts.screen_min <= $opts.w_width )
	            {
	            	$elem = this.open($elem, $opts);
	            }

	            return $elem;
        },

        open: function( $elem, $opts ) {

        	switch( $opts.action )
        	{
        		case 'load': 
        			this.add_css( $elem, $opts );
        		break;

        		case 'click':
        			var trigger = $opts.trigger;
        			$(trigger).on( 'click', { elem: $elem, opts: $opts }, this.add_css );
        		break;
        	}
        	
	        $elem.find('.schmodal_close' + $opts.close_bg_click).on('click', { elem: $elem, opts: $opts }, this.close );          

            return $elem;

        },

        add_css: function( $elem, $opts ) {

        	// Assign the required objects if passed via event data
        	if( typeof $elem.data !== "undefined" && typeof $elem.data.opts !== "undefined")
        	{
        		var $opts = $elem.data.opts;
        		var $elem = $elem.data.elem;	
        	}

            // Wait until images are loaded if applicable
            if( $elem.has('img').length )
            {
                $elem.find('img').on('load', function(){
                    $elem.trigger('schmodal_modal_loaded'); 
                });

            } else {
                $elem.trigger('schmodal_modal_loaded');
            }


            $elem.on('schmodal_modal_loaded', function(){

            	$elem
    				.fadeIn($opts.fadein_time)
    	            .find('.schmodal_modal')
    	            .css({
    	            	'left' : $opts.left_offset,
    	                'width' : function() { 
    	                	return ( typeof $opts.width == 'number' ) ? $opts.width  + 'px' : $opts.width 
    	                },
    	                'margin-left' : function() { 
    	                	return ( typeof $opts.width == 'number' ) ? '-'+ ($opts.width / 2) +'px' : ( $opts.width.match(/\%/i) ) ? '-' + ( parseFloat($opts.width.replace('%','')) / 2 ) + '%'  : 'auto';
    	                },
    	                'position' : function() { 
    	            		var el_height = $(this).outerHeight();
    	            		return ( el_height <= $opts.w_height ) ? 'fixed' : 'absolute';
    	            	},
    	            	'top' :  function() { 
    	            		var el_height = $(this).outerHeight() / 2;
    	            		return ( ($opts.w_height / 2) - el_height < 0 ) ? '50px' : ($opts.w_height / 2) - el_height + 'px';
    	            	},
    	            	'min-width'	: function() { 

    	            		if( ! $opts.min_width )
    	            		{
    	            			return ( typeof $opts.width == 'number' ) ? ($opts.width / 2) +'px' : ( $opts.width.match(/\%/i) ) ? ( $opts.w_width * parseFloat( '0.' + $opts.width.replace('%','')) ) + 'px'  : '';
    	            		}	
    	            		return ( typeof $opts.min_width == 'number' ) ? $opts.min_width + 'px' : $opts.min_width

    	                },
    	            });
            });

	        // Check if the Schmodal height is higher than the document height 
	        // and force the document height if true
	        $opts.overflow = $elem.find('.schmodal_modal').outerHeight() + $elem.find('.schmodal_modal').offset().top;

	        // Disable page scrolling if the modal is open
	        // depends on disable_scroll option
	        $('html,body')
	        	.css('overflow', function() {
	        		return ( $opts.disable_scroll ) ? 'hidden' : '';
	        	});

	        return $elem;
        },

        close: function( $elem ) {

        	// Assign the required objects if passed via event data
        	if( typeof $elem.data !== "undefined" && typeof $elem.data.opts !== "undefined")
        	{
        		var $opts = $elem.data.opts;
        		var $elem = $elem.data.elem;	
        	}

        	// Fadeout and reset the height of the window if scroll was disabled.
        	$elem.fadeOut(500, function(){
        		if( $opts.disable_scroll )
        		{
        			$('html,body').css('overflow', '');
        		}
        	});

        }

    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Schmodal( this, options ));
            }
        });
    };

})( jQuery, window, document );