CellState = Object.create({});
CellState.tick = function(aliveNeighbours, stack)
{
   return 'undead';
};
CellState.isAlive = function()
{
   return false;
};

DeadCellState = Object.create(CellState);
DeadCellState.tick = function(aliveNeighbours)
{
   var result = 'remain';

   if (aliveNeighbours === 2)
   {
      result = 'birth';
   }
   else if (Math.random() < 0.0125)
   {
      result = 'birth';
   }

   return result;
};

AliveCellState = Object.create(CellState);
AliveCellState.tick = function(aliveNeighbours)
{
   var result = 'remain';

   if (aliveNeighbours < 3)
   {
      result = 'die';
   }
   else if (aliveNeighbours > 4)
   {
      result = 'die';
   }

   return result;
};

AliveCellState.isAlive = function()
{
   return true;
};

Cell = Object.create({});

Cell.state = CellState;

Cell.getNeighbourPosition = function(index)
{
   var offset = upro.hud.Button.getOffset[index](0);
   var position =
   {
      x: this.position.x + offset.x,
      y: this.position.y + offset.y
   };

   return position;
};

Cell.setNeighbour = function(index, other)
{

};

Cell.isAlive = function()
{
   return this.state.isAlive();
};

Cell.tick = function()
{
   var aliveNeighbours = this.neighbours.foldLeft(function(cell, amount)
   {
      return cell.isAlive() ? amount + 1 : amount;
   }, 0);

   return this.state.tick(aliveNeighbours);
};

getCell = function(world, position)
{
   var cell = Object.create(Cell);

   // cell.world = world;
   cell.position =
   {
      x: position.x,
      y: position.y
   };

   cell.neighbours = [ Cell, Cell, Cell, Cell, Cell, Cell ];
   cell.state = DeadCellState;

   cell.button = new upro.hud.Button(hudSystem, cell.position.x, cell.position.y);
   cell.button.clickedCallback = function()
   {
      cell.die();
   };
   cell.button.wholeSet.attr(
   {
      "fill-opacity": 0.0,
      "stroke-opacity": 0.0
   });

   var isAnimating = false;

   var animateDeath = function()
   {
      if (!isAnimating)
      {
         isAnimating = true;
         cell.button.wholeSet.animate(
         {
            "fill-opacity": 0.0,
            "stroke-opacity": 0.0
         }, 200 + 1000 * Math.random(), ">", function()
         {
            isAnimating = false;
            if (cell.isAlive())
            {
               animateBirth();
            }
         });
      }
   };

   var animateBirth = function()
   {
      if (!isAnimating)
      {
         isAnimating = true;
         cell.button.wholeSet.animate(
         {
            "fill-opacity": 0.8,
            "stroke-opacity": 1
         }, 200 + 1000 * Math.random(), "<", function()
         {
            isAnimating = false;
            if (!cell.isAlive())
            {
               animateDeath();
            }
         });
      }
   };

   cell.die = function()
   {
      this.state = DeadCellState;
      animateDeath();
   };

   cell.birth = function()
   {
      this.state = AliveCellState;
      animateBirth();
   };

   cell.setNeighbour = function(index, other)
   {
      this.neighbours[index] = other;
   };

   return cell;
};

world = Object.create({});
world.cells = {};

world.getCellKey = function(position)
{
   return '' + position.x.toFixed(2) + ':' + position.y.toFixed(2);
};

world.createCell = function(position)
{
   var cell = getCell(this, position);
   var i;

   this.cells[this.getCellKey(cell.position)] = cell;

   for (i = 0; i < 6; i++)
   {
      this.addNeighbour(cell, i);
   }

   return cell;
};

world.addNeighbour = function(cell, index)
{
   var position = cell.getNeighbourPosition(index);
   var key = this.getCellKey(position);
   var otherCell = this.cells[key];

   if (otherCell)
   {
      var mirror = [ 3, 4, 5, 0, 1, 2 ];

      cell.setNeighbour(index, otherCell);
      otherCell.setNeighbour(mirror[index], cell);
   }
};

seedCell = function(position)
{
   if ((position.x >= 0) && (position.x <= hudSystem.paper.w) && (position.y >= 0) && (position.y <= hudSystem.paper.h))
   {
      var i;
      var key = world.getCellKey(position);
      var cell = world.cells[key];

      if (!cell)
      {
         cell = world.createCell(position);
         if (Math.random() < 0.005)
         {
            cell.birth();
         }
         for (i = 0; i < 6; i++)
         {
            seedCell(cell.getNeighbourPosition(i));
         }
      }
   }
};

startWorld = function()
{
   var position =
   {
      x: hudSystem.paper.w / 2,
      y: hudSystem.paper.h / 2
   };

   seedCell(position);

   var tickPopulation = function()
   {
      var states =
      {
         remain: [],
         birth: [],
         die: []
      };
      var cell;

      for ( var key in world.cells)
      {
         cell = world.cells[key];

         states[cell.tick()].push(cell);
      }

      return states;
   };

   var onTimer = function()
   {
      var states = tickPopulation();

      states.die.forEach(function(cell)
      {
         cell.die();
      });
      states.birth.forEach(function(cell)
      {
         cell.birth();
      });
   };

   setInterval(onTimer, 500);
};
