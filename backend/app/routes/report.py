from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def report_home():
    return {"message": "Report API working"}