<?php
require_once 'util/ConfigProvider.php';

class ConfigProviderTest extends PHPUnit_Framework_TestCase
{
   private function verifyParseConfigValue($value, $type, $basePath, $configPath, $expected)
   {
      $element = new \SimpleXMLElement('<value>' . $value . '</value>');

      if (!is_null($type))
      {
         $element->addAttribute('type', $type);
      }

      $result = \upro\util\ConfigProvider::parseConfigValue($element, $basePath, $configPath);

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();

   }

   public function testParseConfigValueShouldReturnRawValue_WhenNoTypeGiven()
   {
      $this->verifyParseConfigValue('test', null, 'basePath/', 'configPath/', 'test');
   }

   public function testParseConfigValueShouldReturnRawValue_WhenUnknownTypeGiven()
   {
      $this->verifyParseConfigValue('test', 'unknownType', 'basePath/', 'configPath/', 'test');
   }

   public function testParseConfigValueShouldReturnRawValue_WhenTypeIsRawValue()
   {
      $this->verifyParseConfigValue('test', 'rawValue', 'basePath/', 'configPath/', 'test');
   }

   public function testParseConfigValueShouldReturnBasePathValue_WhenTypeIsBaseDir()
   {
      $this->verifyParseConfigValue('test', 'baseDir', 'basePath/', 'configPath/', 'basePath/test');
   }

   public function testParseConfigValueShouldReturnConfigPathValue_WhenTypeIsConfigDir()
   {
      $this->verifyParseConfigValue('test', 'configDir', 'basePath/', 'configPath/', 'configPath/test');
   }
}