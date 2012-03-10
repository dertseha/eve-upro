<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../io/PrintStream.php';
require_once realpath(dirname(__FILE__)) . '/HtmlPageBuilder.php';

class StreamHtmlPageBuilder implements HtmlPageBuilder
{
   /**
    * @var \upro\io\PrintStream to write to
    */
   private $printStream;

   /**
    * @var boolean
    */
   private $bodyStarted;

   function __construct(\upro\io\PrintStream $printStream)
   {
      $this->printStream = $printStream;
   }

   /** {@inheritDoc} */
   public function setTitle($title)
   {
      $this->printStream->println("<title>" . $title . "</title>");
   }

   /** {@inheritDoc} */
   public function enterBody()
   {
      $this->ensureBodyStarted();
   }

   /** {@inheritDoc} */
   public function addNode($tag, $attributes, $body)
   {
      $bodyIsEmpty = empty($body);
      $endTag = "</" . $tag . ">";

      {
         $startTag = "<" . $tag;
         foreach ($attributes as $key => $value)
         {
            $startTag .= " " . $key . "=\"" . $value . "\"";
         }
         $startTag .= ">";
         if ($bodyIsEmpty)
         {
            $startTag .= $endTag;
         }
         $this->printStream->println($startTag);
      }
      if (!$bodyIsEmpty)
      {
         $this->printStream->println($body);
         $this->printStream->println($endTag);
      }
   }

   /**
    * Starts writing the HTML tags
    */
   public function start()
   {
      $this->printStream->println("<!doctype html>");
      $this->printStream->println("<html lang=en>");
      $this->printStream->println("<head>");
      $this->printStream->println("<meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\"/>");
   }

   /**
    * Finishes the page (writing closing tags, such as /html)
    */
   public function finish()
   {
      $this->ensureBodyStarted();
      $this->printStream->println("</body>");
      $this->printStream->println("</html>");
   }

   /**
    * Ensures that the current open main tag is <body>
    */
   private function ensureBodyStarted()
   {
      if (!$this->bodyStarted)
      {
         $this->printStream->println("</head>");
         $this->printStream->println("<body>");
         $this->bodyStarted = TRUE;
      }
   }

}

}