// hash.js
const bcrypt = require('bcryptjs');

const plainPassword = 'password123'; // 登録したいパスワード

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    return console.error('エラー:', err);
  }
  console.log('生成されたハッシュ:', hash);
});
