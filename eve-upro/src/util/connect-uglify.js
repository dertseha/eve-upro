var fs = require('fs');

var uglify = require('uglify-js');

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
      var source = fs.readFileSync(sourceFile, 'utf8');
      var strictParsing = true;
      var ast = uglify.parser.parse(source, strictParsing);
      var mangleOptions =
      {
         toplevel: false,
         except: [ '$super' ]
      };

      ast = uglify.uglify.ast_lift_variables(ast);
      ast = uglify.uglify.ast_mangle(ast, mangleOptions);
      ast = uglify.uglify.ast_squeeze(ast);
      result += uglify.uglify.gen_code(ast);

      result += '\n';
   });

   return result;
}

function Uglifier(resource, sources, header, options)
{
   var uglified = new Buffer(process(sources, header, options || {}));

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
