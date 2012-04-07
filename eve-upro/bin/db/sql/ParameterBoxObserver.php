<?php
namespace upro\db\sql
{

/**
 * An observer for a ParameterBox
 */
interface ParameterBoxObserver
{
   /**
    * Called when the value of the ParameterBox changed
    * @param \mixed $value the new value
    */
   function onValueChanged($value);
}

}