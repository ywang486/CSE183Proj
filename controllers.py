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
from .models import get_user_email


url_signer = URLSigner(session)

@action('index')
@action.uses(db, auth.user, 'index.html')
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        my_callback_url=URL('my_callback', signer=url_signer),
        load_posts_url=URL('load_posts', signer=url_signer),
        add_post_url=URL('add_post', signer=url_signer),
        modify_post_url=URL('modify_post', signer=url_signer),
        delete_post_url=URL('delete_post', signer=url_signer),
        add_comment_url=URL('add_comment', signer=url_signer),
        delete_comment_url=URL('delete_comment', signer=url_signer),
        search_url=URL('search', signer=url_signer),
    )

@action('load_posts')
@action.uses(url_signer.verify(),db)
def load_posts():
    rows = db(db.post).select().as_list()
    r = db(db.auth_user.email == get_user_email()).select().first()
    email = r.email if r is not None else "Unknown"
    inUserTable = db(db.user.reference_auth_user == r.id).select().first()
    # print(inUserTable)
    if inUserTable is None and email != "Unknown":
        nofollowersorfollowingyet = []
        db.user.insert(
            reference_auth_user=r.id,
            followers=nofollowersorfollowingyet,
            following=nofollowersorfollowingyet,
        )
    return dict(
        rows=rows,
        email=email,
    )


@action('add_post', method="POST")
@action.uses(url_signer.verify(), auth.user, db)
def add_post():

    r = db(db.auth_user.email == get_user_email()).select().first()
    print(r)
    print(r.id)
    name = r.first_name + " " + r.last_name if r is not None else "Unknown"
    email = r.email if r is not None else "Unknown"
    nolikesordislikesyet = []
    id = db.post.insert(
        content=request.json.get('content'),
        name=name,
        email=email,
        likes=nolikesordislikesyet,
        dislikes=nolikesordislikesyet,
        user_id=r.id,
    )
    return dict(
        id=id,
        name=name,
        email=email,
    )

@action('modify_post', method='POST')
@action.uses(url_signer.verify(), auth.user, db)
def modify_post():
    id = request.json.get('id')
    like = request.json.get('like')
    add_to_list = request.json.get('add_to_list')
    email = request.json.get('email')
    assert id is not None and add_to_list is not None and like is not None and email is not None
    post = (db(db.post.id == id).select().as_list())[0]
    likes = post['likes']
    dislikes = post['dislikes']
    if like:
        if add_to_list:
            likes.append(email)
        else:
            likes.remove(email)
        db.post.update_or_insert(
            (db.post.id == id),
            likes=likes,
        )
    else:
        if add_to_list:
            dislikes.append(email)
        else:
            dislikes.remove(email)
        db.post.update_or_insert(
            (db.post.id == id),
            dislikes=dislikes,
        )
    return dict(
        likes=likes,
        dislikes=dislikes,
    )



@action('delete_post')
@action.uses(url_signer.verify(), auth.user, db)
def delete_post():
    id = request.params.get('id')
    assert id is not None
    db(db.post.id == id).delete()
    return "ok"

@action('add_comment', method="POST")
@action.uses(url_signer.verify(), db)
def add_comment():
    id = request.json.get('id')
    comment_content = request.json.get('comment_content')
    r = db(db.auth_user.email == get_user_email()).select().first()
    name = r.first_name + " " + r.last_name if r is not None else "Unknown"
    email = r.email if r is not None else "Unknown"
    post = (db(db.post.id == id).select().as_list())[0]
    if post['comment_content'] is not None:
        post['comment_content'].append(comment_content)
        post['comment_name'].append(name)
        post['comment_email'].append(email)
        post['comment_authuserid'].append(r.id)
    else:
        post['comment_content'] = [comment_content]
        post['comment_name'] = [name]
        post['comment_email'] = [email]
        post['comment_authuserid'] = [r.id]
    db.post.update_or_insert(
        (db.post.id == id),
        comment_content=post['comment_content'],
        comment_name=post['comment_name'],
        comment_email=post['comment_email'],
        comment_authuserid=post['comment_authuserid'],
    )
    return dict(
        comment_name=name,
        comment_email=email,
    )

@action('delete_comment')
@action.uses(url_signer.verify(), auth.user, db)
def delete_comment():

    comment_id = int(request.params.get('comment_id'))
    row_id = request.params.get('row_id')
    assert comment_id is not None
    assert row_id is not None
    post = (db(db.post.id == row_id).select().as_list())[0]

    for i, comment in enumerate(post["comment_content"]):
        if i == comment_id:
            del post['comment_content'][i]
            del post['comment_name'][i]
            del post['comment_email'][i]
            del post['comment_authuserid'][i]
    db.post.update_or_insert(
        (db.post.id == row_id),
        comment_content=post['comment_content'],
        comment_name=post['comment_name'],
        comment_email=post['comment_email'],
        comment_authuserid=post['comment_authuserid'],
    )
    return "ok"


#Johnson's edit for making Profile Page
@action('profile/<user_id:int>')
@action.uses(db, auth.user, 'profile.html')
def profile(user_id=None):
    assert user_id is not None
    user = db(db.auth_user.id == user_id).select().first()
    rows = db(db.post.email == user["email"]).select().as_list()

    return dict(
        rows =rows,
        user = user,
    )

@action('search')
@action.uses()
def search():
    q = request.params.get("q")
    results = []
    # print(db(db.user).select().as_list())
    users = db(db.user).select().as_list()
    for user in users:
        # auth_user = db(db.auth_user).select().as_list()
        auth_user = db(db.auth_user.id == user["reference_auth_user"]).select().first()
        name = auth_user.first_name + " " + auth_user.last_name
        if q.lower() in name.lower():
            nameandphoto = []
            nameandphoto.append(name)
            nameandphoto.append(user["profile_image_url"])
            nameandphoto.append(user["reference_auth_user"])
            results.append(nameandphoto)
            

    #print(results = [q + ":" + str(uuid.uuid1()) for _ in range(random.randint(2, 6))])
    return dict(results=results)