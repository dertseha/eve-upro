var UproRender =
{
   template: uki.theme.template('upro-render'),
   render: function(data, rect, i)
   {
      return uki.extend(this.template, [ undefined, undefined, undefined, data[0] || data[1] ]).join('');
   },
   setSelected: function(container, data, state, focus)
   {
      container.style.backgroundColor = state && focus ? '#625f42' : state ? '#524f32' : '';
   }
};
var RouteRender = uki.extend({}, UproRender,
{
   template: uki.theme.template('route-render'),
   render: function(data, rect, i)
   {
      // var result = uki.extend(this.template, [ undefined, undefined, undefined, data[0], undefined, data[1],
      // undefined,
      // data[2], undefined, data[3] + ' mmm' ]);
      // var array = Array.prototype.slice(result);

      return data.join(':');
   }
});

function createRouteTable(panelId)
{
   var element = $(panelId);
   var dimension = element.getDimensions();

   var temp = uki(
   {
      view: 'ScrollPane',
      rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
      anchors: 'left top right bottom',
      childViews: [
      {
         view: 'List',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'top left right bottom',
         // background: 'theme(box)',
         // background: '#' + getRandomColorValue() + getRandomColorValue() + getRandomColorValue(),
         id: 'uki' + panelId,
         columns: [
         {
            view: 'table.NumberColumn',
            label: '',
            width: 20
         // ,
         // sort: 'ASC'
         },
         {
            view: 'table.NumberColumn',
            label: 'Solar System',
            resizable: true,
            width: 100
         } ],
         // multiselect: true,
         style:
         {
            fontSize: '12px',
            lineHeight: '13px'
         },
         render: RouteRender
      } ]
   });

   temp.attachTo(element);

   var table = uki('#uki' + panelId);

   var testData = [];

   for ( var i = 0; i < 100; i++)
   {
      testData.push([ i * 2 + 0, 'Rens' ]);
      testData.push([ i * 2 + 1, 'Frarn' ]);
   }

   table.data(testData);
}

function createRouteControls(panelId)
{
   var element = $(panelId);
   var dimension = element.getDimensions();

   var temp = uki(
   {
      view: 'Box',
      rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
      anchors: 'top left right bottom',
      background: 'theme(box)',
      id: 'uki' + panelId,
      childViews: []
   });

   temp.attachTo(element);
}

function createHexagon(paper, scale)
{
   var diagFactor = upro.hud.HudSystem.HexagonDiagFactor;
   var basePath = "M0,-" + (2 * scale) + "L" + (diagFactor * scale) + ",-" + scale + "V" + scale + "L0," + (2 * scale)
         + "L-" + (diagFactor * scale) + "," + scale + "V-" + scale + "Z";
   /*
    * This one has 'edges' on the left and right sides var basePath = "M-" + (2 * scale) + ",0" + "L-" + scale + ",-" +
    * (diagFactor * scale) + "H" + scale + "L" + (2 * scale) + ",0" + "L" + scale + "," + (diagFactor * scale) + "H-" +
    * scale + "Z";
    */
   var hexagon = paper.path(basePath);

   hexagon.attr(
   {
      fill: "#423f22",
      "fill-opacity": 0.5,
      stroke: "#741",
      "stroke-width": 2,
      "stroke-opacity": 0.8
   });

   return hexagon;
}

function createDirectAccessBar(panelId)
{
   var element = $(panelId);
   var dimension = element.getDimensions();
   var paper = new Raphael(element, "100%", "100%");
   var hudSystem =
   {
      paper: paper,
      createHexagon: function(scale)
      {
         return createHexagon(paper, scale);
      }
   };
   // var shift = upro.hud.Button.getShiftFull(0);
   var shift = upro.hud.Button.getOffset[3](0);
   var baseOffset =
   {
      x: upro.hud.Button.getOffset[2](0).x,
      y: upro.hud.Button.Scale * 2 + 1
   };

   var button = new upro.hud.Button(hudSystem, baseOffset.x, baseOffset.y);// dimension.width / 2, shift.x / 1.5);

   button.clickedCallback = function()
   {
      var temp = $("nwCtrl");

      if (temp.visible())
      {
         temp.hide();
      }
      else
      {
         temp.show();
      }
   };

}
