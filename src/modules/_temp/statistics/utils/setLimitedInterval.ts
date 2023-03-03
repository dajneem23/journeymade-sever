export default function (callback, interval, x) {
  for (let i = 0; i < x; i++) {
    setTimeout(callback, i * interval);
  }
};
