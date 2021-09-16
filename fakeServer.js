let arr = [];
for (let i = 1; i < 500; i++) {
  arr.push(`Item no: ${i}`);
}

export const fetchPaginatedData = (offset, limit) =>
  new Promise(resolve => {
    console.log(
      'Fetching data:',
      offset,
      limit,
      arr.slice(offset, offset + limit),
    );
    const newArr = arr.slice(offset, offset + limit);
    setTimeout(() => {
      resolve(newArr);
    }, 500);
  });
