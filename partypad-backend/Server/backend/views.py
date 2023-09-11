from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework import status
import sqlalchemy, sqlalchemy.orm
from sqlalchemy import *
from partypad.settings import FILE_DIR, SQLALCHEMY_HOST, FILE_URL
from database.models import *
from rest_framework.views import APIView
from django.core.mail import send_mail
import random
import datetime
import json, string
from PIL import Image
import shutil

def generate_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=10))

def convert_image(file, ext, path):
    old_file = file+"."+ext
    if ext.lower() == "png":
        with Image.open(path+old_file) as im:
            rgb_im = im.convert('RGB')
            new_file = file+".jpg"
            rgb_im.save(path+new_file,"JPEG")
            os.remove(path+old_file)
            output = new_file
    else:
        output = old_file

    return output

def process_image(input, sub_folder):
    sub_path_dict = {"images": []}
    img_status = "OK"
    print("here3")

    for image in input:
        print(image.name)
        filename_rev = "".join(reversed(image.name))
        filename = "".join(reversed(filename_rev.split(".",1)[1]))
        filename_ext = "".join(reversed(filename_rev.split(".",1)[0]))

        if filename_ext.lower() not in ['jpeg','jpg','png']:
            img_status = "FAIL"
            break
        else:
            new_filename = filename.replace(" ","_").replace("""(""","_").replace(""")""","_").replace(".","-")

            with open(FILE_DIR + sub_folder + new_filename + "." + filename_ext, 'wb+') as destination:
                destination.write(image.read())

            final_filename = convert_image(new_filename, filename_ext, FILE_DIR + sub_folder)

            sub_path_dict["images"].append(sub_folder + final_filename)

    return sub_path_dict, img_status

