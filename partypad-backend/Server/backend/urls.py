from django.urls import path

from backend.views import *

app_name = "backend"

urlpatterns = [
    path('Add_New_User', Add_New_User.as_view()),
    path('Submit_Login', Submit_Login.as_view()),
    path('Recover_Password', Recover_Password.as_view()),
    path('Verify_Email', Verify_Email.as_view()),
    path('Update_Password', Update_Password.as_view()),
    path('Fetch_Venue_Types', Fetch_Venue_Types.as_view()),
    path('Check_Venue_Name', Check_Venue_Name.as_view()),
    path('Add_Venue', Add_Venue.as_view()),
    path('Remove_Venue', Remove_Venue.as_view()),
    path('Search_Venue', Search_Venue.as_view()),
    path('Fetch_Single_Venue', Fetch_Single_Venue.as_view()),
    path('Update_Venue', Update_Venue.as_view()),
    path('Fetch_Owner_Venues', Fetch_Owner_Venues.as_view()),
    path('Fetch_Upcoming_Bookings_Owner', Fetch_Upcoming_Bookings_Owner.as_view()),
    path('Fetch_Upcoming_Bookings_Member', Fetch_Upcoming_Bookings_Member.as_view()),
    path('Fetch_Profile',Fetch_Profile.as_view()),
    path('Add_Profile', Add_Profile.as_view()),
    path('Book_Dates', Book_Dates.as_view()),
    path('Cancel_Booking', Cancel_Booking.as_view()),
    path('Fetch_Dates', Fetch_Dates.as_view()),
    path('Send_Message', Send_Message.as_view()),
    path('Retrieve_Sender_List', Retrieve_Sender_List.as_view()),
    path('Retrieve_Chat', Retrieve_Chat.as_view()),
    path('Retrieve_Inbox_Count', Retrieve_Inbox_Count.as_view()),
    path('Add_Venue_Bookmark', Add_Venue_Bookmark.as_view()),
    path('Remove_Venue_Bookmark', Remove_Venue_Bookmark.as_view()),
    path('Fetch_Bookmarked_Venues', Fetch_Bookmarked_Venues.as_view()),
    path('Check_Bookmark_Exists', Check_Bookmark_Exists.as_view()),
    path('Dashboard_Member', Dashboard_Member.as_view()),
    path('Dashboard_Owner', Dashboard_Owner.as_view()),
    path('Image_Test', Image_Test.as_view()),
]