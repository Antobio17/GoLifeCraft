<?php

namespace Shared\Tool\Tool\Domain\Model;

final class TimezoneCode
{
    public const CASES = [
        'UTC' => 'UTC',
        'Europe/Madrid' => 'Europe/Madrid (CET/CEST)',
        'Europe/London' => 'Europe/London (GMT/BST)',
        'Europe/Paris' => 'Europe/Paris (CET/CEST)',
        'Europe/Berlin' => 'Europe/Berlin (CET/CEST)',
        'Europe/Rome' => 'Europe/Rome (CET/CEST)',
        'Europe/Amsterdam' => 'Europe/Amsterdam (CET/CEST)',
        'Europe/Brussels' => 'Europe/Brussels (CET/CEST)',
        'Europe/Lisbon' => 'Europe/Lisbon (WET/WEST)',
        'Europe/Warsaw' => 'Europe/Warsaw (CET/CEST)',
        'Europe/Bucharest' => 'Europe/Bucharest (EET/EEST)',
        'Europe/Athens' => 'Europe/Athens (EET/EEST)',
        'Europe/Helsinki' => 'Europe/Helsinki (EET/EEST)',
        'Europe/Moscow' => 'Europe/Moscow (MSK)',
        'America/New_York' => 'America/New York (EST/EDT)',
        'America/Chicago' => 'America/Chicago (CST/CDT)',
        'America/Denver' => 'America/Denver (MST/MDT)',
        'America/Los_Angeles' => 'America/Los Angeles (PST/PDT)',
        'America/Phoenix' => 'America/Phoenix (MST)',
        'America/Anchorage' => 'America/Anchorage (AKST/AKDT)',
        'America/Mexico_City' => 'America/Mexico City (CST/CDT)',
        'America/Bogota' => 'America/Bogota (COT)',
        'America/Lima' => 'America/Lima (PET)',
        'America/Santiago' => 'America/Santiago (CLT/CLST)',
        'America/Buenos_Aires' => 'America/Buenos Aires (ART)',
        'America/Sao_Paulo' => 'America/Sao Paulo (BRT/BRST)',
        'America/Caracas' => 'America/Caracas (VET)',
        'America/Toronto' => 'America/Toronto (EST/EDT)',
        'America/Vancouver' => 'America/Vancouver (PST/PDT)',
        'Africa/Cairo' => 'Africa/Cairo (EET)',
        'Africa/Johannesburg' => 'Africa/Johannesburg (SAST)',
        'Africa/Lagos' => 'Africa/Lagos (WAT)',
        'Asia/Dubai' => 'Asia/Dubai (GST)',
        'Asia/Karachi' => 'Asia/Karachi (PKT)',
        'Asia/Kolkata' => 'Asia/Kolkata (IST)',
        'Asia/Dhaka' => 'Asia/Dhaka (BST)',
        'Asia/Bangkok' => 'Asia/Bangkok (ICT)',
        'Asia/Shanghai' => 'Asia/Shanghai (CST)',
        'Asia/Tokyo' => 'Asia/Tokyo (JST)',
        'Asia/Seoul' => 'Asia/Seoul (KST)',
        'Asia/Singapore' => 'Asia/Singapore (SGT)',
        'Australia/Sydney' => 'Australia/Sydney (AEST/AEDT)',
        'Pacific/Auckland' => 'Pacific/Auckland (NZST/NZDT)',
    ];

    public static function isValid(string $timezoneCode): bool
    {
        return array_key_exists($timezoneCode, self::CASES);
    }

    public static function keys(): array
    {
        return array_keys(self::CASES);
    }
}
