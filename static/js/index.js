// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        add_mode: false,
        add_content: "",
        current_email: "",
        user_to_follow: "",
        rows: [],
        query: "",
        results: [],

        // new data June 6th
        following: [],
        show_all_posts: false,
        profile_email: "",
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.add_post = function () {
        axios.post(add_post_url,
            {
                content: app.vue.add_content,
            }).then(function (response) {
            app.vue.rows.push({
                id: response.data.id,
                content: app.vue.add_content,
                name: response.data.name,
                email: response.data.email,
                likes: response.data.likes,
                dislikes: response.data.dislikes,
                user_id: response.data.user_id,
                thumbs_down: false,
                thumbs_up: false,
                show_comment_mode: false,
                show_likers: false,
            });
            app.enumerate(app.vue.rows);
            app.vue.add_content = "";
            app.set_add_status(false);
        });
    };

    app.modify_post = function(row_idx, email, like, add) {
      let id = app.vue.rows[row_idx].id;
      let recursive_down_false = false;
      let recursive_up_false = false;
        if (like === true && add === true){
         app.vue.rows[row_idx].thumbs_up = true;
         if (app.vue.rows[row_idx].thumbs_down) recursive_down_false = true;
        }
        else if (like === false && add === true){
         app.vue.rows[row_idx].thumbs_down = true;
         if (app.vue.rows[row_idx].thumbs_up) recursive_up_false = true;
        }
        else if (like === true && add === false) app.vue.rows[row_idx].thumbs_up = false;
        else if (like === false && add === false) app.vue.rows[row_idx].thumbs_down = false;
        axios.post(modify_post_url, {id: id, like: like, add_to_list: add, email: email}).then(function (response){
            //console.log("modify likes and dislikes");
            app.vue.rows[row_idx].likes = response.data.likes;
            app.vue.rows[row_idx].dislikes = response.data.dislikes;
        });
        if (recursive_down_false) app.modify_post(row_idx, email, false, false);
        if (recursive_up_false) app.modify_post(row_idx, email, true, false);
    };

    app.delete_post = function(row_idx) {
        let id = app.vue.rows[row_idx].id;
        axios.get(delete_post_url, {params: {id: id}}).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === id) {
                    app.vue.rows.splice(i, 1);
                    app.enumerate(app.vue.rows);
                    break;
                }
            }
            });
    };

    app.set_add_status = function (new_status) {
        app.vue.add_mode = new_status;

    };

    app.set_show_all_posts_status = function (new_status) {
        app.vue.show_all_posts = new_status;
    };

    app.set_show_comment_status = function (new_status, row_idx) {
        let id = app.vue.rows[row_idx].id;
        for (let i = 0; i < app.vue.rows.length; i++) {
            if (app.vue.rows[i].id === id) {
                app.vue.rows[i].show_comment_mode = new_status
                break;
            }
        }
    };

    app.show_likers_over = function (row_idx) {
        Vue.set(app.vue.rows[row_idx], 'show_likers', true);
    };

    app.show_likers_out = function (row_idx) {
        Vue.set(app.vue.rows[row_idx], 'show_likers', false);
     };

     app.add_comment = function (row_idx) {
        //console.log("in add comment");
        let id = app.vue.rows[row_idx].id;
        axios.post(add_comment_url,
            {
                id: id,
                comment_content: app.vue.rows[row_idx].add_comment_content,
            }).then(function (response) {
            app.vue.rows[row_idx].comment_content = app.vue.rows[row_idx].comment_content || [];
            app.vue.rows[row_idx].comment_name = app.vue.rows[row_idx].comment_name || [];
            app.vue.rows[row_idx].comment_email = app.vue.rows[row_idx].comment_email || [];
            app.vue.rows[row_idx].comment_authuserid = app.vue.rows[row_idx].comment_authuserid || [];
            app.vue.rows[row_idx].comment_content.push(app.vue.rows[row_idx].add_comment_content);
            app.vue.rows[row_idx].comment_name.push(response.data.comment_name);
            app.vue.rows[row_idx].comment_email.push(response.data.comment_email);
            app.vue.rows[row_idx].comment_authuserid.push(response.data.comment_authuserid);
            app.enumerate(app.vue.rows);
            app.vue.rows[row_idx].add_comment_content = "";
            app.set_add_comment_status(row_idx, false);
        });
    };

    app.delete_comment = function(row_idx, comment_idx) {
        let row_id = app.vue.rows[row_idx].id;
        axios.get(delete_comment_url, {params: {row_id: row_id, comment_id: comment_idx}}).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === row_id) {
                    for (let j = 0; j < app.vue.rows[i].comment_content.length; j++) {
                        if (j === comment_idx) {
                            app.vue.rows[i].comment_content.splice(j, 1);
                            app.vue.rows[i].comment_email.splice(j, 1);
                            app.vue.rows[i].comment_name.splice(j, 1);
                            app.vue.rows[i].comment_authuserid.splice(j, 1);
                            app.enumerate(app.vue.rows);
                            break;
                        }
                    }
                }
            }
            });
    };

    app.set_add_comment_status = function (row_idx, new_status) {
        Vue.set(app.vue.rows[row_idx], 'add_comment_mode', new_status);
    };

    app.search = function () {
        if (app.vue.query.length > 0) {
            axios.get(search_url, {params: {q: app.vue.query}})
                .then(function (result) {
                    app.vue.results = result.data.results;
                });
        } else {
            app.vue.results = [];
        }
    };

    app.follow_user = function (profile_email) {
        //console.log("in follow user");
        //console.log(profile_email)'

        console.log("before follow: ", app.vue.following);
        app.vue.following.push(profile_email);
        console.log("after follow: ", app.vue.following);


        axios.post(follow_user_url, {
            profile_email: profile_email
        });
    };

    app.unfollow_user = function (profile_email) {
        //console.log("in follow user");
        //console.log(profile_email)

        console.log("before unfollow: ", app.vue.following);
        const index = app.vue.following.indexOf(profile_email);
        app.vue.following.splice(index, 1);
        console.log("after unfollow: ", app.vue.following);

        axios.post(unfollow_user_url, {
            profile_email: profile_email
        });
    };



    // This contains all the methods.
    app.methods = {
        set_add_status: app.set_add_status,
        show_likers_out: app.show_likers_out,
        show_likers_over: app.show_likers_over,
        add_post: app.add_post,
        delete_post: app.delete_post,
        modify_post: app.modify_post,
        set_add_comment_status: app.set_add_comment_status,
        add_comment: app.add_comment,
        delete_comment: app.delete_comment,
        search: app.search,
        follow_user: app.follow_user,
        unfollow_user: app.unfollow_user,
        set_show_comment_status: app.set_show_comment_status,
        set_show_all_posts_status: app.set_show_all_posts_status,
        // Complete as you see fit.
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // server GET call to load the posts
        axios.get(load_posts_url).then(function (response) {
            let temprows = app.enumerate(response.data.rows);
            app.vue.current_email = response.data.email;
            app.vue.following = response.data.following;
            app.vue.profile_email = response.data.profile_email;
//            console.log("following: ", app.vue.following);
            for (let i = 0; i < temprows.length; i++){
                temprows[i].show_likers = false;
                temprows[i].add_comment_mode = false;
                temprows[i].show_comment_mode = false;
                temprows[i].add_comment_content = "";
                if (temprows[i].likes !== undefined && temprows[i].likes.includes(app.vue.current_email)){
                    temprows[i].thumbs_up = true;
                }else{
                    temprows[i].thumbs_up = false;
                }
                if (temprows[i].dislikes !== undefined && temprows[i].dislikes.includes(app.vue.current_email)){
                    temprows[i].thumbs_down = true;
                }else{
                    temprows[i].thumbs_down = false;
                }
            }
            app.vue.rows = temprows;
        });

    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
