/* 

    +------------------+
    |sn3cf             |
    |p+=*              |
    |-j1               |
    |=+                |
    |f          #  ##  |
    |           # #    |
    |           #  ##  |
    |        #  #    # |
    |         ##   ##  |
    +------------------+
    jsstyle.github.com 

    =============================================

    SparkBubbles

    by Greg Babula

    http://Babu.la

    =============================================

*/


yepnope([
    {
        load: ['//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'],
        complete: function(){
            if ( !window.jQuery ) {
                yepnope([
                    {
                        load: ['_assets/js/libs/jquery-1.8.2.min.js']
                    }
                ]);
            }
        }
    },
    {
        load: ['_assets/js/libs/sparky.js'],
        complete: function(){
            if ( $.browser.webkit !== true || ('ontouchstart' in document.documentElement) ) {
                alert('Warning! At this point, SparkBubbles is only supported in Webkit (Desktop) browsers.');
            }
        }
    }
    
]);