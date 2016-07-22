var alphabets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeric: '0123456789',
  hex: '0123456789abcdef',
  uppercaseHex: '0123456789ABCDEF',
  symbols: '!#$%&*+-=?@^_',
  base58: 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789'
};

function generate( length, alphabet ) {
  alphabet = alphabets[ alphabet ] || alphabet || alphabets.lowercase + alphabets.uppercase + alphabets.numeric ;
  alphabet = alphabet.split('').filter( function( letter, index, array ) { // remove duplicate letters
    return index == array.indexOf( letter ) ;
  }).join('') ;
  var buffer = crypto.getRandomValues( new Uint32Array( length ) ) ;
  return Array.prototype.slice.call( buffer ).map( function( char ) {
    return alphabet[ Math.floor( ( char / 0x100000000 ) * alphabet.length ) ];
  }).join('');
}