from datetime import date

import nepali_datetime as nd

# BS calendar: month 4 = Shrawan (FY start), month 3 = Ashad (FY end)


def ad_to_bs_str(ad: date) -> str:
    bs = nd.date.from_datetime_date(ad)
    return f"{bs.year:04d}-{bs.month:02d}-{bs.day:02d}"


def bs_to_ad(bs_str: str) -> date:
    year, month, day = (int(p) for p in bs_str.split("-"))
    return nd.date(year, month, day).to_datetime_date()


def fiscal_year_label(bs_year: int, bs_month: int) -> str:
    """Nepal FY runs Shrawan 1 – Ashad 31. Label like 2081/82."""
    start_year = bs_year if bs_month >= 4 else bs_year - 1
    end_yy = str(start_year + 1)[-2:]
    return f"{start_year}/{end_yy}"


def fiscal_year_for_bs(bs_str: str) -> str:
    year, month, _day = (int(p) for p in bs_str.split("-"))
    return fiscal_year_label(year, month)


def fiscal_year_for_ad(ad: date) -> str:
    return fiscal_year_for_bs(ad_to_bs_str(ad))


def pair_dates_from_ad(ad: date) -> tuple[date, str]:
    return ad, ad_to_bs_str(ad)
