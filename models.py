"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
db.define_table('user',
                Field('reference_auth_user', 'reference auth_user'),
                Field('followers', 'list:string'),
                Field('following', 'list:string'),
                Field('email'),
                Field('profile_image_url'),
                Field('profile_email'),
                )

db.define_table('post',
                Field('content'),
                Field('name'),
                Field('email'),
                Field('comment_content', 'list:string'),
                Field('comment_name', 'list:string'),
                Field('comment_email', 'list:string'),
                Field('comment_authuserid', 'list:string'),
                Field('dislikes', 'list:string'),
                Field('likes', 'list:string'),
                Field('user_id', 'reference auth_user'),
                )

db.commit()
