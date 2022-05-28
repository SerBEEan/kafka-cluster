module.exports.prepareArgs = (args) => {
    const prepare = {};

    args.slice(2).forEach((arg) => {
        if (typeof arg !== 'string') {
            return;
        }
        const [key, value] = arg.split('=');
        prepare[key] = value;
    });

    return prepare;
};
