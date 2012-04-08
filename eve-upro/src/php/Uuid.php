<?php

/**
 * An UUID helper class, based on http://www.php.net/manual/en/function.uniqid.php#94959
 */
final class Uuid
{
   /**
    * The empty UUID (all zeroes)
    */
   const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

   /**
    * Creates a ver3 UUID, using a hash based on MD5 of the given namespace and name string
    * @param string $namespace namespace UUID
    * @param string $name named data to base the UUID on
    * @return string the created UUID string
    */
   public static function v3($namespace, $name)
   {
      if (!self::isValid($namespace))
      {
         return false;
      }

      $nstr = Uuid::toBinary($namespace);
      $hash = md5($nstr . $name);

      return Uuid::fromHash($hash, 3);
   }

   /**
    * Creates a ver4 UUID, using a random number generator
    * @return string the created UUID string
    */
   public static function v4()
   {
      return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
         // 32 bits for "time_low"
         mt_rand(0, 0xffff), mt_rand(0, 0xffff),

         // 16 bits for "time_mid"
         mt_rand(0, 0xffff),

         // 16 bits for "time_hi_and_version",
         // four most significant bits holds version number 4
         mt_rand(0, 0x0fff) | 0x4000,

         // 16 bits, 8 bits for "clk_seq_hi_res",
         // 8 bits for "clk_seq_low",
         // two most significant bits holds zero and one for variant DCE1.1
         mt_rand(0, 0x3fff) | 0x8000,

         // 48 bits for "node"
         mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
      );
   }

   /**
    * Creates a ver5 UUID, using a hash based on SHA-1 of the given namespace and name string
    * @param string $namespace namespace UUID
    * @param string $name named data to base the UUID on
    * @return string the created UUID string
    */
   public static function v5($namespace, $name)
   {
      if (!self::isValid($namespace))
      {
         return false;
      }

      $nstr = Uuid::toBinary($namespace);
      $hash = sha1($nstr . $name);

      return Uuid::fromHash($hash, 5);
   }

   /**
    * Returns true if the given string is a UUID string
    * @param string $uuid the UUID text to parse
    * @return boolean true if UUID string is valid
    */
   public static function isValid($uuid)
   {
      return preg_match('/^\{?[0-9a-f]{8}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?'.
            '[0-9a-f]{4}\-?[0-9a-f]{12}\}?$/i', $uuid) === 1;
   }

   /**
    * Creates a binary presentation of given UUID
    * @param string $uuid to convert
    * @return string binary string of UUID
    */
   private static function toBinary($uuid)
   {
      $nhex = str_replace(array('-','{','}'), '', $uuid);
      $nstr = '';

      for ($i = 0; $i < strlen($nhex); $i += 2)
      {
         $nstr .= chr(hexdec($nhex[$i].$nhex[$i + 1]));
      }

      return $nstr;
   }

   /**
    * Creates an UUID string from a hash string
    * @param string $hash hash string
    * @param int $version version number to embedd
    */
   private static function fromHash($hash, $version)
   {
      return sprintf('%08s-%04s-%04x-%04x-%12s',
         // 32 bits for "time_low"
         substr($hash, 0, 8),

         // 16 bits for "time_mid"
         substr($hash, 8, 4),

         // 16 bits for "time_hi_and_version",
         // four most significant bits holds version number
         (hexdec(substr($hash, 12, 4)) & 0x0fff) | ($version << 12),

         // 16 bits, 8 bits for "clk_seq_hi_res",
         // 8 bits for "clk_seq_low",
         // two most significant bits holds zero and one for variant DCE1.1
         (hexdec(substr($hash, 16, 4)) & 0x3fff) | 0x8000,

         // 48 bits for "node"
         substr($hash, 20, 12)
      );
   }
}
