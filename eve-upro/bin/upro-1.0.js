/*!
 * Copyright (c) 2011-2012 Christian Haas
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

if (typeof upro == "undefined")
{
   var upro = {};
}

/**
 * Static helper for creating UUID values
 */

upro.Uuid =
{
   /** The all-zero UUID */
   Empty: "00000000-0000-0000-0000-000000000000",

   /**
    * Creates a V4 (pseudo-random) UUID value
    * Found on: https://gist.github.com/982883
    * Note, yuicompressor expands the numbers, so meh :)
    * @param a: placeholder for recursion
    * @return a UUID value
    */
   newV4: function(a)
   {
      return a             // if the placeholder was passed, return
         ?  (              // a random number from 0 to 15
            a ^            // unless b is 8,
            Math.random()  // in which case
            * 16           // a random number from
            >> a/4         // 8 to 11
            ).toString(16) // in hexadecimal
         :  (              // or otherwise a concatenated string:
            [1e7] +        // 10000000 +
            -1e3 +         // -1000 +
            -4e3 +         // -4000 +
            -8e3 +         // -80000000 +
            -1e11          // -100000000000,
            ).replace
               (           // replacing
               /[018]/g,    // zeroes, ones, and eights with
               upro.Uuid.newV4 // random hex digits
               );
   }
};

