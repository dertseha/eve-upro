function EveInfoExtractorNull()
{
   this.get = function(name)
   {
      return null;
   };
}

module.exports = EveInfoExtractorNull;
