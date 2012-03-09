
IdleOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function()
   {
      var temp = hudSystem.paper;

      this.cursorHorz = temp.path("M0,0L" + temp.w + ",0");
      this.cursorHorz.attr("stroke", "0F0");
      this.cursorHorz.attr("stroke-opacity", 0.0);
      this.cursorVert = temp.path("M0,0L0," + temp.h);
      this.cursorVert.attr("stroke", "0F0");
      this.cursorVert.attr("stroke-opacity", 0.0);

      this.centerPoint = temp.circle(temp.w / 2, temp.h / 2, 15);

      this.centerPoint.attr("fill", "#000");
      this.centerPoint.attr("fill-opacity", 0.2);
      this.centerPoint.attr("stroke", "#0F0");
      this.centerPoint.attr("stroke-opacity", 0.3);
      this.centerPoint.attr("stroke-width", 10);

      this.info = temp.text(temp.w / 2, temp.h / 2, "");
      this.info.attr({"fill": "#FF0", "font-size": 15});
   },

   onDown: function(position, buttonStates, changeMask)
   {
      if (changeMask[2])
      {
         this.showPosition();
      }
   },

   onUp: function(position, buttonStates, changeMask)
   {
      this.showInfoAt(null, null);
   },

   onMove: function(position, buttonStates)
   {
      var realPos = sceneSystem.pixelToReal(position.x, position.y);
      var result = sceneSystem.pickAt(realPos);

      if (result)
      {
         this.showInfoAt(result.getViewPosition(), result.getRefObject());
      }
      else
      {
         this.showInfoAt(null, null);
      }

      {
         var pixel = hudSystem.realToViewCoordinates(realPos);

         this.cursorHorz.attr("path", "M0," + pixel.y + "L" + hudSystem.paper.w + "," + pixel.y);
         this.cursorVert.attr("path", "M" + pixel.x + ",0L" + pixel.x + "," + hudSystem.paper.h);
      }
   },

   onRotate: function(position, buttonStates, rotation)
   {

   },

   onStart: function(position, buttonStates)
   {
      var realPos = sceneSystem.pixelToReal(position.x, position.y);
      var pixel = hudSystem.realToViewCoordinates(realPos);

      this.cursorHorz.toBack();
      this.cursorVert.toBack();
      this.cursorHorz.attr("path", "M0," + pixel.y + "L" + hudSystem.paper.w + "," + pixel.y);
      this.cursorVert.attr("path", "M" + pixel.x + ",0L" + pixel.x + "," + hudSystem.paper.h);
      this.cursorHorz.animate({"stroke-opacity": 0.5}, 200);
      this.cursorVert.animate({"stroke-opacity": 0.5}, 200);
   },

   onStop: function(position)
   {
      this.showInfoAt(null, null);
      this.cursorHorz.animate({"stroke-opacity": 0.0}, 200);
      this.cursorVert.animate({"stroke-opacity": 0.0}, 200);
   },

   showPosition: function()
   {
      var projection = sceneSystem.project(cube.position);

      if (projection)
      {
         this.showInfoAt(projection, "It's here!");
      }
      else
      {
         this.showInfoAt({ "x": 0, "y": 0}, "Not visible");
      }
   },

   showInfoAt: function(realPos, text)
   {
      if (text)
      {
         var pixel = hudSystem.realToViewCoordinates(realPos);

         this.centerPoint.attr("cx", pixel.x);
         this.centerPoint.attr("cy", pixel.y);

         this.info.attr("x", pixel.x + 10);
         this.info.attr("y", pixel.y - 10);
         this.info.attr("text", text);

         this.centerPoint.show();
         this.info.show();
      }
      else
      {
         this.centerPoint.hide();
         this.info.hide();
      }
   }

});
