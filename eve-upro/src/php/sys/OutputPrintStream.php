<?php
namespace upro\sys
{
require_once realpath(dirname(__FILE__)) . '/../io/PrintStream.php';

/**
 * OutputPrintStream uses the print() function to write the lines
 */
class OutputPrintStream implements \upro\io\PrintStream
{
   /** {@inheritDoc} */
   public function println($text)
   {
      print($text);
      print("\n");
   }
}

}
