"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_time

url_signer = URLSigner(session)

from py4web.utils.form import Form, FormStyleBulma
from .common import Field

@action('index')
@action.uses(db, auth, 'index.html')
def index():
    rows = db(db.post).select()
    print("User:", get_user_email())
    return dict(rows=rows, url_signer=url_signer)

@action('create_post', method=["GET", "POST"]) # the :int means: please convert this to an int.
@action.uses(db, session, auth.user, 'create_post.html')
def add():
    # form = Form(db.post, csrf_session=session, formstyle=FormStyleBulma)
    # if form.accepted:
    #     redirect(URL('index'))
    time = get_time()
    user_id = auth.current_user.get('id')
    assert user_id is not None
    print("user id is", user_id)
    form = Form([Field('note', 'text'), Field('type')], csrf_session=session,
                formstyle=FormStyleBulma)
    if form.accepted:
        db.post.insert(
            user_id=user_id,
            time=time,
            note=form.vars["note"],
            type=form.vars["type"]
        )
        redirect(URL('index'))
    return dict(form=form)
