function EveInfoExtractorHeaders(headers)
{
   this.headers = headers;

   this.get = function(name)
   {
      return this.headers[name];
   };
}

module.exports = EveInfoExtractorHeaders;
