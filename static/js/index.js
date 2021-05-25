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
        rows: [],
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
                thumbs_down: false,
                thumbs_up: false,
                show_likers: false,
            });
            app.enumerate(app.vue.rows);
            app.vue.add_content = "";
            app.set_add_status(false);
        });
    };

    app.modify_post = function(row_idx, email, like, add) {
      let id = app.vue.rows[row_idx].id;
//      if (like) console.log("before thumbs up value: ", app.vue.rows[row_idx].thumbs_up);
//      if (!like) console.log("before thumbs down value: ", app.vue.rows[row_idx].thumbs_down);
//        console.log("in modify post");
      let recursive_down_false = false;
      let recursive_up_false = false;
        if (like === true && add === true){
         app.vue.rows[row_idx].thumbs_up = true;
         if (app.vue.rows[row_idx].thumbs_down) recursive_down_false = true;
//         app.vue.rows[row_idx].thumbs_down = false;
        }
        else if (like === false && add === true){
         app.vue.rows[row_idx].thumbs_down = true;
         if (app.vue.rows[row_idx].thumbs_up) recursive_up_false = true;
//         app.vue.rows[row_idx].thumbs_up = false;
        }
        else if (like === true && add === false) app.vue.rows[row_idx].thumbs_up = false;
        else if (like === false && add === false) app.vue.rows[row_idx].thumbs_down = false;
//      if (like) console.log("after thumbs up value: ", app.vue.rows[row_idx].thumbs_up);
//      if (!like) console.log("after thumbs down value: ", app.vue.rows[row_idx].thumbs_down);
//        app.enumerate(app.vue.rows);
        axios.post(modify_post_url, {id: id, like: like, add_to_list: add, email: email}).then(function (response){
//            app.enumerate(app.vue.rows)
            console.log("modify likes and dislikes");
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

    app.show_likers_over = function (row_idx) {
//        console.log("over show likers");
//        console.log("showlikers_over before: ", app.vue.rows[row_idx].show_likers);
        Vue.set(app.vue.rows[row_idx], 'show_likers', true);
//        console.log("showlikers_over after: ", app.vue.rows[row_idx].show_likers);
//        let temprows = app.vue.rows;
//        temprows[row_idx].show_likers = true;
//        app.vue.rows = temprows;
    };

    app.show_likers_out = function (row_idx) {
//        console.log("showlikers_out before: ", app.vue.rows[row_idx].show_likers);
        Vue.set(app.vue.rows[row_idx], 'show_likers', false);
//        console.log("showlikers_out after: ", app.vue.rows[row_idx].show_likers);
//        let temprows = app.vue.rows;
//        temprows[row_idx].show_likers = false;
//        app.vue.rows = temprows;

//    app.set_show_likers_status = function (row_idx, new_status) {
//        app.vue.rows[row_idx].show_likers = new_status;
//        if (new_status){
//            console.log("mousing over likes");
//        }else{
//            console.log("exiting mousing over likes");
//        }
////        console.log("in set show likers status");
////        let id = app.vue.rows[row_idx].id;
////        for (let i = 0; i < app.vue.rows.length; i++) {
////            if (app.vue.rows[i].id === id) {
////                app.vue.rows[i].show_likers = new_status
////                break;
////            }
////        }
     };

     app.add_comment = function (row_idx) {
        console.log("in add comment");
        let id = app.vue.rows[row_idx].id;
        axios.post(add_comment_url,
            {
                id: id,
                comment_content: app.vue.rows[row_idx].add_comment_content,
            }).then(function (response) {
            app.vue.rows[row_idx].comment_content = app.vue.rows[row_idx].comment_content || [];
            app.vue.rows[row_idx].comment_name = app.vue.rows[row_idx].comment_name || [];
            app.vue.rows[row_idx].comment_email = app.vue.rows[row_idx].comment_email || [];
            app.vue.rows[row_idx].comment_content.push(app.vue.rows[row_idx].add_comment_content);
            app.vue.rows[row_idx].comment_name.push(response.data.comment_name);
            app.vue.rows[row_idx].comment_email.push(response.data.comment_email);
            app.enumerate(app.vue.rows);
            app.vue.rows[row_idx].add_comment_content = "";
            app.set_add_comment_status(row_idx, false);
        });
    };

    app.delete_comment = function(row_idx, comment_idx) {
        console.log("in delete comment");
        let row_id = app.vue.rows[row_idx].id;
//        let comment_id = app.vue.rows[row_idx].comment_content[comment_idx].id;
        console.log("row id is: ", row_id);
        console.log("comment idx is: ", comment_idx);
        axios.get(delete_comment_url, {params: {row_id: row_id, comment_id: comment_idx}}).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === row_id) {
                    for (let j = 0; j < app.vue.rows[i].comment_content.length; j++) {
                        if (j === comment_idx) {
                            console.log("in if statement");
                            app.vue.rows[i].comment_content.splice(j, 1);
                            app.vue.rows[i].comment_email.splice(j, 1);
                            app.vue.rows[i].comment_name.splice(j, 1);
                            app.enumerate(app.vue.rows);
                            break;
                        }
                    }
//                    app.vue.rows.splice(i, 1);
//                    app.enumerate(app.vue.rows);
//                    break;
                }
            }
            });
    };

    app.set_add_comment_status = function (row_idx, new_status) {
//        app.vue.rows[row_idx].add_comment_mode = new_status;
        Vue.set(app.vue.rows[row_idx], 'add_comment_mode', new_status);
    };

    // This contains all the methods.
    app.methods = {
        set_add_status: app.set_add_status,
//        set_show_likers_status: app.set_show_likers_status,
        show_likers_out: app.show_likers_out,
        show_likers_over: app.show_likers_over,
        add_post: app.add_post,
        delete_post: app.delete_post,
        modify_post: app.modify_post,
        set_add_comment_status: app.set_add_comment_status,
        add_comment: app.add_comment,
        delete_comment: app.delete_comment,

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
        // Typically this is a server GET call to load the data.
        axios.get(load_posts_url).then(function (response) {
            let temprows = app.enumerate(response.data.rows);
//            app.vue.rows = app.enumerate(response.data.rows);
            app.vue.current_email = response.data.email;
            for (let i = 0; i < temprows.length; i++){
                temprows[i].show_likers = false;
                temprows[i].add_comment_mode = false;
                temprows[i].add_comment_content = "";
                if (temprows[i].likes !== undefined && temprows[i].likes.includes(app.vue.current_email)){
                    temprows[i].thumbs_up = true;
//                    console.log(app.vue.rows[i]);
//                    console.log("thumbs up is: ", app.vue.rows[i].thumbs_up);
                }else{
                    temprows[i].thumbs_up = false;
//                    console.log(app.vue.rows[i]);
//                    console.log("thumbs up is: ", app.vue.rows[i].thumbs_up);
                }
                if (temprows[i].dislikes !== undefined && temprows[i].dislikes.includes(app.vue.current_email)){
                    temprows[i].thumbs_down = true;
//                    console.log(app.vue.rows[i]);
//                    console.log("thumbs down is: ", app.vue.rows[i].thumbs_down);
                }else{
                    temprows[i].thumbs_down = false;
//                    console.log(app.vue.rows[i]);
//                    console.log("thumbs down is: ", app.vue.rows[i].thumbs_down);
                }
            }
            app.vue.rows = temprows;
//            console.log(app.vue.rows);
        });
//        .then(() => {
//
//        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
