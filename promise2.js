
console.log('debug 0');

const myFirstPromise = new Promise((resolve, reject) => {
    console.log('debug 1');
    setTimeout(() => {
        console.log('debug 2');
        resolve("Success!");
        console.log('debug 3');
    }, 5250);
    console.log('debug 4');
});

console.log('debug 5');

(async () => {

    console.log('debug 6');

    await myFirstPromise.then((successMessage) => {
        console.log('debug 7');
        console.log(`Yay! ${successMessage}`);
        console.log('debug 8');
    });

    console.log('debug 9');

})();

console.log('debug 10');