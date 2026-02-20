from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import DatabaseError
from django.core.exceptions import ObjectDoesNotExist

from .models import Conversation, Message
from .serializers import ConversationSerializer
from .utils.chatbot_logic import get_relevant_chunks, get_bot_reply

# Create your views here.
class CreateConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = ConversationSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {
                        "success": False,
                        "message": "Invalid input data.",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer.save(user=request.user)

            return Response(
                {
                    "success": True,
                    "message": "Conversation created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except DatabaseError:
            return Response(
                {
                    "success": False,
                    "message": "Database error occurred while creating conversation.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Something went wrong.",
                    "error": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            if not pk:
                return Response(
                    {
                        "success": False,
                        "message": "Conversation ID is required."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure user can only delete their own conversation
            conversation = Conversation.objects.get(
                pk=pk,
                user=request.user
            )

            conversation.delete()

            return Response(
                {
                    "success": True,
                    "message": "Conversation deleted successfully."
                },
                status=status.HTTP_204_NO_CONTENT
            )

        except ObjectDoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Conversation not found or you do not have permission."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except DatabaseError:
            return Response(
                {
                    "success": False,
                    "message": "Database error occurred while deleting conversation."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "Something went wrong.",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class CreateMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        context = get_relevant_chunks("what is complaint management system ?")
        res = get_bot_reply(request.data.get('content'),context)
        return Response({
            "success": True,
            'result': res,
        })







