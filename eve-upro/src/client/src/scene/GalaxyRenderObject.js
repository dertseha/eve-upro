upro.scene.GalaxyRenderObject = Class.create(upro.scene.SceneRenderObject,
{
   initialize: function($super, basicShader, systemShader)
   {
      $super();

      this.basicShader = basicShader;
      this.systemShader = systemShader;

      this.systems = [];
      this.systemProjections = {};
      this.systemVertices = [];
      this.systemColors = [];

      this.jumpVertices = [];
      this.jumpColors = [];

      this.routeVertices = [];
      this.routeColors = [];
      this.routeSegments = [];

      this.dynamicJumpSegments = {};

      this.ready = false;
      this.visible = false;
   },

   setOrientationModified: function($super, value)
   {
      $super(value);

      if (value)
      {
         delete this.systemProjections;
         this.systemProjections = {};
      }
   },

   addSolarSystem: function(solarSystem)
   {
      var galaxy = solarSystem.galaxy;
      var systemScale = galaxy.scale;
      var center = galaxy.position;

      this.systemVertices.push((solarSystem.position[0] - center[0]) / systemScale,
            (solarSystem.position[1] - center[1]) / systemScale, (solarSystem.position[2] - center[2]) / systemScale);
      this.systemColors.push(solarSystem.security, 0.0, 0.0);

      this.systems.push(solarSystem);
   },

   addJumpCorridor: function(jumpCorridor)
   {
      var color = [ 1.0, 1.0, 1.0 ];

      if (jumpCorridor.getJumpType() == upro.nav.JumpType.JumpGate)
      {
         if (jumpCorridor.system1.constellationId == jumpCorridor.system2.constellationId)
         {
            color = [ 0.0, 0.0, 1.0 ];
         }
         else if (jumpCorridor.system1.regionId == jumpCorridor.system2.regionId)
         {
            color = [ 1.0, 0.0, 0.0 ];
         }
         else if (jumpCorridor.system1.galaxy == jumpCorridor.system2.galaxy)
         {
            color = [ 1.0, 0.0, 1.0 ];
         }
         this.addEdge(jumpCorridor.system1, jumpCorridor.system2, this.jumpVertices, this.jumpColors, color);
      }
      else
      {
         var vertices = [], colors = [];
         var segment = new upro.scene.VertexBufferSegment();
         var scene = this.scene;

         this.addEdge(jumpCorridor.system1, jumpCorridor.system2, vertices, colors, color);

         segment.create(scene.gl);
         segment.update(scene.gl, vertices, colors, 0, vertices.length / 3);
         this.dynamicJumpSegments[jumpCorridor.id] = segment;
      }

   },

   addRouteEdge: function(system1, system2, valid)
   {
      var color = valid ? [ 1.0, 1.0, 0.0, 2.0 ] : [ 1.0, 0.0, 0.0, 2.0 ];

      this.addEdge(system1, system2, this.routeVertices, this.routeColors, color);
      this.updateRouteSegments();
   },

   clearRoute: function()
   {
      this.routeVertices.clear();
      this.routeColors.clear();
      this.updateRouteSegments();
   },

   addEdge: function(system1, system2, vertices, colors, color)
   {
      var galaxy = system1.galaxy;
      var systemScale = galaxy.scale;
      var center = galaxy.position;
      var pos1 = vec3.scale(vec3.subtract(system1.position, center, vec3.create()), 1 / systemScale);
      var pos2 = vec3.scale(vec3.subtract(system2.position, center, vec3.create()), 1 / systemScale);
      var diffVec = vec3.subtract(pos2, pos1, vec3.create());
      var distance = vec3.length(diffVec);
      var fadeInLength = distance / 5.0, fadeInLimit = 1.0;
      var baseAlpha = (color.length > 3) ? color[3] : 1.0;

      vec3.normalize(diffVec);
      if (fadeInLength > fadeInLimit)
      {
         fadeInLength = fadeInLimit;
      }
      vec3.scale(diffVec, fadeInLength);

      // fade in from system 1 to line
      vertices.push(pos1[0], pos1[1], pos1[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.0);
      vec3.add(pos1, diffVec);
      vertices.push(pos1[0], pos1[1], pos1[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);

      // fade in from system 2 to line
      vertices.push(pos2[0], pos2[1], pos2[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.0);
      vec3.subtract(pos2, diffVec);
      vertices.push(pos2[0], pos2[1], pos2[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);

      // actual line
      vertices.push(pos1[0], pos1[1], pos1[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);
      vertices.push(pos2[0], pos2[1], pos2[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);
   },

   addToScene: function($super, scene)
   {
      this.systemVertexBuffer = scene.gl.createBuffer();
      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemVertexBuffer);
      scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.systemVertices), scene.gl.STATIC_DRAW);

      this.systemColorBuffer = scene.gl.createBuffer();
      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemColorBuffer);
      scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.systemColors), scene.gl.STATIC_DRAW);

      this.jumpSegments = [];
      var amount = this.jumpVertices.length / 3, limit = 1024 * 4, remaining = amount, start = 0;

      while (remaining > 0)
      {
         var copy = (limit > remaining) ? remaining : limit;
         var segment = new upro.scene.VertexBufferSegment();

         segment.create(scene.gl);
         segment.update(scene.gl, this.jumpVertices, this.jumpColors, start, start + copy);
         this.jumpSegments.push(segment);
         remaining -= copy;
         start += copy;
      }

      {
         var segment = new upro.scene.VertexBufferSegment();

         segment.create(scene.gl);
         this.routeSegments.push(segment);
      }

      $super(scene);

      this.updateRouteSegments();

      this.loadTexture();
   },

   updateRouteSegments: function()
   {
      if (this.routeSegments.length > 0)
      {
         var scene = this.scene;
         var segment = this.routeSegments[0];

         segment.update(scene.gl, this.routeVertices, this.routeColors, 0, this.routeVertices.length / 3);
      }
   },

   loadTexture: function()
   {
      var scene = this.scene;
      var gl = scene.gl;
      var texture = gl.createTexture();
      var obj = this;

      texture.image = new Image();
      texture.image.onload = function()
      {
         // gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, texture);

         // gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
         gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

         gl.generateMipmap(gl.TEXTURE_2D);

         gl.uniform1i(gl.getUniformLocation(obj.systemShader.getHandle(), "texture"), 0);
         obj.ready = true;
      };

      texture.image.src = 'data:image/png;base64,'
            + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACXklEQVR42u2Xv0tCYRSGQwIR6aIu'
            + 'QgZRYIgImi4uBVKgCEKCl7YCoZyqQVBoaEmoxUUcFIKWhmh1CHFzjKC5wbmtf6HeD56popKKe4c+'
            + 'eDhwOOc99zvfj3vvzMz/mG54hFf4hSUCIoi18HuJ+9Uxi3hIhMWCWBRLYhm7iD9MnJ+8Hw8fghGK'
            + 'xURCpERaZLAp/DHiIuT5ftLuOWZkZhgXqyIr1kRObIhNbA5/lrg4eWF0PNMWN2s6L6IiibApUhAl'
            + 'URYVYWPL+AvEZcmLomNN8xBzJK3QXjOzvNgS22JHVMWe2MdW8W8Tlycvjc48ut9a8zBPbpLXRZGZ'
            + '7oqaOBR10RBNbB1/jTibvHV0ouj6vtrtIdYuyQyKzMrM8IBiJ+JUnIlz7Cn+BnFV8oroJNENfXY6'
            + '/OzeOGuYZyZG7Egci5Zoi67oiT62i79F3BF5NjpZdCPU+XDjhThCq2ykLdp5gKiZaUdciCtxLW6w'
            + 'V/g7xB2Tt4tODt1l6rzbkF7WKMbTFmhhjba2EL+k6EAMxQg7wH9JXIu8GjoFdGPU8X7U/gUukzWO'
            + '1A4b64T2XlDkVozFnbjHjvHfENcm7xCdEroJ6rxbBovrNEW7yqxhnQ3Wpc0Dij2IRzHBPuAfENcl'
            + 'r45OGd0Uday3DxBgl6a52Sqc7wZr2mOth8zYFH0Sz9hH/EPieuQ10Kmgm6ZO4O0DBNkgGa5Xm0um'
            + 'yVHr094RbZ9Q/AU7wT8irk9eEx0b3Qx1gq7rgON7wPFT4Pg94PhN6Pi7wBVvQ8e/B1zxReSKb0LH'
            + 'v4pd8V/gmj8jV/wb/tl4BRzB6khBvMZaAAAAAElFTkSuQmCC';
   },

   setVisible: function(visible)
   {
      this.visible = visible;
      if (!this.visible)
      {
         this.resetProjectionTrackers(true);
      }
   },

   render: function(timeDiffMSec)
   {
      if (this.ready && this.visible)
      {
         var scene = this.scene;

         scene.pushMatrix();
         mat4.translate(scene.mvMatrix, this.position);

         { // systems
            var shader = this.systemShader;

            shader.use();

            scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemVertexBuffer);
            scene.gl.vertexAttribPointer(shader.positionAttribute, 3, scene.gl.FLOAT, false, 0, 0);

            scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemColorBuffer);
            scene.gl.vertexAttribPointer(shader.colorAttribute, 3, scene.gl.FLOAT, false, 0, 0);

            scene.gl.uniformMatrix4fv(shader.mvMatrixUniform, false, scene.mvMatrix);
            scene.gl.uniformMatrix4fv(shader.pMatrixUniform, false, scene.pMatrix);

            scene.gl.drawArrays(scene.gl.POINTS, 0, this.systemVertices.length / 3);
            scene.gl.flush();
         }
         { // edges
            var shader = this.basicShader;
            var i, segment;

            shader.use();

            scene.gl.uniformMatrix4fv(shader.mvMatrixUniform, false, scene.mvMatrix);
            scene.gl.uniformMatrix4fv(shader.pMatrixUniform, false, scene.pMatrix);

            for (i = 0; i < this.jumpSegments.length; i++)
            { // jumps
               segment = this.jumpSegments[i];

               segment.select(scene.gl, shader);
               scene.gl.drawArrays(scene.gl.LINES, 0, segment.size);
               scene.gl.flush();
            }
            for (dynId in this.dynamicJumpSegments)
            { // dynamic jumps
               segment = this.dynamicJumpSegments[dynId];
               segment.select(scene.gl, shader);
               scene.gl.drawArrays(scene.gl.LINES, 0, segment.size);
               scene.gl.flush();
            }
            for (i = 0; i < this.routeSegments.length; i++)
            { // route
               segment = this.routeSegments[i];

               if (segment.size > 0)
               {
                  segment.select(scene.gl, shader);
                  scene.gl.drawArrays(scene.gl.LINES, 0, segment.size);
                  scene.gl.flush();
               }
            }
         }

         scene.popMatrix();

         this.updateProjectionTrackers();
      }
   },

   pick: function(viewPosition)
   {
      var result = null;

      if (this.visible)
      {
         var tempVec = vec3.create();
         var systems = this.systems;
         var solarSystem;
         var projection;

         for ( var i = 0; ((result == null) || (result.getDistance() > 0.0001)) && (i < systems.length); i++)
         {
            solarSystem = systems[i];

            projection = this.projectSolarSystem(solarSystem, tempVec);

            if (projection != null) // ignore systems behind the view
            {
               var dx = projection.x - viewPosition.x;
               var dy = projection.y - viewPosition.y;

               {
                  var dist = Math.sqrt((dx * dx) + (dy * dy));

                  if ((dist < 0.05) && ((result == null) || (dist < result.getDistance())))
                  {
                     result = new upro.scene.PickResult(solarSystem, projection, dist);
                  }
               }
            }
         }
      }

      return result;
   },

   projectSolarSystem: function(solarSystem, temp)
   {
      var entry = this.systemProjections[solarSystem.id];
      var result = null;

      if (!entry || (entry.confirmed < 5))
      {
         vec3.subtract(solarSystem.position, solarSystem.galaxy.position, temp);
         vec3.scale(temp, 1 / solarSystem.galaxy.scale);
         vec3.add(temp, this.position);
         // rotate if necessary

         var tempResult = this.scene.project(temp);

         if (!entry)
         {
            entry =
            {
               "result": tempResult,
               "confirmed": 1
            };
            this.systemProjections[solarSystem.id] = entry;
         }
         if ((entry.result == null) && (tempResult == null))
         { // projection stays behind camera
            entry.confirmed++;
         }
         else if ((entry.result == null) || (tempResult == null) || (tempResult.x != entry.result.x)
               || (tempResult.y != entry.result.y))
         {
            /*
             * this is some nasty hack; apparently, shortly, after finishing a mouse operation, a projection result is
             * simply wrong. I have no idea why this is happening; Perhaps the code is querying not-yet verified
             * mvMatrix values - i.e., some that were based on an old mouse data.
             */
            entry.result = tempResult;
            entry.confirmed = 1;
         }
         else
         { // result stays the same
            entry.confirmed++;
         }
         result = tempResult;
      }
      else
      {
         result = entry.result;
      }

      return result;
   }

});
