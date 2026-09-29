from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def auth_home():
    return {"msg": "Auth working"}