module.exports = {
    proxy: "localhost:3000",
    files: ["public/**/*.*", "dist/client/**/*.*"],
    port: 3001,
    open: false,
    notify: false,
    reloadDelay: 500
};
