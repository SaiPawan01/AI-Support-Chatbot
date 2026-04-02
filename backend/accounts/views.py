import email
import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, LoginSerializer
import random
from .utils.otp_email_service import send_otp
from .utils.redis_cache import store_otp, verify_otp
from .models import User


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

        try:
             serializer.is_valid(raise_exception=True)
             user = serializer.validated_data["user"]
        except Exception as e:
            return Response(
                {"success": False, "message": "Invalid email or password", "error": str(e)},
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



class EmailVerificationView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            print(email, type(email))

            if not email:
                return Response(
                    {"success": False, "message": "Email is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_exists = User.objects.filter(email=email).exists()

            if user_exists:
                return Response({"success": False, "message": "Email already registered"})


            otp = random.randint(100000, 999999)

            success, error = send_otp(email, otp)

            if success:
                store_otp(email, otp)
                return Response(
                    {
                        "success": True,
                        "message": f"OTP sent to {email}"
                    },
                    status=status.HTTP_200_OK
                )

            return Response(
                {
                    "success": False,
                    "message": "Failed to send OTP",
                    "error": error
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Internal server error",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class OTPVerificationView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            otp = request.data.get('otp')

            print("email is :" , email, type(email))
            print("otp is :" , otp, type(otp))

            if not email or not otp:
                return Response(
                    {"success": False, "message": "Email and OTP are required"},
                    status=status.HTTP_409_CONFLICT
                )

            is_valid, error_message = verify_otp(email, otp)

            if not is_valid:
                return Response(
                    {"success": False, "message": error_message},
                    status=status.HTTP_400_BAD_REQUEST
                )

            
            return Response(
                {"success": True, "message": "OTP verified successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Internal server error",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetPasswordVerificationView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            otp = request.data.get('otp')

            print("email is :" , email, type(email))
            print("otp is :" , otp, type(otp))

            if not email or not otp:
                return Response(
                    {"success": False, "message": "Email and OTP are required"},
                    status=status.HTTP_409_CONFLICT
                )

            is_valid, error_message = verify_otp(email, otp)

            if not is_valid:
                return Response(
                    {"success": False, "message": error_message},
                )

            
            return Response(
                {"success": True, "message": "OTP verified successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Otp verification failed",
                    "error": str(e)
                }
            )



class ResetOTPView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')

            if not email:
                return Response(
                    {"success": False, "message": "Email is required"},
                )

            user_exists = User.objects.filter(email=email).exists()

            if not user_exists:
                return Response({"success": False, "message": "Email not registered"})

            otp = random.randint(100000, 999999)

            success, error = send_otp(email, otp)

            if success:
                store_otp(email, otp)
                return Response(
                    {
                        "success": True,
                        "message": f"OTP sent to {email}"
                    },
                    status=status.HTTP_200_OK
                )

            return Response(
                {
                    "success": False,
                    "message": "Failed to send OTP",
                    "error": error
                }
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "otp generation failed",
                    "error": str(e)
                }
            )
        

class ResetPasswordView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            new_password = request.data.get('new_password')

            if not email or not new_password:
                return Response(
                    {"success": False, "message": "Email and new password are required"},
                )

            user = User.objects.filter(email=email).first()

            if not user:
                return Response({"success": False, "message": "Email not registered"})

            user.set_password(new_password)
            user.save()

            return Response(
                {"success": True, "message": "Password reset successful"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Password reset failed",
                    "error": str(e)
                }
            )