# Add details of a new user to the database
class Add_New_User(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            first_name = request.data["firstName"]
            last_name = request.data["lastName"]
            login_type = request.data["loginType"]
            role = request.data["role"]
            password = ""

            if not login_type == "OAuth":
                password = request.data["password"]

            member_flag = False
            owner_flag = False

            if role == "Member":
                member_flag = True

            if role == "Owner":
                owner_flag = True

            #database query to fetch users with the same email
            check_existing_email = session.query(User).filter(
                User.user_email == email
            ).all()

            #username already exists, return not acceptable status
            if check_existing_email:
                response_dict = {
                    "status": "FAIL",
                    "message": "User already exists!"
                }
                response = JsonResponse(response_dict, safe=False)
                print("\n****start****\nUser Already Exists!\nUser Name: "+email+"\nLogin Type: "+check_existing_email[0].user_login_type+"\n****end****")

            #database query to insert user info
            else:
                user_object = User(
                    user_email = email,
                    user_password = password,
                    user_login_type = login_type,
                    user_fname = first_name,
                    user_lname = last_name,
                    user_member_flag = member_flag,
                    user_owner_flag = owner_flag,
                    user_creation_date = datetime.datetime.now(),
                )
                session.add(user_object)
                session.commit()
                response_dict = {
                    "status": "OK",
                    "message": "Successfully added user"
                }
                response = JsonResponse(response_dict, safe=False)

                print("\n****start****\nAdded User!\nUser Email: "+email+"\nName: "+first_name+" "+last_name+"\nLogin Type: "+login_type+"\n****end****")

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

#Verify login credentials
class Submit_Login(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            login_type = request.data["loginType"]
            role = request.data["role"]

            print("\n****start****\nINPUT:\n"+email+"\n"+login_type+"\n****end****")

            if not login_type == "OAuth":
                password = request.data["password"]

                #database query to fetch users with the same username
                check_credentials = session.query(User).filter(
                    and_(
                        User.user_email == email,
                        User.user_password == password,
                        User.user_login_type == login_type,
                    )
                ).all()
            else:
                #database query to fetch users with the same username
                check_credentials = session.query(User).filter(
                    and_(
                        User.user_email == email,
                        User.user_login_type == login_type,
                    )
                ).all()

            #Check if username and password exist in the DB
            if check_credentials:
                if (role == "Member" and check_credentials[0].user_member_flag) or (role == "Owner" and check_credentials[0].user_owner_flag):
                    response_dict = {
                        "status": "OK",
                        "message": "User Verified"
                    }
                    response = JsonResponse(response_dict, safe=False)

                else:
                    response_dict = {
                        "status": "FAIL",
                        "message": "User Role Invalid"
                    }
                    response = JsonResponse(response_dict, safe=False)
            else:
                response_dict = {
                    "status": "FAIL",
                    "message": "Email or Password is incorrect!"
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

#Password Recovery
class Recover_Password(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]

            #database query to fetch users with the same email
            check_existing_email = session.query(User).filter(
                User.user_email == email,
            ).all()

            if check_existing_email and check_existing_email[0].user_login_type == "WebPage":

                verified_email_address = check_existing_email[0].user_email

                code = str(random.randint(100000,999999))
                user_id = check_existing_email[0].user_id

                check_temp_key_entry = session.query(Temporary_Key).filter(
                    Temporary_Key.user_id == user_id,
                ).all()

                if check_temp_key_entry:
                    check_temp_key_entry[0].temp_key_value = code
                    check_temp_key_entry[0].temp_key_timestamp = datetime.datetime.now()
                    session.commit()
                else:
                    temp_key_object = Temporary_Key(
                        user_id = user_id,
                        temp_key_value = code,
                        temp_key_timestamp = datetime.datetime.now(),
                    )
                    session.add(temp_key_object)
                    session.commit()

                send_mail(
                    'Password Recovery',
                    'Enter this code to verify account: '+code,
                    'rfurtado@iu.edu',
                    [email]
                )

                response_dict = {
                    "status": "OK",
                    "message": "Email Verified"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                response_dict = {
                    "status": "FAIL",
                    "message": "Email Invalid"
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Verify_Email(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            code = request.data["code"]

            #database query to fetch users with the same email
            verify_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            if verify_user == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "User Does Not Exist"
                }
                response = JsonResponse(response_dict, safe=False)
            elif verify_user.user_login_type == "OAuth":
                response_dict = {
                    "status": "FAIL",
                    "message": "Invalid Email"
                }
                response = JsonResponse(response_dict, safe=False)
            else:

                verify_code = session.query(Temporary_Key).filter(
                    Temporary_Key.user_id == verify_user.user_id,
                ).first()

                if (verify_code.temp_key_value == code):
                    generation_time = verify_code.temp_key_timestamp
                    time_difference = datetime.datetime.now() - generation_time.replace(tzinfo=None)
                    print("Time Elapsed: "+str(time_difference.seconds))
                    if (time_difference.seconds <= (60*5)):
                        response_dict = {
                            "status": "OK",
                            "message": "Code Valid"
                        }
                        response = JsonResponse(response_dict, safe=False)
                    else:
                        response_dict = {
                            "status": "EXPIRED",
                            "message": "Code Expired"
                        }
                        response = JsonResponse(response_dict, safe=False)
                else:
                    response_dict = {
                        "status": "FAIL",
                        "message": "Code Invalid"
                    }
                    response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Update_Password(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            password = request.data["password"]

            #database query to fetch users with the same email
            verify_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            if verify_user == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "User Does Not Exist"
                }
                response = JsonResponse(response_dict, safe=False)
            elif verify_user.user_login_type == "OAuth":
                response_dict = {
                    "status": "FAIL",
                    "message": "Invalid Email"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                verify_user.user_password = password
                session.commit()

                response_dict = {
                    "status": "OK",
                    "message": "Password Updated"
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Venue_Types(APIView):
    def get(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            venue_types = session.query(Venue_Type).all()

            types_list = []
            for v_type in venue_types:
                types_list.append(v_type.venue_type_name)

            response_dict = {
                "status": "OK",
                "message": "List of venue types",
                "data": types_list
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Check_Venue_Name(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]
            venue_name = request.data["venueName"]

            #database query to fetch users with the same email
            fetch_venue = session.query(Venue).join(User).filter(
                and_(
                    User.user_email == email,
                    Venue.venue_name == venue_name,
                )
            ).first()

            if fetch_venue == None:
                response_dict = {
                    "status": "OK",
                    "message": "Venue can be added"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                response_dict = {
                    "status": "FAIL",
                    "message": "Venue already exists"
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Add_Venue(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            venue_name = request.data["venueName"]
            venue_desc = request.data["venueDesc"]
            venue_size = float(request.data["venueSize"])
            venue_type = request.data["venueType"]
            venue_people_count = int(request.data["venuePeopleCount"])
            venue_price = float(request.data["venuePrice"])

            venue_addr_line1 = request.data["venueAddrLine1"]
            venue_addr_line2 = request.data["venueAddrLine2"]
            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]
            venue_addr_zip = request.data["venueAddrZip"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            if fetch_user == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "User Does Not Exist"
                }
                response = JsonResponse(response_dict, safe=False)
            else:

                fetch_venue = session.query(Venue).filter(
                    and_(
                        Venue.user_id == fetch_user.user_id,
                        Venue.venue_name == venue_name,
                    )
                ).first()

                #image storage
                user_dir = email + "/"
                venue_dir = user_dir + "venue" + "/"
                venue_name_dir = venue_dir + venue_name.replace(" ","_").replace("\\","_") + "/"

                if fetch_venue == None:
                    if not (os.path.exists(FILE_DIR + user_dir)):
                        os.mkdir(FILE_DIR + user_dir)
                    if not (os.path.exists(FILE_DIR + venue_dir)):
                        os.mkdir(FILE_DIR + venue_dir)
                    if not (os.path.exists(FILE_DIR + venue_name_dir)):
                        os.mkdir(FILE_DIR + venue_name_dir)

                    sub_path_dict, img_status = process_image(request.FILES.getlist('venueImages'), venue_name_dir)

                    if img_status == "FAIL":
                        response_dict = {
                            "status": "FAIL",
                            "message": "File format not supported! (Use .jpg or .png only)"
                        }
                        response = JsonResponse(response_dict, safe=False)
                    else:
                        if len(sub_path_dict["images"]) == 0:
                            sub_path_dict = None

                        venue_object = Venue(
                            user_id = fetch_user.user_id,
                            venue_name = venue_name,
                            venue_description = venue_desc,
                            venue_creation_date = datetime.datetime.now(),
                            venue_modified_date = datetime.datetime.now(),
                            venue_size = venue_size,
                            venue_type = venue_type,
                            venue_people_count = venue_people_count,
                            venue_price = venue_price,
                            venue_image = sub_path_dict,
                        )
                        session.add(venue_object)

                        session.commit()

                        fetch_venue = session.query(Venue).filter(
                            and_(
                                Venue.user_id == fetch_user.user_id,
                                Venue.venue_name == venue_name
                            )
                        ).first()

                        venue_addr_object = Venue_Address(
                            venue_id = fetch_venue.venue_id,
                            venue_addr_line1 = venue_addr_line1,
                            venue_addr_line2 = venue_addr_line2,
                            venue_addr_city = venue_addr_city,
                            venue_addr_state = venue_addr_state,
                            venue_addr_zip = venue_addr_zip
                        )
                        session.add(venue_addr_object)

                        session.commit()

                        response_dict = {
                            "status": "OK",
                            "message": "Venue Added"
                        }
                        response = JsonResponse(response_dict, safe=False)
                else:
                    response_dict = {
                        "status": "FAIL",
                        "message": "Venue already exists"
                    }
                    response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Remove_Venue(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            venue_id = request.data["venueId"]

            fetch_user = session.query(User).filter(
                User.user_email == email
            ).first()

            if fetch_user == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "User Does Not Exist!"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                fetch_venue = session.query(Venue).filter(
                    and_(
                        Venue.venue_id == venue_id,
                        Venue.user_id == fetch_user.user_id
                    )
                ).first()

                if fetch_venue == None:
                    response_dict = {
                        "status": "FAIL",
                        "message": "Venue Under This User Does Not Exist!"
                    }
                    response = JsonResponse(response_dict, safe=False)
                else:
                    session.delete(fetch_venue)
                    session.commit()

                    response_dict = {
                        "status": "OK",
                        "message": "Venue Deleted!"
                    }
                    response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Update_Venue(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            venue_id = request.data["venueId"]
            venue_name = request.data["venueName"]
            venue_desc = request.data["venueDesc"]
            venue_size = float(request.data["venueSize"])
            venue_type = request.data["venueType"]
            venue_people_count = int(request.data["venuePeopleCount"])
            venue_price = float(request.data["venuePrice"])

            venue_addr_line1 = request.data["venueAddrLine1"]
            venue_addr_line2 = request.data["venueAddrLine2"]
            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]
            venue_addr_zip = request.data["venueAddrZip"]

            fetch_venue = session.query(Venue).join(User).filter(
                and_(
                    User.user_email == email,
                    Venue.venue_id == venue_id,
                )
            ).first()

            fetch_venue_addr = session.query(Venue_Address).filter(
                Venue_Address.venue_id == venue_id
            ).first()

            #image storage
            user_dir = email + "/"
            venue_dir = user_dir + "venue" + "/"

            if not fetch_venue.venue_name == venue_name:
                if (os.path.exists(FILE_DIR + venue_dir + fetch_venue.venue_name.replace(" ","_").replace("\\","_"))):
                    shutil.rmtree(FILE_DIR + venue_dir + fetch_venue.venue_name.replace(" ","_").replace("\\","_"))

                venue_name_dir = venue_dir + venue_name.replace(" ","_").replace("\\","_") + "/"

                if not (os.path.exists(FILE_DIR + user_dir)):
                    os.mkdir(FILE_DIR + user_dir)
                if not (os.path.exists(FILE_DIR + venue_dir)):
                    os.mkdir(FILE_DIR + venue_dir)
                if not (os.path.exists(FILE_DIR + venue_name_dir)):
                    os.mkdir(FILE_DIR + venue_name_dir)
            else:
                venue_name_dir = venue_dir + venue_name.replace(" ","_").replace("\\","_") + "/"

            sub_path_dict, img_status = process_image(request.FILES.getlist('venueImages'), venue_name_dir)

            if img_status == "FAIL":
                response_dict = {
                    "status": "FAIL",
                    "message": "File format not supported! (Use .jpg or .png only)"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                if len(sub_path_dict["images"]) == 0:
                    sub_path_dict = None

                fetch_venue.venue_name = venue_name
                fetch_venue.venue_description = venue_desc
                fetch_venue.venue_modified_date = datetime.datetime.now()
                fetch_venue.venue_size = venue_size
                fetch_venue.venue_type = venue_type
                fetch_venue.venue_people_count = venue_people_count
                fetch_venue.venue_price = venue_price
                fetch_venue.venue_image = sub_path_dict

                fetch_venue_addr.venue_addr_line1 = venue_addr_line1
                fetch_venue_addr.venue_addr_line2 = venue_addr_line2
                fetch_venue_addr.venue_addr_city = venue_addr_city
                fetch_venue_addr.venue_addr_state = venue_addr_state
                fetch_venue_addr.venue_addr_zip = venue_addr_zip

                session.commit()

                venue_result_str = json.dumps(fetch_venue, cls=AlchemyEncoder)
                venue_result = json.loads(venue_result_str)

                img_urls = []

                img_dict = venue_result['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                venue_result['venue_image'] = img_urls

                venue_addr_result_str = json.dumps(fetch_venue_addr, cls=AlchemyEncoder)
                venue_addr_result = json.loads(venue_addr_result_str)

                response_dict = {
                    "status": "OK",
                    "message": "Venue Updated",
                    "data": {"Venue": venue_result, "Venue_Address": venue_addr_result}
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()


        return response

class Search_Venue(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            search_value = request.data["searchValue"]

            venue_size_low = 0.00
            if not request.data["sizeRangeStart"] == "":
                venue_size_low = float(request.data["sizeRangeStart"])

            venue_size_high = 9999999.00
            if not request.data["sizeRangeEnd"] == "":
                venue_size_high = float(request.data["sizeRangeEnd"])

            venue_type = request.data["venueType"]

            venue_p_count_low = 0
            venue_p_count_high = 99999
            if not request.data["peopleCount"] == "":
                venue_p_count_low = int(request.data["peopleCount"])
                venue_p_count_high = int(request.data["peopleCount"])

            venue_price_low = 0.00
            if not request.data["priceRangeStart"] == "":
                venue_price_low = float(request.data["priceRangeStart"])

            venue_price_high = 99999999.00
            if not request.data["priceRangeEnd"] == "":
                venue_price_high = float(request.data["priceRangeEnd"])

            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]

            page_start = (int(request.data["page"]) - 1) * 10
            page_end = page_start + 10

            fetch_venue = session.query(Venue, Venue_Address).join(Venue_Address, Venue.venue_id == Venue_Address.venue_id).filter(
                and_(
                    Venue.venue_name.ilike("%"+search_value+"%"),
                    Venue.venue_size >= venue_size_low, 
                    Venue.venue_size <= venue_size_high,
                    Venue.venue_type.ilike("%"+venue_type+"%"),
                    Venue.venue_people_count >= venue_p_count_low,
                    Venue.venue_people_count <= venue_p_count_high,
                    Venue.venue_price >= venue_price_low, 
                    Venue.venue_price <= venue_price_high,
                    Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                    Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                )
            )[page_start:page_end]

            total_venue_fetch = session.query(func.count(Venue.venue_id)).join(Venue_Address).filter(
                and_(
                    Venue.venue_name.ilike("%"+search_value+"%"),
                    Venue.venue_size >= venue_size_low, 
                    Venue.venue_size <= venue_size_high,
                    Venue.venue_type.ilike("%"+venue_type+"%"),
                    Venue.venue_people_count >= venue_p_count_low,
                    Venue.venue_people_count <= venue_p_count_high,
                    Venue.venue_price >= venue_price_low, 
                    Venue.venue_price <= venue_price_high,
                    Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                    Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                )
            ).first()
            total_venue_count = total_venue_fetch[0]

            search_result_str = json.dumps([dict(r) for r in fetch_venue], cls=AlchemyEncoder)
            search_result = json.loads(search_result_str)

            for each_result in search_result:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Venues Retrieved",
                "data": {"totalCount": total_venue_count, "searchResult": search_result}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Single_Venue(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            venue_id = request.data["venueId"]

            fetch_venue = session.query(Venue, Venue_Address).join(Venue_Address, Venue.venue_id == Venue_Address.venue_id).filter(
                Venue.venue_id == venue_id
            ).first()

            if fetch_venue == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "Venue ID not found",
                }
                response = JsonResponse(response_dict, safe=False)
            else:

                venue_result_str = json.dumps(dict(fetch_venue), cls=AlchemyEncoder)
                venue_result = json.loads(venue_result_str)

                img_urls = []

                img_dict = venue_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                venue_result['Venue']['venue_image'] = img_urls

                response_dict = {
                    "status": "OK",
                    "message": "Venues Retrieved",
                    "data": venue_result
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Owner_Venues(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            search_value = request.data["searchValue"]

            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]

            page_start = (int(request.data["page"]) - 1) * 10
            page_end = page_start + 10

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_venue = session.query(Venue, Venue_Address).join(Venue_Address, Venue.venue_id == Venue_Address.venue_id).filter(
                and_(
                    Venue.user_id == fetch_user.user_id,
                    Venue.venue_name.ilike("%"+search_value+"%"),
                    Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                    Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                )
            )[page_start:page_end]

            total_venue_fetch = session.query(func.count(Venue.venue_id)).join(Venue_Address).filter(
                and_(
                    Venue.user_id == fetch_user.user_id,
                    Venue.venue_name.ilike("%"+search_value+"%"),
                    Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                    Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                )
            ).first()
            total_venue_count = total_venue_fetch[0]

            search_result_str = json.dumps([dict(r) for r in fetch_venue], cls=AlchemyEncoder)
            search_result = json.loads(search_result_str)

            for each_result in search_result:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Venues Retrieved",
                "data": {"totalCount": total_venue_count, "searchResult": search_result}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Upcoming_Bookings_Owner(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            search_value = request.data["searchValue"]

            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]

            page_start = (int(request.data["page"]) - 1) * 10
            page_end = page_start + 10

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            total_venue_fetch = session.query(Booking, Venue, Venue_Address).join(Venue, Venue.venue_id == Booking.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                    and_(
                        Booking.booking_start_date > datetime.date.today(),
                        Venue.user_id == fetch_user.user_id,
                        Venue.venue_name.ilike("%"+search_value+"%"),
                        Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                        Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                    )
            ).group_by(Booking.booking_id, Venue.venue_id, Venue_Address.venue_addr_id).all()

            fetch_venue = total_venue_fetch[page_start:page_end]

            total_venue_count = len(total_venue_fetch)

            search_result_str = json.dumps([dict(r) for r in fetch_venue], cls=AlchemyEncoder)
            search_result = json.loads(search_result_str)

            for each_result in search_result:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Venues Retrieved",
                "data": {"totalCount": total_venue_count, "searchResult": search_result}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Upcoming_Bookings_Member(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]
            search_value = request.data["searchValue"]

            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]

            page_start = (int(request.data["page"]) - 1) * 10
            page_end = page_start + 10

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            total_venue_fetch = session.query(Booking, Venue, Venue_Address).join(Venue, Venue.venue_id == Booking.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                    and_(
                        Booking.booking_start_date > datetime.date.today(),
                        Booking.user_id == fetch_user.user_id,
                        Venue.venue_name.ilike("%"+search_value+"%"),
                        Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                        Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                    )
            ).group_by(Booking.booking_id, Venue.venue_id, Venue_Address.venue_addr_id).all()

            fetch_venue = total_venue_fetch[page_start:page_end]

            total_venue_count = len(total_venue_fetch)

            search_result_str = json.dumps([dict(r) for r in fetch_venue], cls=AlchemyEncoder)
            search_result = json.loads(search_result_str)

            for each_result in search_result:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Venues Retrieved",
                "data": {"totalCount": total_venue_count, "searchResult": search_result}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Add_Profile(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request
            email = request.data["email"]
            profile_dob = request.data["profileDob"]
            profile_addr_line1 = request.data["profileAddressLine1"]
            profile_addr_line2 = request.data["profileAddressLine2"]
            profile_addr_city = request.data["profileAddressCity"]
            profile_addr_state = request.data["profileAddressState"]
            profile_addr_zip = request.data["profileAddressZip"]
            profile_phone = request.data["profilePhone"]
            profile_bio = request.data["profileBio"]
            profile_gender = request.data["profileGender"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            if fetch_user == None:
                print("here1")
                response_dict = {
                    "status": "FAIL",
                    "message": "User Does Not Exist"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                print("here2")
                #image storage
                user_dir = email + "/"
                profile_dir = user_dir + "profile" + "/"

                if not (os.path.exists(FILE_DIR + user_dir)):
                    os.mkdir(FILE_DIR + user_dir)
                if not (os.path.exists(FILE_DIR + profile_dir)):
                    os.mkdir(FILE_DIR + profile_dir)

                sub_path_dict, img_status = process_image(request.FILES.getlist('profileImages'), profile_dir)

                if img_status == "FAIL":
                    response_dict = {
                        "status": "FAIL",
                        "message": "File format not supported! (Use .jpg or .png only)"
                    }
                    response = JsonResponse(response_dict, safe=False)
                else:
                    if len(sub_path_dict["images"]) == 0:
                        sub_path_dict = None

                    fetch_profile = session.query(Profile).filter(
                            Profile.user_id == fetch_user.user_id,
                    ).first()
                    if fetch_profile == None:
                    #update profile?
                        profile_object = Profile(
                            user_id = fetch_user.user_id,
                            profile_dob = profile_dob,
                            profile_gender = profile_gender,
                            profile_rating = 0,
                            profile_addr_line1 = profile_addr_line1,
                            profile_addr_line2 = profile_addr_line2,
                            profile_addr_city = profile_addr_city,
                            profile_addr_state = profile_addr_state,
                            profile_addr_zip = profile_addr_zip,
                            profile_phone = profile_phone,
                            profile_bio = profile_bio,
                            profile_image = sub_path_dict
                        )
                        session.add(profile_object)
                        session.commit()
                        response_dict = {
                            "status": "OK",
                            "message": "Profile Added"
                        }
                        response = JsonResponse(response_dict, safe=False)

                    else:
                        fetch_profile.profile_dob = profile_dob
                        fetch_profile.profile_gender = profile_gender
                        fetch_profile.profile_phone = profile_phone
                        fetch_profile.profile_bio = profile_bio
                        fetch_profile.profile_addr_line1 = profile_addr_line1
                        fetch_profile.profile_addr_line2 = profile_addr_line2
                        fetch_profile.profile_addr_state = profile_addr_state
                        fetch_profile.profile_addr_city = profile_addr_city
                        fetch_profile.profile_addr_zip = profile_addr_zip
                        fetch_profile.profile_image = sub_path_dict

                        session.commit()
                        response_dict = {
                            "status": "OK",
                            "message": "Profile Updated"
                        }
                        response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Profile(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            #retrieve information from request 
            email = request.data["email"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            if fetch_user == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "User Does Not Exist"
                }
                response = JsonResponse(response_dict, safe=False)
            else:

                fetch_profile = session.query(Profile).filter(
                    Profile.user_id == fetch_user.user_id,
                ).first() #to get a list replace first with "all"
                data_dict = {}
                if fetch_profile == None:
                    data_dict["profileGender"] = ""
                    data_dict["profileRating"] = None
                    data_dict["profileDob"] = None
                    data_dict["profileAddressLine1"] = ""
                    data_dict["profileAddressLine2"] = ""
                    data_dict["profileAddressCity"] = ""
                    data_dict["profileAddressState"] = ""
                    data_dict["profileAddressZip"] = ""
                    data_dict["profilePhone"] = None
                    data_dict["profileImage"] = []
                    data_dict["email"] = fetch_user.user_email
                    data_dict["firstName"] = fetch_user.user_fname
                    data_dict["lastName"] = fetch_user.user_lname
   
                else:
                    url_list = []
                    if not fetch_profile.profile_image == None:
                        for sub_path in fetch_profile.profile_image["images"]:
                            url_list.append(FILE_URL + sub_path)

                    data_dict["profileGender"] = fetch_profile.profile_gender
                    data_dict["profileDob"] = fetch_profile.profile_dob
                    data_dict["profileRating"] = fetch_profile.profile_rating
                    data_dict["profileAddressLine1"] = fetch_profile.profile_addr_line1
                    data_dict["profileAddressLine2"] = fetch_profile.profile_addr_line2
                    data_dict["profileAddressCity"] = fetch_profile.profile_addr_city
                    data_dict["profileAddressState"] = fetch_profile.profile_addr_state
                    data_dict["profileAddressZip"] = fetch_profile.profile_addr_zip
                    data_dict["profilePhone"] = fetch_profile.profile_phone
                    data_dict["profileBio"] = fetch_profile.profile_bio
                    data_dict["profileImage"] = url_list
                    data_dict["email"] = fetch_user.user_email
                    data_dict["firstName"] = fetch_user.user_fname
                    data_dict["lastName"] = fetch_user.user_lname

                response_dict = {
                    "status": "OK",
                    "message": "Profile Information Retrieved",
                    "data": data_dict
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Book_Dates(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]
            venue_id = request.data["venueId"]
            dates = json.loads(str(request.data["dates"]))
            dates = dates["dateList"]
            dates_list = [datetime.datetime.strptime(date, '%Y/%m/%d').date() for date in dates]
            dates_list.sort()
            earliest_date = dates_list[0]

            fetch_booking = "start"
            booking_id = None
            while not fetch_booking == None:
                booking_id = generate_id()

                fetch_booking = session.query(Booking).filter(
                    Booking.booking_id == booking_id
                ).first()

            if earliest_date <= datetime.date.today():
                response_dict = {
                    "status": "FAIL",
                    "message": "Only allowed to book from tomorrow!"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                booking_flag = True

                fetch_dates = session.query(Booking_Date).join(Booking).filter(
                    and_(
                        Booking.venue_id == venue_id,
                        Booking_Date.booking_date_date > datetime.date.today()
                    )
                ).all()

                for each_date in fetch_dates:
                    if each_date.booking_date_date in dates_list:
                        booking_flag = False
                        break

                if not booking_flag == False:
                    fetch_user = session.query(User).filter(
                        User.user_email == email
                    ).first()

                    booking_object = Booking(
                        venue_id = venue_id,
                        user_id = fetch_user.user_id,
                        booking_id = booking_id,
                        booking_start_date = dates_list[0],
                        booking_end_date = dates_list[-1]
                    )
                    session.add(booking_object)
                    session.commit()

                    for each_date in dates_list:
                        booking_date_object = Booking_Date(
                            booking_id = booking_id,
                            booking_date_date = each_date,
                        )
                        session.add(booking_date_object)
                    session.commit()

                if booking_flag == False:
                    response_dict = {
                        "status": "FAIL",
                        "message": "Dates have been booked previously!"
                    }
                    response = JsonResponse(response_dict, safe=False)
                else:
                    response_dict = {
                        "status": "OK",
                        "message": "Dates booked!"
                    }
                    response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Cancel_Booking(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            booking_id = request.data["bookingId"]

            fetch_booking = session.query(Booking).filter(
                Booking.booking_id == booking_id
            ).first()

            if fetch_booking == None:
                response_dict = {
                    "status": "FAIL",
                    "message": "Booking With This ID Does Not Exist!"
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                session.delete(fetch_booking)
                session.commit()

                response_dict = {
                    "status": "OK",
                    "message": "Booking Cancelled!"
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response
    
class Fetch_Dates(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            venue_id = request.data["venueId"]

            fetch_dates = session.query(Booking_Date).join(Booking).filter(
                and_(
                    Booking.venue_id == venue_id,
                    Booking_Date.booking_date_date > datetime.date.today()
                )
            ).all()

            dates_list = []

            for each_date in fetch_dates:
                dates_list.append(each_date.booking_date_date)

            dates_list.sort()

            response_dict = {
                "status": "OK",
                "message": "Retrieved Dates!",
                "data": dates_list
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Send_Message(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["senderEmail"]
            receiver_id = request.data["receiverId"]
            message = request.data["message"]

            fetch_sender = session.query(User).filter(
                User.user_email == email
            ).first()

            fetch_receiver = session.query(User).filter(
                User.user_id == receiver_id
            ).first()

            if fetch_sender == None or fetch_receiver == None:
                status_message = "Sender ID or Receiver ID does not exist"

                if fetch_sender == None and fetch_receiver == None:
                    status_message = "Sender ID and Receiver ID do not exist"
                elif fetch_sender == None:
                    status_message = "Sender ID does not exist"
                else:
                    status_message = "Receiver ID does not exist"

                response_dict = {
                    "status": "FAIL",
                    "message": status_message
                }
                response = JsonResponse(response_dict, safe=False)
            else:
                message_object = Message(
                    message_sender_id = fetch_sender.user_id,
                    message_receiver_id = receiver_id,
                    message_content = message,
                    message_timestamp = datetime.datetime.now(),
                    message_delivered = False
                )

                session.add(message_object)
                session.commit()

                response_dict = {
                    "status": "OK",
                    "message": "Message was sent"
                }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Retrieve_Sender_List(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]

            #database query to fetch users with the same email
            fetch_receiver = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_sender_list = session.query(
                User.user_id,
                User.user_fullname,
                func.sum(case([(Message.message_delivered == False, 1)], else_=0))
            ).join(Message, Message.message_sender_id == User.user_id).filter(
                and_(
                    Message.message_receiver_id == fetch_receiver.user_id,
                )
            ).group_by(User.user_id).all()

            keys = ["user_id", "user_name", "unread_messages"]
            sender_list = [dict(zip(keys, item)) for item in fetch_sender_list]

            sender_user_ids = []
            for entry in sender_list:
                sender_user_ids.append(entry["user_id"])

            fetch_receiver_list = session.query(
                User.user_id,
                User.user_fullname,
                func.sum(case([(Message.message_delivered == False, 0)], else_=0))
            ).join(Message, Message.message_receiver_id == User.user_id).filter(
                and_(
                    Message.message_sender_id == fetch_receiver.user_id,
                )
            ).group_by(User.user_id).all()

            temp_receiver_list = [dict(zip(keys, item)) for item in fetch_receiver_list]
            receiver_list = []

            for entry in temp_receiver_list:
                if not entry["user_id"] in sender_user_ids:
                    receiver_list.append(entry)

            final_list = sender_list + receiver_list

            response_dict = {
                    "status": "OK",
                    "message": "Messages Received",
                    "data": final_list
                }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Retrieve_Chat(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["receiverEmail"]
            sender_id = int(request.data["senderId"])

            #database query to fetch users with the same email
            fetch_receiver = session.query(User).filter(
                User.user_email == email,
            ).first()

            set_messages_delivered = session.query(Message).filter(
                and_(
                    Message.message_receiver_id == fetch_receiver.user_id,
                    Message.message_sender_id == sender_id
                )
            ).all()

            for message in set_messages_delivered:
                message.message_delivered = True

            session.commit()

            fetch_messages = session.query(
                User.user_id,
                User.user_fullname,
                Message.message_content,
                Message.message_timestamp,
                Message.message_delivered
            ).join(Message, Message.message_sender_id == User.user_id).filter(
                or_(
                    and_(
                        Message.message_receiver_id == fetch_receiver.user_id,
                        Message.message_sender_id == sender_id
                    ),
                    and_(
                        Message.message_receiver_id == sender_id,
                        Message.message_sender_id == fetch_receiver.user_id
                    )
                )
            ).order_by(Message.message_timestamp).all()

            keys = ["user_id", "user_name", "message", "timestamp", "delivery_flag"]
            chat = [dict(zip(keys, item)) for item in fetch_messages]

            for message in chat:
                if message["user_id"] == sender_id:
                    message["message_type"] = "received"
                else:
                    message["message_type"] = "sent"

            response_dict = {
                    "status": "OK",
                    "message": "Check Logs",
                    "data": chat
                }
            response = JsonResponse(response_dict, safe=False)
        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Retrieve_Inbox_Count(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]

            #database query to fetch users with the same email
            fetch_receiver = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_message_count = session.query(
                func.count(Message.message_id)
            ).filter(
                and_(
                    Message.message_receiver_id == fetch_receiver.user_id,
                    Message.message_delivered == False
                )
            ).first()

            response_dict = {
                    "status": "OK",
                    "message": "Messages Received",
                    "data": {"total_unread_messages": fetch_message_count[0]}
                }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Add_Venue_Bookmark(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]
            venue_id = request.data["venueId"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_bookmark = session.query(Bookmark).filter(
                Bookmark.venue_id == venue_id,
                Bookmark.user_id == fetch_user.user_id
            ).first()

            if not fetch_bookmark == None:
                response_dict = {
                        "status": "FAIL",
                        "message": "Venue Already Has A Bookmark!",
                    }
                response = JsonResponse(response_dict, safe=False)
            else:
                bookmark_object = Bookmark(
                    venue_id = venue_id,
                    user_id = fetch_user.user_id
                )
                session.add(bookmark_object)
                session.commit()

                response_dict = {
                        "status": "OK",
                        "message": "Venue Bookmark Added!",
                    }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Remove_Venue_Bookmark(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]
            venue_id = request.data["venueId"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_bookmark = session.query(Bookmark).filter(
                Bookmark.venue_id == venue_id,
                Bookmark.user_id == fetch_user.user_id
            ).first()

            if fetch_bookmark == None:
                response_dict = {
                        "status": "FAIL",
                        "message": "Could Not Find Bookmark To Remove!",
                    }
                response = JsonResponse(response_dict, safe=False)
            else:
                session.delete(fetch_bookmark)
                session.commit()

                response_dict = {
                        "status": "OK",
                        "message": "Venue Bookmark Removed!",
                    }
                response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Fetch_Bookmarked_Venues(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]
            search_value = request.data["searchValue"]

            venue_addr_city = request.data["venueAddrCity"]
            venue_addr_state = request.data["venueAddrState"]

            page_start = (int(request.data["page"]) - 1) * 10
            page_end = page_start + 10

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_bookmarks = session.query(Bookmark.bookmark_id, Venue, Venue_Address).join(Venue, Venue.venue_id == Bookmark.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                    and_(
                        Bookmark.user_id == fetch_user.user_id,
                        Venue.venue_name.ilike("%"+search_value+"%"),
                        Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                        Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                    )
            )[page_start:page_end]

            total_bookmarks_fetch = session.query(func.count(Bookmark.bookmark_id)).join(Venue, Venue.venue_id == Bookmark.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                    and_(
                        Bookmark.user_id == fetch_user.user_id,
                        Venue.venue_name.ilike("%"+search_value+"%"),
                        Venue_Address.venue_addr_city.ilike("%"+venue_addr_city+"%"),
                        Venue_Address.venue_addr_state.ilike("%"+venue_addr_state+"%"),
                    )
            ).first()

            total_bookmarks_count = total_bookmarks_fetch[0]

            search_result_str = json.dumps([dict(r) for r in fetch_bookmarks], cls=AlchemyEncoder)
            search_result = json.loads(search_result_str)

            for each_result in search_result:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Bookmarks Retrieved",
                "data": {"totalCount": total_bookmarks_count, "searchResult": search_result}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Check_Bookmark_Exists(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]
            venue_id = request.data["venueId"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_bookmark = session.query(Bookmark).filter(
                and_(
                    Bookmark.user_id == fetch_user.user_id,
                    Bookmark.venue_id == venue_id
                )
            ).first()

            if fetch_bookmark == None:
                result = False
            else:
                result = True

            response_dict = {
                "status": "OK",
                "message": "Does A Bookmark For This Venue Exist?",
                "result": result
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Dashboard_Member(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_upcoming_bookings = session.query(Booking, Venue, Venue_Address).join(Venue, Venue.venue_id == Booking.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                    and_(
                        Booking.booking_start_date > datetime.date.today(),
                        Booking.user_id == fetch_user.user_id
                    )
            ).group_by(Booking.booking_id, Venue.venue_id, Venue_Address.venue_addr_id).order_by(asc(Booking.booking_start_date))[0:3]

            search_bookings_str = json.dumps([dict(r) for r in fetch_upcoming_bookings], cls=AlchemyEncoder)
            search_bookings = json.loads(search_bookings_str)

            for each_result in search_bookings:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            fetch_recent_bookmarks = session.query(Bookmark.bookmark_id, Venue, Venue_Address).join(Venue, Venue.venue_id == Bookmark.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                Bookmark.user_id == fetch_user.user_id,
            ).order_by(desc(Bookmark.bookmark_id))[0:3]

            search_bookmarks_str = json.dumps([dict(r) for r in fetch_recent_bookmarks], cls=AlchemyEncoder)
            search_bookmarks = json.loads(search_bookmarks_str)

            for each_result in search_bookmarks:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Dashboard Content For Member Retrieved",
                "data": {"upcomingBookings": search_bookings, "recentBookmarks": search_bookmarks}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Dashboard_Owner(APIView):
    def post(self, request):
        #establish database connection
        engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
        session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

        try:
            email = request.data["email"]

            #database query to fetch users with the same email
            fetch_user = session.query(User).filter(
                User.user_email == email,
            ).first()

            fetch_upcoming_bookings = session.query(Booking, Venue, Venue_Address).join(Venue, Venue.venue_id == Booking.venue_id ).join(Venue_Address, Venue_Address.venue_id == Venue.venue_id).filter(
                    and_(
                        Booking.booking_start_date > datetime.date.today(),
                        Venue.user_id == fetch_user.user_id
                    )
            ).group_by(Booking.booking_id, Venue.venue_id, Venue_Address.venue_addr_id).order_by(asc(Booking.booking_start_date))[0:3]

            search_bookings_str = json.dumps([dict(r) for r in fetch_upcoming_bookings], cls=AlchemyEncoder)
            search_bookings = json.loads(search_bookings_str)

            for each_result in search_bookings:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            fetch_recent_venues = session.query(Venue, Venue_Address).join(Venue_Address, Venue.venue_id == Venue_Address.venue_id).filter(
                Venue.user_id == fetch_user.user_id,
            ).order_by(desc(Venue.venue_id))[0:3]

            search_venues_str = json.dumps([dict(r) for r in fetch_recent_venues], cls=AlchemyEncoder)
            search_venues = json.loads(search_venues_str)

            for each_result in search_venues:
                img_urls = []

                img_dict = each_result['Venue']['venue_image']
                if not img_dict == None:
                    for each_img in img_dict['images']:
                        img_urls.append(FILE_URL + each_img)

                each_result['Venue']['venue_image'] = img_urls

            response_dict = {
                "status": "OK",
                "message": "Dashboard Content For Owner Retrieved",
                "data": {"upcomingBookings": search_bookings, "recentVenues": search_venues}
            }
            response = JsonResponse(response_dict, safe=False)

        except:
            #in case of errors, rollback database changes
            session.rollback()
            response_dict = {
                    "status": "ERROR",
                    "message": "System Backend Error"
                }
            response = JsonResponse(response_dict, safe=False)
            raise

        finally:
            #close database connection
            session.close()
            engine.dispose()

        return response

class Image_Test(APIView):
    def post(self, request):

        email = request.data["email"]
        user_dir = email + "/"
        venues_dir = user_dir + "venues" + "/"

        if not (os.path.exists(FILE_DIR + user_dir)):
            os.mkdir(FILE_DIR + user_dir)
        if not (os.path.exists(FILE_DIR + venues_dir)):
            os.mkdir(FILE_DIR + venues_dir)

        url_dict = {"images": []}

        for image in request.FILES.getlist('images'):
            filename_rev = "".join(reversed(image.name))
            filename = "".join(reversed(filename_rev.split(".",1)[1]))
            filename_ext = "".join(reversed(filename_rev.split(".",1)[0]))

            if filename_ext.lower() not in ['jpeg','jpg','png']:
                return HttpResponse("Bad!", status=status.HTTP_200_OK)
            else:
                new_filename = filename.replace(" ","_").replace("""(""","_").replace(""")""","_").replace(".","-")

                with open(FILE_DIR + venues_dir + new_filename + "." + filename_ext, 'wb+') as destination:
                    destination.write(image.read())

                final_filename = convert_image(new_filename, filename_ext, FILE_DIR + venues_dir)

                url_dict["images"].append(FILE_URL + venues_dir + final_filename)

        response_dict = {
            "status": "OK",
            "message": "Images Saved",
            "data": url_dict
        }
        response = JsonResponse(response_dict, safe=False)

        return response