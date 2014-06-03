/*
 *  jQuery Schmodal 0.3
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
            action          : 'load',                       // ('click' or 'load') Defines when the Schmodal will open - 'click' or 'load'.
            bg_close        : true,                         // (Boolean) Click on background to close?
            close_img       : 'images/schmodal_close.png',  // (img path) Path to the image displayed for the close button.
            disable_scroll  : false,                        // (Boolean) Disable scrolling of the page when Schmodal is open.
            fadein_time     : 500,                          // (ms) Sets the fade in time.
            left_offset     : '50%',                        // (px or %) Sets the left offset.
            min_width       : false,                        // (px or %) Sets the min_width of the Schmodal.
            screen_min      : false,                        // (px or false) Only show Schmodal is screen width is larger than set amount of 'px'.
            openTrigger     : '.schmodal_open',             // (jQuery selector) If action set to 'click', this defines the element that activates the Schmodal onClick.
            closeTrigger    : '.schmodal_close',            // (jQuery selector) Defines the element that closes the Schmodal onClick.
            width           : '50%',                        // (px or %) Specified width of the Schmodal in 'px' or '%'.
            onClose         : null                          // (function) Callback when Schmodal closed.
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
            
            var $elem                = $(this.element),
                $opts                = this.options,
                $inner               = $elem.html(),
                $content             = "",
                _overflow,
                _height;

                // Add some more values to options
                $opts.w_height       = $(window).height(),
                $opts.w_width        = $(window).width(),
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

                // Prevent default if action is set to 'click'
                if( $opts.action == 'click' )
                {
                    $( $opts.openTrigger ).on('click', function(e) {
                        e.preventDefault();
                    });
                }

                return $elem;
        },

        open: function( $elem, $opts ) {

            switch( $opts.action )
            {
                case 'load': 
                    this.prepare( $elem, $opts );
                break;

                case 'click':
                    var _this         = this,
                        open_trigger  = $opts.openTrigger,
                        close_trigger = $opts.closeTrigger;

                    $(open_trigger).on('click', function() {
                        _this.prepare( $elem, $opts );
                    });

                    $(close_trigger).on('click', function() {
                        _this.close( $elem, $opts );
                    });

                break;
            }
            
            $elem.find('.schmodal_close' + $opts.close_bg_click).on('click', { elem: $elem, opts: $opts }, this.close );          

            return $elem;

        },

        // Wait until images are loaded if applicable 
        prepare: function( $elem, $opts ) {

            _this = this;

            if( $elem.has('img').length && $opts.action == 'load')
            {
                $elem.find('img').on('load', function(){
                    _this.apply_css( $elem, $opts ); 
                });

            } else {
                _this.apply_css( $elem, $opts );
            }

            return $elem;   
        },

        apply_css: function( $elem, $opts ) {

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
                    'min-width' : function() { 

                        if( ! $opts.min_width )
                        {
                            return ( typeof $opts.width == 'number' ) ? ($opts.width / 2) +'px' : ( $opts.width.match(/\%/i) ) ? ( $opts.w_width * parseFloat( '0.' + $opts.width.replace('%','')) ) + 'px'  : '';
                        }   
                        return ( typeof $opts.min_width == 'number' ) ? $opts.min_width + 'px' : $opts.min_width

                    },
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

        close: function( $elem, $opts ) {

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

                if( $opts.onClose !== null )
                {
                    $opts.onClose.call();
                }
            });

            return $elem;

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