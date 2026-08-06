from rest_framework.routers import DefaultRouter

from sales.views import CreditNoteViewSet, SaleViewSet

router = DefaultRouter()
router.register("sales", SaleViewSet, basename="sale")
router.register("credit-notes", CreditNoteViewSet, basename="credit-note")

urlpatterns = router.urls
