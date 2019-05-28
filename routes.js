const router = app => {
    app.get('/getUser', (request, response) => {
        response.send(users);
    });
}

const users = [{
    id: 1,
    name: "Richard Hendricks",
    email: "richard@piedpiper.com",
},
{
    id: 2,
    name: "Bertram Gilfoyle",
    email: "gilfoyle@piedpiper.com",
},
];

module.exports = router;