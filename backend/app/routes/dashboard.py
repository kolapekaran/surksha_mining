from fastapi import APIRouter
from app.services.dashboard_service import get_dashboard_stats

router = APIRouter()   # ✅ THIS LINE MUST BE THERE

@router.get("/")
def dashboard():
    return get_dashboard_stats()