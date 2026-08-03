from datetime import date

from django.test import SimpleTestCase

from core.dates import ad_to_bs_str, bs_to_ad, fiscal_year_for_ad, fiscal_year_for_bs, pair_dates_from_ad


class FiscalDateTests(SimpleTestCase):
    def test_ad_bs_roundtrip_shrawan_start(self):
        # 2024-07-16 AD == 2081-04-01 BS (Shrawan 1)
        self.assertEqual(ad_to_bs_str(date(2024, 7, 16)), "2081-04-01")
        self.assertEqual(bs_to_ad("2081-04-01"), date(2024, 7, 16))

    def test_fiscal_year_starts_on_shrawan_1(self):
        self.assertEqual(fiscal_year_for_ad(date(2024, 7, 16)), "2081/82")
        self.assertEqual(fiscal_year_for_bs("2081-04-01"), "2081/82")

    def test_fiscal_year_ends_on_ashad_31(self):
        # 2024-07-15 AD == 2081-03-31 BS (Ashad 31) → still 2080/81
        self.assertEqual(fiscal_year_for_ad(date(2024, 7, 15)), "2080/81")
        self.assertEqual(fiscal_year_for_bs("2081-03-31"), "2080/81")

    def test_pair_dates_from_ad(self):
        ad, bs = pair_dates_from_ad(date(2024, 7, 16))
        self.assertEqual(ad, date(2024, 7, 16))
        self.assertEqual(bs, "2081-04-01")
