<?php
namespace upro\db\sql
{

/**
 * An SQL text with an optional list of parameters
 */
class ParameterizedSqlText
{
   /**
    * @var string SQL text
    */
   private $text;

   /**
    * @var array list of ParameterBox entries
    */
   private $parameters;

   /**
    * Constructor
    * @param string $text to set
    * @param array $parameters
    */
   function __construct($text, $parameters = array())
   {
      $this->text = $text;
      $this->parameters = array_slice($parameters, 0);
   }

   /**
    * @return string the text
    */
   public function getText()
   {
      return $this->text;
   }

   /**
    * @return int the amount of parameters
    */
   public function getParameterCount()
   {
      return count($this->parameters);
   }

   /**
    * Returns the parameter at given index
    * @param int $index the index to query
    * @return \upro\db\sql\ParameterBox the requested parameter
    */
   public function getParameter($index)
   {
      return $this->parameters[$index];
   }

   /**
    * Returns a combined SQL text consisting of this text and the given other, with an optional delimeter in between
    * @param \upro\db\sql\ParameterizedSqlText $other the other text to append
    * @param string $delimeter to put between the two texts
    * @param string $suffix to add at the end of the two texts
    * @return \upro\db\sql\ParameterizedSqlText the resulting text
    */
   public function append(\upro\db\sql\ParameterizedSqlText $other, $delimeter = '', $suffix = '')
   {
      $text = $this->text . $delimeter . $other->text . $suffix;
      $parameters = array_merge($this->parameters, $other->parameters);

      return new \upro\db\sql\ParameterizedSqlText($text, $parameters);
   }
}

}
