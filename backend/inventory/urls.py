from django.urls import path
from rest_framework.routers import DefaultRouter

from inventory.views import CategoryViewSet, ProductViewSet, StockAdjustView

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("stock/adjust/", StockAdjustView.as_view(), name="stock-adjust"),
    *router.urls,
]
