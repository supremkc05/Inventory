from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Default page size 20; clients may request up to 100 (E37 / DoS guard)."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
