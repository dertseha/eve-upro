<?php
namespace upro\util
{
require_once realpath(dirname(__FILE__)) . '/../io/SimpleValueStore.php';
require_once realpath(dirname(__FILE__)) . '/../util/logging/LoggerProvider.php';

/**
 * A provider for configuration
 */
class ConfigProvider
{
   /**
    * Path name where to find the default configuration files
    * @var string
    */
   const PATH_NAME_CONFIG_DEFAULTS = '/configDefaults/';

   /**
    * Path name where to find site specific configuration files
    * @var string
    */
   const PATH_NAME_CONFIG_SITE = '/configSite/';

   /**
    * The name of the configuration file
    * @var string
    */
   const FILE_NAME_CONFIG_FILE = 'uproConfig.xml';

   /**
    * The configuration
    * @var \upro\io\ValueStore
    */
   private $configuration;

   /**
    * Constructor
    * @param \upro\io\ValueStore $configuration the initialized configuration
    */
   function __construct(\upro\io\ValueStore $configuration)
   {
      $this->configuration = $configuration;
   }

   /**
    * Returns the configuration
    * @return \upro\io\ValueStore the configuration for the system
    */
   public function getConfig()
   {
      return $this->configuration;
   }

   /**
    * Loads a set of configuration from given base path
    * @param string $basePath the base path to operate relatively to
    * @return \upro\util\ConfigProvider an initialized configuration provider
    */
   public static function load($basePath)
   {
      $configuration =  new \upro\io\SimpleValueStore();

      $configuration = \upro\util\ConfigProvider::loadXmlConfiguration($configuration, $basePath,
            $basePath . \upro\util\ConfigProvider::PATH_NAME_CONFIG_DEFAULTS, \upro\util\ConfigProvider::FILE_NAME_CONFIG_FILE);
      $configuration = \upro\util\ConfigProvider::loadXmlConfiguration($configuration, $basePath,
            $basePath . \upro\util\ConfigProvider::PATH_NAME_CONFIG_SITE, \upro\util\ConfigProvider::FILE_NAME_CONFIG_FILE);

      return new \upro\util\ConfigProvider($configuration);
   }

   /**
    * Loads configuration from an XML file with given file name
    * @param \upro\io\ValueStore $configuration the configuration to store the values in
    * @param string $basePath base path context information
    * @param string $configPath configuration path context information
    * @param string $fileName the name of the file to read
    */
   private static function loadXmlConfiguration(\upro\io\ValueStore $configuration, $basePath, $configPath, $fileName)
   {
      if (file_exists($configPath . $fileName))
      {
         $xml = \upro\util\ConfigProvider::loadXmlFile($configPath . $fileName);

         foreach ($xml->configEntry as $configEntry)
         {
            $attributes = $configEntry->attributes();
            $name = '' . $attributes['name'];

            if (isset($configEntry->value))
            {
               $value = \upro\util\ConfigProvider::parseConfigValue($configEntry->value, $basePath, $configPath);

               //echo "setting: " . $name . "=[" . $value . "]<br />";
               $configuration->set($name, $value);
            }
         }
      }

      return $configuration;
   }

   /**
    * Loads the XML data from a file with given name
    * @param string $fileName the name of the file
    * @throws \Exception when the file contained errors
    * @return \SimpleXMLElement the resulting XML structure
    */
   private static function loadXmlFile($fileName)
   {
      $errorText = null;

      libxml_clear_errors();
      $oldErrors = libxml_use_internal_errors(true);

      $xml = simplexml_load_file($fileName);
      if ($xml === false)
      {
         $errors = libxml_get_errors();

         $errorText = '';
         foreach ($errors as $error)
         {
            $errorText .= $error->message;
         }
      }
      libxml_clear_errors();
      libxml_use_internal_errors($oldErrors);
      if (!is_null($errorText))
      {
         throw new \Exception("Error loading XML file " . $errorText);
      }

      return $xml;
   }

   /**
    * Parses an XML entry (of type ConfigValue) and returns the final value
    * @param \SimpleXMLElement $value the element to parse
    * @param unknown_type $basePath base path input
    * @param unknown_type $configPath config path input
    */
   public static function parseConfigValue(\SimpleXMLElement $value, $basePath, $configPath)
   {
      $attributes = $value->attributes();
      $type = isset($attributes['type']) ? '' . $attributes['type'] : 'rawValue';
      $rawValue = '' . $value;
      $parsedValue = null;

      switch ($type)
      {
         case 'baseDir':
         {
            $parsedValue = $basePath . $rawValue;
            break;
         }
         case 'configDir':
         {
            $parsedValue = $configPath . $rawValue;
            break;
         }
         case 'rawValue':
         default:
         {
            $parsedValue = $rawValue;
            break;
         }
      }

      return $parsedValue;
   }
}

}
