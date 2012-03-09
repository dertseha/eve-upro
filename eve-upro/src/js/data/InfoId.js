/**
 * An info id is the key for any information structure
 */
upro.data.InfoId = Class.create(
{
   /**
    * Constructor
    * @param type a string identification of the type
    * @param id an optional parameter. If omitted, a new UUID value is created
    */
   initialize: function(type, id)
   {
      this.type = type;
      this.id = id ? id : upro.Uuid.newV4();
   },

   /**
    * Returns string presentation
    * @return string presentation
    */
   toString: function()
   {
      return "" + this.type + "[" + this.id + "]";
   },

   /**
    * Returns the type
    * @return the type
    */
   getType: function()
   {
      return this.type;
   },

   /**
    * Returns the id
    * @return the id
    */
   getId: function()
   {
      return this.id;
   }
});

/** The 'System' entry is the root object for everything */
upro.data.InfoId.System = new upro.data.InfoId("System", upro.Uuid.Empty);
