<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    /**
     * Get USD to IDR exchange rate.
     *
     * @return float
     */
    public function getUsdToIdrRate(): float
    {
        return Cache::remember('lookups_exchange_rate_usd', 3600, function () {
            // 1. Try to fetch from Bank Indonesia SOAP service
            $biRate = $this->fetchFromBankIndonesia();
            if ($biRate !== null && $biRate > 0) {
                return $biRate;
            }

            // 2. Fallback to Open Exchange Rate API
            $fallbackRate = $this->fetchFromFallbackApi();
            if ($fallbackRate !== null && $fallbackRate > 0) {
                return $fallbackRate;
            }

            // 3. Last resort hardcoded fallback (e.g. 16500.00)
            Log::warning('ExchangeRateService: Both BI and Fallback API failed. Using default rate.');
            return 16500.00;
        });
    }

    /**
     * Fetch USD rate from Bank Indonesia.
     *
     * @return float|null
     */
    private function fetchFromBankIndonesia(): ?float
    {
        try {
            $xmlPayload = '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getSubKursLokal1 xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>';

            $response = Http::withHeaders([
                'Content-Type' => 'text/xml; charset=utf-8',
                'SOAPAction' => '"http://tempuri.org/getSubKursLokal1"',
            ])
            ->withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            ->timeout(5)
            ->post('https://www.bi.go.id/biwebservice/wskursbi.asmx', $xmlPayload);

            if ($response->failed()) {
                Log::warning('ExchangeRateService: BI Web Service returned status ' . $response->status());
                return null;
            }

            $body = $response->body();
            // Check if we got a block page or invalid XML
            if (stripos($body, '<!DOCTYPE HTML') !== false || stripos($body, '<html') !== false) {
                Log::warning('ExchangeRateService: BI Web Service returned HTML instead of XML (likely blocked by WAF/Firewall).');
                return null;
            }

            // Parse XML response
            // Remove XML namespace prefixes from tags and strip all xmlns declarations to make parsing easy
            $cleanXml = preg_replace('/(<\/|<)[a-zA-Z0-9_-]+:/', '$1', $body);
            $cleanXml = preg_replace('/\s*xmlns[^=]*="[^"]*"/i', '', $cleanXml);
            $cleanXml = preg_replace('/\s*xmlns[^=]*=\'[^\']*\'/i', '', $cleanXml);
            $xmlElement = simplexml_load_string($cleanXml);
            if (!$xmlElement) {
                Log::warning('ExchangeRateService: Failed to parse XML response from BI Web Service.');
                return null;
            }

            // The XML path: Envelope -> Body -> getSubKursLokal1Response -> getSubKursLokal1Result -> diffgram -> NewDataSet -> Table
            // Let\'s use XPath or loop to find Table where mts_code = \'USD\'
            $tables = $xmlElement->xpath('//Table');
            foreach ($tables as $table) {
                $code = (string) $table->mts_code;
                if (strtoupper($code) === 'USD') {
                    $jual = (float) $table->kurs_jual;
                    $beli = (float) $table->kurs_beli;
                    if ($jual > 0 && $beli > 0) {
                        // Use middle rate (kurs tengah)
                        return ($jual + $beli) / 2;
                    }
                }
            }

            Log::warning('ExchangeRateService: USD currency not found in BI Web Service response.');
            return null;
        } catch (\Exception $e) {
            Log::error('ExchangeRateService: Error fetching from BI Web Service: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch USD rate from fallback open exchange rate API.
     *
     * @return float|null
     */
    private function fetchFromFallbackApi(): ?float
    {
        try {
            $response = Http::withUserAgent('Mozilla/5.0')
                ->timeout(5)
                ->get('https://open.er-api.com/v6/latest/USD');

            if ($response->failed()) {
                Log::warning('ExchangeRateService: Fallback API returned status ' . $response->status());
                return null;
            }

            $rate = $response->json('rates.IDR');
            if ($rate > 0) {
                return (float) $rate;
            }

            Log::warning('ExchangeRateService: USD to IDR rate not found in Fallback API response.');
            return null;
        } catch (\Exception $e) {
            Log::error('ExchangeRateService: Error fetching from Fallback API: ' . $e->getMessage());
            return null;
        }
    }
}
