module.exports = function (arr1, arr2) {
    const arr1dif = [];
    const arr2dif = [];

    arr1.sort((a, b) => a - b);
    arr2.sort((a, b) => a - b);

    let pointer1 = 0;
    let pointer2 = 0;

    while (pointer1 < arr1.length && pointer2 < arr2.length) {
        if (arr1[pointer1] === arr2[pointer2]) {
            pointer1++;
            pointer2++;
            continue;
        }
        if (arr1[pointer1] < arr2[pointer2]) {
            pointer1++;
            arr1dif.push(arr1[pointer1]);
        }
        if (arr1[pointer1] > arr2[pointer2]) {
            pointer2++;
            arr2dif.push();
        }
    }

    if (pointer1 === arr1.length) {
        arr2dif.push(...arr2.slice(pointer2));
    }

    if (pointer2 === arr2.length) {
        arr1dif.push(...arr1.slice(pointer1));
    }

    return [
        arr1dif,
        arr2dif,
    ];
};
