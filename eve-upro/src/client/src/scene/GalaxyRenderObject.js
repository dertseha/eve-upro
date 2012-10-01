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

      this.routes = {};
      this.routeSegments = [];
      this.addRoute('JumpCorridors');
      this.addRoute('ActiveRoute');
      this.addRoute('Autopilot');

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

   addSolarSystemVertices: function(solarSystem, list)
   {
      var galaxy = solarSystem.galaxy;
      var systemScale = galaxy.scale;
      var center = galaxy.position;

      list.push((solarSystem.position[0] - center[0]) / systemScale, (solarSystem.position[1] - center[1])
            / systemScale, (solarSystem.position[2] - center[2]) / systemScale);

      return list;
   },

   addSolarSystem: function(solarSystem)
   {
      this.systemVertices = this.addSolarSystemVertices(solarSystem, this.systemVertices);
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

   addRoute: function(routeName)
   {
      var route = this.routes[routeName];

      if (!route)
      {
         route =
         {
            vertices: [],
            colors: [],
            segment: null
         };

         this.routes[routeName] = route;
      }
   },

   addRouteEdge: function(routeName, system1, system2, color)
   {
      var route = this.routes[routeName];

      this.addEdge(system1, system2, route.vertices, route.colors, color);
      this.updateRouteSegments();
   },

   clearRoute: function(routeName)
   {
      var route = this.routes[routeName];

      route.vertices.clear();
      route.colors.clear();
      this.updateRouteSegments();
   },

   /**
    * Returns the position to be used for given solar system and a reference. Will return a position a bit off the
    * galaxy relative to the reference if the reference is from another galaxy.
    * 
    * @param solarSystem the system for which to retrieve the position for
    * @param solarSystemReference a reference specifying the reference
    * @returns a vector to use
    */
   getSolarSystemPosition: function(solarSystem, solarSystemReference)
   {
      var galaxy = solarSystemReference.galaxy;
      var systemScale = galaxy.scale;
      var center = galaxy.position;
      var pos = null;

      if (solarSystem.galaxy.id == galaxy.id)
      {
         pos = vec3.scale(vec3.subtract(solarSystem.position, center, vec3.create()), 1 / systemScale);
      }
      else
      {
         pos = vec3.scale(vec3.subtract(solarSystemReference.position, center, vec3.create()), 1 / systemScale);
         vec3.add(pos, vec3.create([ 0.0, -10.0, 0.0 ]));
      }

      return pos;
   },

   addEdge: function(system1, system2, vertices, colors, color)
   {
      var pos1 = this.getSolarSystemPosition(system1, system1);
      var pos2 = this.getSolarSystemPosition(system2, system1);
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

      for ( var routeName in this.routes)
      {
         var route = this.routes[routeName];

         route.segment = new upro.scene.VertexBufferSegment();
         route.segment.create(scene.gl);
         this.routeSegments.push(route.segment);
      }

      $super(scene);

      this.updateRouteSegments();

      this.loadTexture();
   },

   updateRouteSegments: function()
   {
      var scene = this.scene;

      for ( var routeName in this.routes)
      {
         var route = this.routes[routeName];

         if (route.segment)
         {
            route.segment.update(scene.gl, route.vertices, route.colors, 0, route.vertices.length / 3);
         }
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

         gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

         gl.generateMipmap(gl.TEXTURE_2D);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

         obj.systemShader.use();
         gl.uniform1i(gl.getUniformLocation(obj.systemShader.getHandle(), "texture"), 0);
         obj.ready = true;
      };

      texture.image.src = 'data:image/png;base64,'
            + 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABiklEQVR42u2Xv2qDUBSHQx7BJbhk'
            + 'dBEcXUoWx46BLKEvIPgCLllchMySqXOXLhkDEvAZQnY3QfIIAfsLfNlqahLB29ILHxcu5/zOOfef'
            + '19Hov/2yNhaWmApHuMKjdxi3sOs9sE2wmXgVC7EUb/QLxmfY2X0lYlFhQKBQxCIRqVjTJ4yH2AX4'
            + 'Wc8EnwhfzEVEkI34EFuxEzn9lvENdhF+PjoPBX+hmktlmfgUhTiIUlSipi8ZL7DL8FuiM7l32n2c'
            + 'V+KdSo/iJJobnLDL8Vuh43ddjjFrN6eCi8ieCs8/BL9yxn6Pf4ye22Vj2mygiGnMEWseoMQ/Qy9A'
            + '/2b1HlOWsJbHOyr/biaO6CToerdmweIch+zmosOaNx32RIFeiH7rXphymcQcqcOTwa8c0IvRn7Yl'
            + '4HCjJZzrsqcESvQS9J22BFzWKeVyqXpKoEIvRd9tS8Djbl+ze+ueEqjRW6PvGTsDg++BwU/B4PfA'
            + '4Dfh4N8CI76Gg78HjHgRGfEmNOJVbMR/gRF/Rn+3fQFyhpQHNxvQUQAAAABJRU5ErkJggg==';
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
