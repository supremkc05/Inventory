from rest_framework.routers import DefaultRouter

from parties.views import CustomerViewSet

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")

urlpatterns = router.urls
