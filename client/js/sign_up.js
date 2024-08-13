// $.ajax({
//     method: 'GET',
//     url: '/api/sign-up'
// }).then(function(res){
//     if(res.message === "signed-in"){
//         window.location.href = '/profile/' + res.user_id
//     }
// });

document.getElementById("sign-up-form").addEventListener("submit", function(e){
    e.preventDefault();

    var postObj = {
        username: document.getElementById("username-input").value,
        password: document.getElementById("password-input").value
    }

    fetch("/auth/sign-up", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:  JSON.stringify(postObj)
    })
    .then(function(response){ 
        return response.json(); 
    })
    .then(function(data){ 
        console.log(data)
    });

})