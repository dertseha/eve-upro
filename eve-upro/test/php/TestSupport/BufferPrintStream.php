<?php
require_once 'io/PrintStream.php';

/**
 * A BufferPrintStream holds all the printed lines in an internal array for later retrieval
 */
class BufferPrintStream implements \upro\io\PrintStream
{
   /**
    * The buffer
    * @var unknown_type
    */
   private $buffer;

   function __construct()
   {
      $this->buffer = array();
   }

   /** {@inheritDoc} */
   public function println($text)
   {
      $this->buffer[] = $text;
   }

   /**
    * @return number of lines in the buffer
    */
   public function count()
   {
      return count($this->buffer);
   }

   /**
    * Returns the line for given index or empty string if invalid index
    * @param integer $index of the line to retrieve
    * @return string line for given index or empty string
    */
   public function getLine($index)
   {
      $result = "";

      if (($index >= 0) && ($index < $this->count()))
      {
         $result = $this->buffer[$index];
      }

      return $result;
   }

   /**
    * The whole buffer concatenated with a '\n' character
    * @return string the whole buffer
    */
   public function toString()
   {
      $result = "";

      foreach ($this->buffer as $line)
      {
         $result .= $line;
         $result .= "\n";
      }

      return $result;
   }
}
