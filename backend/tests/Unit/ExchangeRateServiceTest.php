<?php

namespace Tests\Unit;

use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateServiceTest extends TestCase
{
    protected $exchangeRateService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->exchangeRateService = new ExchangeRateService();
        Cache::forget('lookups_exchange_rate_usd');
    }

    public function test_it_returns_middle_rate_from_bank_indonesia_when_successful()
    {
        $xmlResponse = '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getSubKursLokal1Response xmlns="http://tempuri.org/">
      <getSubKursLokal1Result>
        <diffgram>
          <NewDataSet>
            <Table>
              <mts_code>USD</mts_code>
              <kurs_jual>16600.00</kurs_jual>
              <kurs_beli>16400.00</kurs_beli>
            </Table>
          </NewDataSet>
        </diffgram>
      </getSubKursLokal1Result>
    </getSubKursLokal1Response>
  </soap:Body>
</soap:Envelope>';

        Http::fake([
            'https://www.bi.go.id/*' => Http::response($xmlResponse, 200, ['Content-Type' => 'text/xml']),
        ]);

        $rate = $this->exchangeRateService->getUsdToIdrRate();

        $this->assertEquals(16500.00, $rate);
    }

    public function test_it_falls_back_to_open_exchange_api_when_bi_fails()
    {
        Http::fake([
            'https://www.bi.go.id/*' => Http::response('Server Error', 500),
            'https://open.er-api.com/*' => Http::response([
                'rates' => [
                    'IDR' => 16300.00
                ]
            ], 200)
        ]);

        $rate = $this->exchangeRateService->getUsdToIdrRate();

        $this->assertEquals(16300.00, $rate);
    }

    public function test_it_returns_hardcoded_fallback_when_both_services_fail()
    {
        Http::fake([
            'https://www.bi.go.id/*' => Http::response('Server Error', 500),
            'https://open.er-api.com/*' => Http::response('API Error', 500)
        ]);

        $rate = $this->exchangeRateService->getUsdToIdrRate();

        $this->assertEquals(16500.00, $rate);
    }
}
