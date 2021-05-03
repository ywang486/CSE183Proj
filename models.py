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

# db.define_table(
#     'user',
#     Field('first_name', requires=IS_NOT_EMPTY()),
#     Field('last_name', requires=IS_NOT_EMPTY()),
#     Field('user_email', default=get_user_email),
# )
# db.user.user_email.writable = db.user.user_email.readable = False
# db.user.id.readable = db.user.id.writable = False

db.define_table(
    'post',
    # Field('user_id', 'reference user'),
    Field('user_id', 'reference auth_user'),
    Field('time', default=get_time),
    Field('note', 'text', requires=IS_NOT_EMPTY()),
    Field('type', requires=IS_NOT_EMPTY()),
)

db.post.time.writable = db.post.time.readable = False
db.post.user_id.writable = db.post.user_id.readable = False

db.commit()
