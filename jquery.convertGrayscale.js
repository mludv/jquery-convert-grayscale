/**
 * Convert images to grayscale
 * 
 * Copyright (C) 2011 Maximilian Ludvigsson
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

(function( $, filtrr){
  
  var findPos = function (obj) {
    var curleft = 0;
    var curtop = 0;
    if (obj.offsetParent) {
      while (true) {
        curtop += obj.offsetTop;
        curleft += obj.offsetLeft;
        if (!obj.offsetParent) { break; }
        obj = obj.offsetParent;
      }
    } else {
      if (obj.x) {
        curleft += obj.x;
      }
      if (obj.y) {
        curtop += obj.y;
      }
    }
    return { top: curtop, left: curleft };
  };

  var createCanvasFromImg = function(imgElem, callback) {  
    if (imgElem) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        var pos = findPos(imgElem);
        var posP = findPos(imgElem.offsetParent);
        canvas.style.top = Math.abs(pos.top - posP.top) + "px";
        canvas.style.left = Math.abs(pos.left - posP.left) + "px";
        canvas.style.position = "absolute";
        $(imgElem).parent().append(canvas);
        img = null;
        imgElem = null;
        callback(new filtr(canvas));
      };
      img.src = imgElem.getAttribute("src");
    }
  };

  var copyCanvas = function(canvas) {
    var newCanvas = document.createElement("canvas");
    newCanvas.style         = canvas.style;
    newCanvas.style.display = "none";
    newCanvas.height        = canvas.height;
    newCanvas.width         = canvas.width;
    newCanvas.getContext('2d').drawImage(canvas, 0, 0);
    $(newCanvas).attr("class", "original")
      .parent().append(newCanvas);
    
    return newCanvas;
  };

  var applyGrayScale = function (image, callback) {
    return createCanvasFromImg(image, function (filtr) {
      // save the original canvas
      var original = copyCanvas(filtr.canvas());
      
      filtr.core.grayScale();
      filtr.put();
      //return filtr.canvas().getContext("2d").drawImage(whiteFrame, 0, 0);
      callback(filtr.canvas(), original);
    });
  };

  $.fn.convertGrayscale = function() {
    // just return if no canvas support
    if (!"HTMLCanvasElement" in window) {
      return this;
    }

    return this.each(function () {
      var image = this;
      // wrap div around image
      $(image).wrap(function() {
        return '<div class="grayscale_image_wrapper" />';
      });

      applyGrayScale(image, function (filtered, original) {
        $(image).parent().on("mouseenter", function() {
          $(filtered).hide();
          $(original).show();
        });
        $(image).parent().on("mouseleave", function() {
          $(filtered).show();
          $(original).hide();
        });
      });
    });

  };
})( jQuery, filtrr);