require(['lib/uiElement', 'lib/mouseInteractive'], function(UiElement, MouseInteractive){


    var ui = new UiElement();
    console.log( ui.left )
    console.log( ui.top );
    ui.disable();


    var mouse = new MouseInteractive(10, 10, true);
    console.log( mouse.left );
    console.log( mouse.top );
    mouse.disable();

});
