var imaps = require('imap-simple');

var config = {
    imap: {
        user: 'your@email.address',
        password: 'yourpassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
    }
};

imaps.connect(config).then(function (connection: any) {

    return connection.openBox('INBOX').then(function () {
        var searchCriteria = [
            'UNSEEN'
        ];

        var fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false
        };

        return connection.search(searchCriteria, fetchOptions).then(function (results: any) {
            var subjects = results.map(function (res: any) {
                return res.parts.filter(function (part: any) {
                    return part.which === 'HEADER';
                })[0].body.subject[0];
            });

            console.log(subjects);
            // =>
            //   [ 'Hey Chad, long time no see!',
            //     'Your amazon.com monthly statement',
            //     'Hacker Newsletter Issue #445' ]
        });
    });
});