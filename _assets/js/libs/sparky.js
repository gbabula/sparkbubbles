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

var SparkBubbles = SparkBubbles || (function($) {

    var Utils   = {}, // Your Toolbox  
        Ajax    = {}, // Your Ajax Wrapper
        Events  = {}, // Event-based Actions      
        Routes  = {}, // Your Page Specific Logic   
        App     = {}, // Your Global Logic and Initializer
        Public  = {}; // Your Public Functions

    var cursorX,
        cursorY,
        createBubble,
        speed,
        bubbleCount,
        timer;

    Utils = {
        settings: {
            debug: true,
            meta: {
                controller: -1,
                action: -1,
                currentUser: -1,
                homeURL: -1
            },
            init: function() {
                _log('Initializing Settings');
                Utils.settings.meta.controller = $('meta[name="controller"]').attr("content");
                Utils.settings.meta.action = $('meta[name="action"]').attr("content");
		
				Utils.settings.currentUser = $('meta[name="userid"]').attr("content");
				Utils.settings.homeURL = $('meta[name="url"]').attr("content");
                _log('Initialized Settings');
            }
        },
        cache: {
            window: window,
            document: document,
            wrap: document.getElementById('wrapper'),
            paper: document.getElementById('paper'),
            score: document.getElementById('score'),
            update: document.getElementById('update'),
            controls: document.getElementById('controls'),
            progress: document.getElementById('progress'),
            infoPanel: document.getElementById('info-panel')
        },
        home_url: function(path){
            if(typeof path=="undefined"){
                path = '';
            }
            return Utils.settings.meta.homeURL+path+'/';            
        },
        log: function(what) {
            if (Utils.settings.debug) {
                console.log(what);
            }
        },
        randomFromTo: function(from, to){
            return Math.floor(Math.random() * (to - from + 1) + from);
        },
        route: function(){
            _log('Initializing Router');
            var controller = Utils.settings.meta.controller;
            var action = Utils.settings.meta.action;
    
            if(typeof Routes[controller] != 'undefined'){
                if(typeof Routes[controller].init != 'undefined'){
                    _log('Routes->'+controller+'.init() Exists, calling');
                    Routes[controller].init.call();         
                }
    
                if(typeof Routes[controller][action] != 'undefined'){
                    _log('Routes->'+controller+'.'+action+'() Exists, calling');
                    Routes[controller][action].call();              
                }
            }
            _log('Routed');
        } 
    };

    var _log = Utils.log,
        _fromTo = Utils.randomFromTo;
	
    Ajax = {
        ajaxUrl: Utils.home_url('ajax'),
        checkAuth: function(returnFunc){
            if(typeof returnFunc == 'function' && Utils.settings.meta.currentUser==-1){
                returnFunc.call();
                return false;
            }
        },
        call: function(method, data, returnFunc, authRequiredFunc){
            
            Ajax.checkAuth(authRequiredFunc);

            $.ajax({
                type:'POST',
                url: Ajax.ajaxUrl+method,
                dataType:'json',
                data: data,
                success: returnFunc
            });
        },
        get: function(method, data, returnFunc, authRequiredFunc){

            Ajax.checkAuth(authRequiredFunc);

            $.ajax({
                type:'GET',
                url: Ajax.ajaxUrl+method,
                dataType:'json',
                data: data,
                success: returnFunc
            });
        }
    };

    Events = {
        endpoints: {
            addBubble: function(){

                var _bubble = $('<b class="bubble"></b>'),
                    _paper = $(Utils.cache.paper),
                    _paperWidth = _paper.width();

                _paper.append(_bubble);
                _bubble.css({
                    left: _fromTo(20, (_paperWidth - 20)) + 'px'
                }).attr({
                    'data-event': 'popBubble'
                }).addClass('float');

                Events.bindEvents();

            },
            popBubble: function(){

                var _this = $(this);

                if ( _this.is('.big-bubble') ) {

                    var _currentAnimationName = _this.css('-webkit-animation-name'),
                        _currentAnimationDuration = _this.css('-webkit-animation-duration'),
                        _currentAnimationDirection = _this.css('-webkit-animation-direction');

                    _this.css({
                        '-webkit-animation': '' + _currentAnimationName + ' ' + _currentAnimationDuration + ' ' + _currentAnimationDirection + ', pop-bubble 1s both',
                        'pointer-events': 'none'
                    });

                    App.logic.updateScore('big-bubble');

                } else {

                    _this.addClass('pop');
                    App.logic.updateScore('small-bubble');

                }

                setTimeout(function(){
                    _this.remove();
                }, 750);

            },
            togglePanel: function(){
                _log('toggle info panel');
                $(Utils.cache.infoPanel).toggleClass('open');
            },
            toggleGame: function(){
                if ( $(Utils.cache.paper).is('.pause') ) {
                    Events.endpoints.resumeGame();
                } else {
                    Events.endpoints.pauseGame();
                }
            },
            resumeGame: function(){
                _log('Resume Game');

                if ( App.logic.settings.time.current < App.logic.settings.time.total ) {
                    App.logic.createBubbles.start(App.logic.settings.speed.current);
                    App.logic.gameTime.start();
                    $(Utils.cache.paper).removeClass('pause');
                }
            },
            pauseGame: function(){
                _log('Pausing Game');

                App.logic.createBubbles.stop();
                App.logic.gameTime.stop();

                $(Utils.cache.paper).addClass('pause');
            },
            shareGame: function(){
                _log('Share Game');
            }
        },
        bindEvents: function(){
            _log('Binding Events');
            $('[data-event]').each(function(){
                var $this = $(this),
                    method = $this.attr('data-method') || 'click',
                    name = $this.attr('data-event'),
                    bound = $this.attr('data-bound')=='true';

                if(typeof Events.endpoints[name] != 'undefined'){
                    if(!bound){
                        $this.attr('data-bound', 'true');
                        $this.on(method, Events.endpoints[name]);
                    }
                }
            });
            _log('Events Bound');
        },
        init: function(){
            Events.bindEvents();
        }
    };
    Routes = {
        dashboard: {
            init: function(){
                _log('Auto Loading Dashboard Code');
                $(Utils.cache.paper).removeClass('hidden');
            }
        }
    };
    App = {
        logic: {
            settings: {
                speed: {
                    current: 1500,
                    normal: 1500,
                    fast: 1000,
                    pro: 500,
                    sick: 250
                },
                time: {
                    total: 63,
                    current: 0
                },
                bubble: {
                    min: 1,
                    max: 60
                },
                mouse: {
                    attached: false
                }
            },
            score: {
                start: 0,
                current: 0
            },
            checkMouse: function(){
                $(Utils.cache.paper).on('mousemove', function(event){
                    cursorX = event.pageX;
                    cursorY = event.pageY;
                    // _log(cursorX);
                    // _log(cursorY);
                    if ( cursorX !== undefined && cursorY !== undefined ) {
                        App.logic.settings.mouse.attached = true;
                    } else {
                        App.logic.settings.mouse.attached = false;
                    }
                });
            },
            createBubbles: {
                start: function(speed){
                    if ( createBubble !== undefined ) {
                        clearInterval(createBubble);
                    }
                    createBubble = setInterval(function(){
                        if ( $(Utils.cache.paper).find('b').length < App.logic.settings.bubble.max ) {
                            Events.endpoints.addBubble();
                        } else {
                            App.logic.createBubbles.stop();
                        }
                    }, speed)
                },
                stop: function(){
                    clearInterval(createBubble);
                }
            },
            gameTime: {
                actions: function(time){

                    if ( time >= App.logic.settings.time.total ) {
                        
                        App.logic.gameTime.end();
                    
                    }

                },
                start: function(){

                    var _time = App.logic.settings.time.current,
                        _progress = $(Utils .cache.progress);

                    if ( timer !== undefined ) {
                        clearInterval(timer);
                    }

                    timer = setInterval(function(){

                        _log('[- ' + _time + ' -]');

                        _time++;

                        _progress.children('.bar').width((_time * 1.6) + '%');
                        
                        App.logic.settings.time.current = _time;
                        App.logic.gameTime.actions(_time);

                    }, 1000);

                },
                stop: function(){
                    clearInterval(timer);
                },
                end: function(){

                    var currentStatus = App.logic.settings.speed.current,
                        endStatus = {
                            1500: 'What Happened?',
                            1000: 'Not Bad!',
                            500: 'Nice!',
                            250: 'Holy Crap!'
                        }

                    App.logic.gameTime.stop();
                    App.logic.createBubbles.stop();

                    $(Utils.cache.paper).find('b').remove();
                    $(Utils.cache.paper).addClass('pause');

                    Events.endpoints.togglePanel();

                    _log('Game Over!');
                    _log('Total Score: ' + App.logic.score.current + '');
                    _log('Your Status: ' + endStatus[currentStatus] + '');

                    alert('Game Over! Thanks for playing. Total Score: ' + App.logic.score.current + ' [- ' + endStatus[currentStatus] + ' -]');

                }
            },
            gameInit: function(){
                App.logic.showScore(0);
                App.logic.gameTime.start();
                App.logic.createBubbles.start(App.logic.settings.speed.normal);
            },
            updateScore: function(string){

                if ( string === 'small-bubble' ) {

                    _log('add point for small bubble');

                    App.logic.score.current++
                    App.logic.showUpdate('+1');

                } else if ( string === 'big-bubble' ) {

                    _log('add point for big bubble');

                    App.logic.score.current = App.logic.score.current + 2;
                    App.logic.showUpdate('+2');

                }

                App.logic.showScore(App.logic.score.current);

                if ( App.logic.settings.time.current < App.logic.settings.time.total ) {
                    App.logic.updateLevel(App.logic.score.current);
                }   
                
            },
            updateLevel: function(score){

                _log('Score: ' + score);

                if ( score > _fromTo(25, 26) ) {

                    //Level 2
                    _log('Level 2');

                    App.logic.createBubbles.start(App.logic.settings.speed.fast);
                    App.logic.settings.speed.current = App.logic.settings.speed.fast;

                    $(Utils.cache.paper).attr('class', 'paper paper-level-two');
                    $(Utils.cache.paper).find('h2').attr('class', 'level-marker');

                }
                if ( score > _fromTo(50, 51) ) {

                    //Level 3
                    _log('Level 3');

                    App.logic.createBubbles.start(App.logic.settings.speed.pro);
                    App.logic.settings.speed.current = App.logic.settings.speed.pro;
                    
                    $(Utils.cache.paper).attr('class', 'paper paper-level-three');
                    $(Utils.cache.paper).find('h3').attr('class', 'level-marker');

                }
                if ( score > _fromTo(95, 96) ) {

                    //Level 4
                    _log('Level 4');

                    App.logic.createBubbles.start(App.logic.settings.speed.sick);
                    App.logic.settings.speed.current = App.logic.settings.speed.sick;
                    
                    $(Utils.cache.paper).attr('class', 'paper paper-level-four');
                    $(Utils.cache.paper).find('h4').attr('class', 'level-marker');

                }
                if ( score > _fromTo(110, 111) ) {

                    //Level 5
                    _log('Level 5');

                    App.logic.createBubbles.start(App.logic.settings.speed.sick);
                    App.logic.settings.speed.current = App.logic.settings.speed.sick;
                    
                    $(Utils.cache.paper).attr('class', 'paper paper-level-five');
                    $(Utils.cache.paper).find('h5').attr('class', 'level-marker');

                }
                
            },
            showScore: function(number){
                $(Utils.cache.score).text(number);
            },
            showUpdate: function(string){
                $(Utils.cache.update).text(string);
            },
            windowEvents: function(){

                var $window = $(Utils.cache.window);

                $window.bind('blur', function(){
                    Events.endpoints.pauseGame();
                });

                $window.bind('focus', function(){
                    Events.endpoints.resumeGame();
                });

                $window.bind('dblclick', function(event){
                    if ( window.getSelection ) {
                        window.getSelection().removeAllRanges();
                    }
                    else if ( document.selection ) {
                        document.selection.empty();
                    }
                });

            }
        },
        init: function() {

            Utils.settings.init();
            Events.init();   
            Utils.route();    

            _log('Initialized SparkBubbles');
            _log('Warning: For best performance, use Chrome Canary and keep your window under 1000-1400 px total width.');
            _log('Warning: Still in active development.');
            _log('Tip: Head to about://flags in Chrome and enable the FPS counter.');

            App.logic.checkMouse();
            App.logic.windowEvents();

            $(Utils.cache.infoPanel).delay(3500).queue(function(){
                $(Utils.cache.infoPanel).removeClass('intro')
            });

            App.logic.gameInit();

        }
    };
    
    Public = {
        init: App.init  
    };

    return Public;

})(window.jQuery);

jQuery(document).ready(SparkBubbles.init);