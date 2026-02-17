from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    country: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OAuthRequest(BaseModel):
    id_token: str


class AuthResponse(BaseModel):
    uid: str
    email: str
    full_name: str
    token: str
    is_new_user: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str
