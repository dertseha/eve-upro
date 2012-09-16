/**
 * This is a TSP route finder using the genetic algorithm.
 * 
 * <ul>
 * <li>Population: Initialized with a certain amount of random routes. Is sorted by fitness (cost) and only a certain
 * limit kept across generations.</li>
 * <li>Selection: Two parents are selected random from the remaining population.</li>
 * <li>Offspring: Only two generated per generation - not an entire new population created.</li>
 * <li>Crossover: One, position random; Second half is optimized (system swapped only if causes lower cost)</li>
 * <li>Mutation: Percentage based</li>
 * <li>Abort: Either through hard limit or an uncontested limit (best stayed on top for x generations)</li>
 * </ul>
 * 
 * Great deal of information gathered from here:
 * <ul>
 * <li>http://www.obitko.com/tutorials/genetic-algorithms/index.php [2011-09]</li>
 * <li>http://elearning.najah.edu/OldData/pdfs/Genetic.ppt [2011-09]</li>
 * </ul>
 */
upro.nav.finder.RouteFinderGeneticTSP = Class.create(upro.nav.finder.RouteFinderAbstractTSP,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.population = [];
      this.populationLimit = 10; // amount of best solutions to keep across generations. parents selected random.
      this.initialPopulationCount = 50; // how many to create randomly first
      this.generationLimit = 40000; // How many generations to run at most
      this.uncontestetLimit = 4000; // If the best stays top for this amount, the algorithm stops
      this.mutationPercentage = 0.5; // 0 turns it off
   },

   /** {@inheritDoc} */
   tspStart: function()
   {
      for ( var i = 0; i < this.initialPopulationCount; i++)
      {
         this.createRandomCitizen();
      }
      this.onRouteFound(this.population[0].route.slice(0)); // notify the first route
      this.generation = 0;
      this.uncontestet = 0;

      return this.runGeneration;
   },

   /**
    * Runs another generation or aborts if limit criteria have been met
    * 
    * @return next function or undefined
    */
   runGeneration: function()
   {
      var nextFunction = this.runGeneration;

      if (this.population.length > this.populationLimit)
      { // trim down the population to the requested limit
         this.population.splice(this.populationLimit, this.population.length - this.populationLimit);
      }
      if ((this.generation < this.generationLimit) && (this.uncontestet < this.uncontestetLimit))
      { // should run at all?
         var parent1 = this.population[this.getRandomIndex(this.population.length)];
         var parent2 = this.population[this.getRandomIndex(this.population.length)];
         var crossover = 1 + this.getRandomIndex(this.waypoints.length);

         this.generateOffspring(parent1, parent2, crossover);
         this.generateOffspring(parent2, parent1, crossover);

         this.generation++;
         this.uncontestet++;
      }
      else
      {
         nextFunction = undefined;
      }

      return nextFunction;
   },

   /**
    * Returns a random integer value from 0 up to, not including, a limit
    * 
    * @param limit to use
    * @return a random integer value from 0 up to, not including, a limit
    */
   getRandomIndex: function(limit)
   {
      var value = Math.floor(Math.random() * limit);

      if (value >= limit)
      { // sadly, documentation seems scarce and not concise - is it now 'including' or 'less than' 1?
         // anyway, simply paranoia then
         value = limit - 1;
      }

      return value;
   },

   /**
    * Creates an empty chromosome
    * 
    * @return an empty chromosome
    */
   createChromosome: function()
   {
      var chromosome =
      {
         cost: new upro.nav.finder.PathFinderCost(),
         route: []
      };

      return chromosome;
   },

   /**
    * Creates one random citizen and adds it to the population
    */
   createRandomCitizen: function()
   {
      var chromosome = this.createChromosome();

      chromosome.route.push(this.sourceSystem);
      for ( var i = 0; i < this.waypoints.length; i++)
      {
         this.addRandomWaypointToChromosome(chromosome);
      }
      if (this.destinationSystem)
      {
         chromosome.route.push(this.destinationSystem);
      }
      chromosome.cost = this.calculateCost(chromosome);
      this.integrateSorted(chromosome);
   },

   /**
    * Adds a random waypoint system to the chromosome
    * 
    * @param chromosome to modify
    */
   addRandomWaypointToChromosome: function(chromosome)
   {
      var added = false;

      while (!added)
      {
         var index = this.getRandomIndex(this.waypoints.length);
         var system = this.waypoints[index];

         if (!this.chromosomeContainsSystem(chromosome, system))
         {
            chromosome.route.push(system);
            added = true;
         }
      }
   },

   /**
    * Returns true if the given chromosome already contains given system
    * 
    * @param chromosome to check
    * @param system to search for
    * @return true if included
    */
   chromosomeContainsSystem: function(chromosome, system)
   {
      var rCode = false;

      for ( var i = 1; !rCode && (i < chromosome.route.length); i++)
      {
         var temp = chromosome.route[i];

         rCode = temp.id == system.id;
      }

      return rCode;
   },

   /**
    * Calculates the cost of the chromosome
    * 
    * @param chromosome to use
    * @return the cost
    */
   calculateCost: function(chromosome)
   {
      var cost = new upro.nav.finder.PathFinderCost();

      for ( var i = 0; i < (chromosome.route.length - 1); i++)
      {
         var systemA = chromosome.route[i];
         var systemB = chromosome.route[i + 1];
         var edge = this.edgeMap[systemA.id][systemB.id];

         cost = cost.plus(edge.path.totalCost, this.rules);
      }

      return cost;
   },

   /**
    * Integrates the given chromosome in the population at the ordered position
    * 
    * @param chromosome to add
    * @param true if it became the first
    */
   integrateSorted: function(chromosome)
   {
      var done = false;
      var isFirst = false;
      var i;

      for (i = this.population.length - 1; !done && (i >= 0); i--)
      { // find a place from the back (worst) first - this way a bad one is handled sooner
         var other = this.population[i];
         var result = chromosome.cost.compareTo(other.cost, this.rules);

         if (((i > 0) && (result > 0)) || ((i == 0) && (result >= 0)))
         {
            this.population.splice(i + 1, 0, chromosome);
            done = true;
         }
      }
      if (!done)
      { // this new one is the new best
         this.population.splice(0, 0, chromosome);
         isFirst = true;
      }

      return isFirst;
   },

   /**
    * Generates an offspring from given parents and using given crossover point
    * 
    * @param parent1 first parent
    * @param parent2 second parent
    * @param crossover point where to split
    */
   generateOffspring: function(parent1, parent2, crossover)
   {
      var offspring = this.createChromosome();
      var mutated = (Math.random() * 100) < this.mutationPercentage;
      var i;

      for (i = 0; i < crossover; i++)
      { // copy first half
         offspring.route.push(parent1.route[i]);
      }
      for (i = crossover; i < parent2.route.length; i++)
      { // copy second half
         var system1 = parent1.route[i];
         var system2 = parent2.route[i];

         if (!this.chromosomeContainsSystem(offspring, system2))
         { // system2 might be new here
            var testOptimize = !mutated && (system1.id != system2.id)
                  && !this.chromosomeContainsSystem(offspring, system1);

            offspring.route.push(system2);
            if (testOptimize)
            { // test whether adding system2 here makes it truly better
               var cost2 = this.calculateCost(offspring);
               offspring.route[offspring.route.length - 1] = system1;
               var cost1 = this.calculateCost(offspring);

               if (cost1.compareTo(cost2, this.rules) >= 0)
               { // system2 is better
                  offspring.route[offspring.route.length - 1] = system2;
               }
            }
         }
         else if (!this.chromosomeContainsSystem(offspring, system1))
         { // system2 already contained, can't splice
            offspring.route.push(system1);
         }
         else
         { // this path is entered because of several optimizations before. Take a random system
            this.addRandomWaypointToChromosome(offspring);
         }
      }
      if (mutated)
      { // apply mutation
         this.mutate(offspring);
      }

      offspring.cost = this.calculateCost(offspring);
      if (this.integrateSorted(offspring))
      {
         this.onRouteFound(offspring.route.slice(0));
         this.uncontestet = 0;
      }
   },

   /**
    * Mutates the given chromosome by swapping two random waypoints
    * 
    * @param chromosome to mutate
    */
   mutate: function(chromosome)
   {
      var index1 = 1 + this.getRandomIndex(this.waypoints.length);
      var index2 = 1 + this.getRandomIndex(this.waypoints.length);
      var temp = chromosome.route[index1];

      chromosome.route[index1] = chromosome.route[index2];
      chromosome.route[index2] = temp;
   }
});
