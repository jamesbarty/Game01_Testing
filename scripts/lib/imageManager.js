define([], function() {
  'use strict';

  var ImageManager = (function() {

    var imageMap = {},
        numImages = 0,
        numLoaded = 0;

    return {
        addImage: function(url, name) {
          if (url !== "" && !url) {
            console.error("Cannot add image: no name specified");
          }
          if (imageMap.hasOwnProperty(name)) {
            console.error("Cannot add image: image with name " + name + " already exists");
            return;
          }
          numImages += 1;
          var image = new Image();
          var old = performance.now();
          image.onload = function() {
            //console.log('loaded ' + name);
            //console.log(performance.now() - old);
            numLoaded += 1;
          }
          image.src = url;
          imageMap[name] = image;
          
        },

        loadImages: function(callback) {
          if (numLoaded === numImages) {
            callback();
          }
          var loadCheck = setInterval(function() {
            if (numLoaded === numImages) {
              clearInterval(loadCheck);
              callback();
            }
          }, 100);
        },

        image: imageMap
    };
  })();



  return ImageManager;
});
