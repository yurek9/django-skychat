from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Define your chat app URL patterns here
    path("", views.chat_view, name="chat_room"),
    path("send/", views.send_message, name="send_message"),
    path("clear/", views.clear_chat, name="clear_chat"),
    path("messages/", views.get_messages, name="get_messages"),
    path("typing/", views.user_typing, name="user_typing"),
    path("check-typing/", views.check_typing, name="check_typing"),
    path("ping-online/", views.ping_online, name="ping_online"),
    path("online-count/", views.users_online_count, name="online_count"),
    path("statuses/", views.get_statuses, name="statuses"),
    path("online/", views.online_view, name="online"),
    path("get-online-users/", views.get_online_users, name="get_online_users"),
]
