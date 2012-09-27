var fs = require('fs');

var winston = require('winston');
var logger = winston.loggers.get('root');

var uglify = require('uglify-js');

/**
 * Processes one file and returns the result
 * 
 * @param sourceFile file name
 * @param strictParsing true if strict parsing should be applied
 * @returns the processed result
 */
function processFile(sourceFile, strictParsing)
{
   var source = fs.readFileSync(sourceFile, 'utf8');
   var ast = uglify.parser.parse(source, strictParsing);
   var mangleOptions =
   {
      toplevel: false,
      except: [ '$super' ]
   };

   ast = uglify.uglify.ast_lift_variables(ast);
   ast = uglify.uglify.ast_mangle(ast, mangleOptions);
   ast = uglify.uglify.ast_squeeze(ast);

   return uglify.uglify.gen_code(ast);
}

/**
 * Processes a list of source files and returns them with an optional header at the top.
 * 
 * Done as per https://github.com/mishoo/UglifyJS
 */
function process(sources, header, options)
{
   var result = header || '';

   sources.forEach(function(sourceFile)
   {
      var processed = null;

      try
      {
         processed = processFile(sourceFile, true);
      }
      catch (ex)
      {
         var message = 'Failed to strict parse [' + sourceFile + ']: ' + ex;

         logger.warn(message);
         console.error(message);
         processed = processFile(sourceFile, false);
      }

      result += processed;
      result += ';\n'; // the semicolon is important to avoid problems that might come from concatenation
   });

   return result;
}

function Uglifier(resource, sources, header, options)
{
   var uglified = '';

   if (!options || !options.debug)
   {
      uglified = new Buffer(process(sources, header, options || {}));
   }

   return (function(req, res, next)
   {
      if (req.url == resource)
      {
         res.header('Content-Type', 'application/javascript');
         if (!options || !options.debug)
         {
            res.header('Content-Length', uglified.length);
            res.end(uglified);
         }
         else
         {
            var i = 0;

            function continueWriting()
            {
               var ok = true;

               while (ok && (i < sources.length))
               {
                  var source = fs.readFileSync(sources[i++], 'utf8');

                  ok = res.write(new Buffer(source + '\n'));
               }
               if (i >= sources.length)
               {
                  res.end();
               }
            }
            res.on('drain', continueWriting);
            if (res.write(header))
            {
               continueWriting();
            }
         }
      }
      else
      {
         next();
      }
   });
}

module.exports = Uglifier;
