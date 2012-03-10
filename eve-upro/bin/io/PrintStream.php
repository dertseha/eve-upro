<?php
namespace upro\io
{

/**
 * A PrintStream is for writing lines of text
 */
interface PrintStream
{
	/**
	 * Writes given text and appends a line break.
	 * @param string $text to write
	 */
	function println($text);
}

}