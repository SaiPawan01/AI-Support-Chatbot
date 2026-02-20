from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.exceptions import TokenError

from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, LoginSerializer



# Create your views here.
class RegisterView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data,context={'request':request})

        # Validation is handled by the serializer, but we can catch the exception to return a custom response
        if not serializer.is_valid():
            return Response({
                "success" : False,
                "message" : "Data Validation failed",
                "errors" : serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST)

        try:
            serializer.save()
            # success response with user details (excluding password)
            return Response(
                {
                    "success": True,
                    "message": "Signup successful",
                    "user": {
                        "name": f"{serializer.data.get('first_name')} {serializer.data.get('last_name')}",
                        "email": serializer.data.get('email'),
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError:
            # failure due to unique constraint violation (email already exists)
            return Response({
                "success": False,
                "message": "Email already exists",
                "errors": {
                    "email": ["A user with this email already exists."]
                },
            },
                status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # failure due to any other unexpected errors
            return Response({
                "success": False,
                "message": "An error occurred during registration",
                "errors": str(e),
            },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        # validate and raise exceptions handled by DRF
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data.get('email'),
            password=serializer.validated_data.get('password')
        )

        if user is None:
            return Response(
                {"success":False,
                 "message": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "success": True,
                "message": "Login successful",
                "access_token": str(refresh.access_token),
            },
            status=status.HTTP_200_OK,
        )

        # Set refresh token in HTTP-only cookie
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,     
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,
        )

        return response

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "success": True,
                "message": "Token is valid. Access granted to protected resource.",
            },
            status=status.HTTP_200_OK,
        )

class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token not provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)

            return Response(
                {
                    "success": True,
                    "message": "Access token refreshed successfully",
                    "access_token": new_access_token,
                },
                status=status.HTTP_200_OK,
            )
        except TokenError:
            return Response(
                {"success": False, "message": "Invalid refresh token", "error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED,
            )

class LogoutView(APIView):
    def post(self, request):
        response = Response(
            {
                "success": True,
                "message": "Logged out successfully"
            },
            status=status.HTTP_200_OK,
        )

        response.delete_cookie("refresh_token", path="/")
        return response

