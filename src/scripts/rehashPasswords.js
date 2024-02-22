const bcrypt = require('bcrypt');

process.stdin.setEncoding('utf8');

let serializedData = '';
process.stdin.on('data', (data) => {
    serializedData += data;
});

process.stdin.on('end', () => {
    try {
        const emailPasswordPairs = JSON.parse(serializedData);
        const hashedPairs = emailPasswordPairs.map((pair) => ({
            email: pair.email,
            password: bcrypt.hashSync(pair.password, 10),
        }));
        console.log(JSON.stringify(hashedPairs));
    } catch (error) {
        console.error('Error parsing input:', error);
        process.exit(1);
    }
});
