(function(){
  function save( password, object, name ) {
    localStorage.setItem( name || 'default', sjcl.encrypt( password, JSON.stringify( object ), { iter: 4096 } ) ) ;
  }
  
  function load( password, name ) {
    try {
      return JSON.parse( sjcl.decrypt( password, localStorage.getItem( name ) ) ) ;
    } catch( cancer ) {
      return false ;
    }
  }
  
  // Functional challenge: try coding only with single-expression arrow functions
  var hash = s => sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( s ) ) ;
  var hashLib = object => hash( Object.keys( object ).map(
    key => typeof object[ key ] == 'object'
      ? hashLib( object[ key ] )
      : hash( object.toString() )
  ).join('') ) ;
  // Yep, it breaks IE and Safari compatibilty. Not that I care.
  
  var cloned = Object.assign( {}, sjcl ) ;
  delete cloned.random ;
  if( hashLib( cloned ) != 'ce0e66b9e62a0b2d2d1b2f5253dca691f3a712c15e1012c551073d71c67e67ce' ) {
    panic() ;
  }
  
  function panic() {
    window.location.href = URL.createObjectURL( new Blob([ `<html>
      <head>
        <title>PANIC</title>
        <style>
          body {
            font-weight: bold ;
            font-family: monospace ;
            font-size: 24px ;
            white-space: pre-wrap ;
            color: #fff ;
            background-color: #f00 ;
            text-align: center ;
            padding: 10% ;
            margin: 0 ;
          }
        </style>
      </head>
      <body>`+
`CRITICAL ERROR
Password storage compromised

The program ran into an error while initiating secure password vault. For security reasons this error is fatal, if the program ran any longer, your passwords could have been sniffed.
This error shouldn't appear in an untampered program. Look for malicious extensions or user scripts if the problem persists.
      </body>
    </html>` ], { type: 'text/html' }) );
  }
  
  try {
    Object.defineProperties( window, {
      save: {
        value: save
      },
      load: {
        value: load
      }
    });
  } catch( dontPanic ) {
    panic() ;
  }
})();