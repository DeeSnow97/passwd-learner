(function(){
  'use strict';
  
  var globalDefaults = {
    length: 8,
    lowercase: true,
    uppercase: true,
    numeric: true
  };
  
  var templates = {
    alert: function( content, name ) {
      return (`
        <div class="card alert ${ name ? 'alert-' + name : '' }">
          <div>${ content }</div>
          <div class="button-close"></div>
        </div>
      `);
    },
    warning: function( content, name ) {
      return (`
        <div class="card warning ${ name ? 'warning-' + name : '' }">
          <div>${ content }</div>
          <div class="button-close"></div>
        </div>
      `);
    },
    generate: function( vault ) {
      vault = vault || {} ;
      var defaults = vault.defaults || globalDefaults ;
      return (`
        <div class="card gencard">
          Length: <input type="number" id="length" value="${ defaults.length }"></br>
          <input type="checkbox" id="lowercase" ${ toChecked( defaults.lowercase ) }>&nbsp;<label for="lowercase">Include lowercase letters</label><br>
          <input type="checkbox" id="uppercase" ${ toChecked( defaults.uppercase ) }>&nbsp;<label for="uppercase">Include uppercase letters</label><br>
          <input type="checkbox" id="numeric" ${ toChecked( defaults.numeric ) }>&nbsp;<label for="numeric">Include numbers</label><br>
          <input type="checkbox" id="symbols" ${ toChecked( defaults.symbols ) }>&nbsp;<label for="symbols">Include symbols</label><br>
          <input type="checkbox" id="hex" ${ toChecked( defaults.hex ) }>&nbsp;<label for="hex">Include hex digits (0-9a-f)</label><br>
          <input type="checkbox" id="uhex" ${ toChecked( defaults.uhex ) }>&nbsp;<label for="uhex">Include uppercase hex digits (0-9A-F)</label><br>
          <input type="checkbox" id="base58" ${ toChecked( defaults.base58 ) }>&nbsp;<label for="base58">Include Bitcoin-style base58 (0, O, I and l excluded)</label><br>
          <div class="button button-generate">Generate</div>
        </div>
      `);
    },
    passcard: function( password ) {
      return (`
        <div class="card passcard hidden">
          <div class="pass">${ password }</div>
        </div>
      `);
    },
    savecard: function( password ) {
      return (`
        <div class="card savecard hidden">
          Save current password as: <input><div class="button button-savepass">Save</div>
        </div>
      `);
    },
    newVault: function() {
      return (`
        <div class="card vaultgencard">
          <table>
            <tr><td>Name:</td><td><input class="vault-name" placeholder="default"></td></tr>
            <tr><td>Password:</td><td><input class="vault-pass" type="password"></td></tr>
            <tr><td>Confirm password:</td><td><input class="vault-pass" type="password"></td></tr>
            <tr><td colspan="2"><div class="button button-create">Create vault</div></td?</tr>
          </table>
        </div>
      `);
    },
    vaultcard: function( name ) {
      var unlocked = name == currentVault && unlockedVault ;
      return (`
        <div class="card vaultcard">
          <div>${ name }</div>
          <div data-vault="${ name }">
            ${ unlocked ? '<div class="button learn-manage">Manage</div>' : '<input type="password" class="vault-pass">' }
            <div class="button vault-${ unlocked ? 'lock' : 'unlock' }">${ unlocked ? 'Lock' : 'Unlock' } vault</div>
            <div class="button button-red vault-delete">Delete</div>
          </div>
        </div>
      `);
    },
    createcard: function() {
      return (`
        <div class="card createcard">
          <div class="button vault-create">Add new vault</div>
        </div>
      `);
    },
    confirm: function( message, success, failure, attributes ) {
      return (`
        <div class="card confirm" ${ Object.keys( attributes ).map( function( key ) {
          return 'data-' + key + '="' + attributes[ key ] + '"' ;
        }).join(' ') }>
          <div>${ message }</div>
          <div class="button ${ success }">Yes</div>
          <div class="button button-red ${ failure }">No</div>
        </div>
      `);
    },
    learn: function( vault ) {
      var passwordCount = Object.keys( vault.passwords ).length ;
      return (`
        <div class="card learnhub">
          <div>${ passwordCount } ${ passwordCount == 1 ? 'password' : 'passwords' } loaded and ready for learning</div>
          <div>
            <div class="button learn-random">Learn</div>
            <div class="button learn-choose">Choose</div>
            <div class="button learn-manage">Manage</div>
          </div>
        </div>
      `);
    },
    choosecard: function( vault ) {
      var buttons = Object.keys( vault.passwords ).map( function( name ) {
        return '<div class="button button-choosepass">' + name + '</div>' ;
      }).join('');
      return (`
        <div class="card choosecard">
          <div>Choose the password you want to learn:</div>
          <div>
            ${ buttons }
          </div>
        </div>
      `);
    },
    storecard: function( name, length ) {
      var stars = new Array( length ).fill('*').join('') ;
      return (`
        <div class="card storecard">
          <div>${ name }</div>
          <div data-pass="${ name }" data-length="${ length }">
            <div class="pass">${ stars }</div>
            <div class="button pass-show">Show</div>
            <div class="button pass-choose">Learn</div>
            <div class="button button-red pass-delete">Delete</div>
          </div>
        </div>
      `);
    },
    importcard: function() {
      return (`
        <div class="card importcard">
          <input class="import-name" placeholder="name">
          <input class="import-pass" type="password" placeholder="********">
          <input class="import-pass" type="password" placeholder="********">
          <div class="button button-import">Import password</div>
        </div>
      `);
    },
    learncard: function( name, length ) {
      var stars = new Array( length ).fill('*').join('') ;
      return (`
        <div class="card learncard" data-pass="${ name }">
          <div>Enter password "${ name }"</div>
          <input type="password"><div class="button learn-enter">Enter</div>
          <div><div class="pass">${ stars }</div></div>
          <div>
            <div class="button learn-showpart">Show wrong</div>
            <div class="button learn-showfull">Show all</div>
            <div class="button learn-retry">Retry</div>
            <div class="button learn-continue">Continue</div>
          </div>
        </div>
      `);
    }
  };
  
  function toChecked( bool ) {
    return bool ? 'checked' : '' ;
  }
  
  function shuffle( array ) {
    var temp, current, remaining = array.length - 1 ;
    while( remaining ) {
      current = Math.floor( Math.random() * ( remaining + 1 ) ) ;
      
      temp = array[ current ] ;
      array[ current ] = array[ remaining ] ;
      array[ remaining ] = temp ;
      
      remaining-- ;
    }
    return array ;
  }
  
  var applyingQueue = [] ;
  function applyTemplate( html, append, prepend ) {
    var shouldReturn = applyingQueue.length ;
    applyingQueue.push( arguments ) ;
    if( shouldReturn ) {
      return ;
    }
    
    function loop( html, append, prepend ) {
      var element = document.querySelector('.container') ;
      new Promise( function( resolve, reject ) {
        if( !append && element.innerHTML.trim().length ) {
          element.classList.add('hidden') ;
          setTimeout( resolve, 400 ) ;
        } else {
          resolve() ;
        }
      }).then( function() {
        element.innerHTML = ( ( append && prepend ) ? element.innerHTML : '' ) + html + ( ( append && !prepend ) ? element.innerHTML : '' ) ;
        element.classList.remove('hidden') ;
        applyingQueue.shift() ;
        if( applyingQueue.length ) {
          loop.apply( this, applyingQueue[0] ) ;
        }
      });
    }
    
    loop( html, append, prepend ) ;
  }
  
  addListener( '.button-close', 'click', function( event ) {
    event.preventDefault() ;
    
    var parent = event.target.parentNode ;
    var height = parent.getBoundingClientRect().height + 'px' ;
    var margin = getComputedStyle( parent ).margin ;
    
    var wrapper = document.createElement('div') ;
    parent.parentNode.insertBefore( wrapper, parent ) ;
    wrapper.appendChild( parent ) ;
    wrapper.style.height = height ;
    wrapper.style.margin = margin ;
    parent.style.margin = 0 ;
    wrapper.classList.add( 'close-wrapper' ) ;
    
    requestAnimationFrame( stepTwo );
    function stepTwo() {
      wrapper.style.height = 0 ;
      wrapper.style.marginLeft = 0 ;
      wrapper.style.marginRight = 0 ;
      wrapper.style.marginBottom = -parseInt( wrapper.style.marginTop ) + 'px' ;
      setTimeout( stepThree, 400 ) ;
    }
    
    function stepThree() {
      wrapper.parentNode.removeChild( wrapper ) ;
    }
  });
  
  var vaults = [], currentVault, unlockedVault, masterPassword ;
  
  addListener( '.menu-item, .button', 'mousedown', function( event ) {
    event.preventDefault() ;
  });
  
  addListener( '.menu-item.generate', 'click', function( event ) {
    generateUi() ;
  });
  
  function generateUi() {
    applyTemplate( templates.generate( unlockedVault ) ) ;
    
    if( !unlockedVault ) {
      readVaults() ;
      applyTemplate( !vaults.length
        ? templates.alert( 'No vault detected, saved settings and named passwords are currently unavailable', 'novault' )
        : templates.warning( 'Vault detected but not loaded, unlock it to save additional passwords', 'novault' ), 
      true ) ;
    }
  }
  
  addListener( '.button-generate', 'click', function( event ) {
    var length = document.querySelector('#length').value ;
    var alphabetNames = {
      lowercase: 'lowercase',
      uppercase: 'uppercase',
      numeric: 'numeric',
      hex: 'hex',
      uppercaseHex: 'uhex',
      symbols: 'symbols',
      base58: 'base58'
    };
    var alphabet = Object.keys( alphabetNames ).map( function( name ) {
      return document.querySelector( '#' + alphabetNames[ name ] ).checked ? alphabets[ name ] : '' ;
    }).join('');
    var password = generate( length, alphabet ) ;
    
    var passcard = document.querySelector('.passcard') ;
    if( passcard ) {
      passcard.querySelector('.pass').textContent = password ;
    } else {
      ( unlockedVault ? unlockedVault.defaults : globalDefaults ).length = document.querySelector('#length').value ;
      document.querySelector('.container').innerHTML = templates.generate( unlockedVault ) ;
      applyTemplate( templates.passcard( password ), true, true ) ;
      requestAnimationFrame( function() {
        document.querySelector('.passcard').classList.remove('hidden') ;
      });
    }
    
    if( unlockedVault && !document.querySelector('.savecard') ) {
      applyTemplate( templates.savecard(), true, true ) ;
      requestAnimationFrame( function() {
        document.querySelector('.savecard').classList.remove('hidden') ;
      });
    }
  });
  
  function learnUi() {
    if( !unlockedVault ) {
      return applyTemplate( templates.alert( 'Learning functionality only works with vaults, please load one at the Manage tab', 'novault' ) ) ;
    }
    
    applyTemplate( templates.learn( unlockedVault ) ) ;
    
    if( !Object.keys( unlockedVault.passwords ).length ) {
      applyTemplate( templates.warning( 'No passwords to learn, add or generate at the Generate tab', 'nopass' ), true ) ;
    }
  }
  
  addListener( '.menu-item.learn', 'click', function( event ) {
    learnUi() ;
  });
  
  addListener( '.menu-item.manage, .button-manage', 'click', function( event ) {
    readVaults() ;
    if( !vaults.length ) {
      return createUi() ;
    }
    manageUi() ;
  });
  
  function readVaults() {
    vaults = Object.keys( localStorage ).map( function( key ) {
      var text = localStorage.getItem( key ) ;
      try {
        var object = JSON.parse( text ) ;
        return object.iv && object.cipher && object.mode && object.ct && key ;
      } catch( aids ) {
        return false ;
      }
    }).filter( function( key ) {
      return key ;
    });
  }
  
  function createUi() {
    applyTemplate( templates.newVault() ) ;
  }
  
  function manageUi( success ) {
    readVaults();
    applyTemplate( vaults.map( function( name ) {
      return templates.vaultcard( name ) ;
    }).join('') + templates.createcard() );
    
    if( success === false ) {
      applyTemplate( templates.alert( 'Failed to decrypt vault' ), true ) ;
    }
  }
  
  function generateVault() {
    var name = document.querySelector('input.vault-name').value ;
    var password = Array.prototype.slice.call( document.querySelectorAll('input.vault-pass') ).map( function( element ) {
      return element.value ;
    }).reduce( function( a, b ) {
      return a == b ? a : '' ;
    });
    
    if( !password ) {
      return applyTemplate( templates.alert( 'Passwords must match and cannot be empty'), true ) ;
    }
    
    currentVault = name || 'default' ;
    unlockedVault = {
      defaults: {
        lowercase: true,
        uppercase: true,
        numeric: true,
        length: 8
      },
      passwords: {}
    };
    masterPassword = password ;
    saveCurrentVault() ;
    readVaults() ;
    
    manageUi() ;
  }
  
  function saveCurrentVault() {
    save( masterPassword, unlockedVault, currentVault );
    learnQueue = [] ;
  }
  
  function loadVault( password, name ) {
    var unlocked = load( password, name ) ;
    if( !unlocked ) {
      return false ;
    }
    
    currentVault = name || 'default' ;
    unlockedVault = unlocked ;
    masterPassword = password ;
    return true ;
  }
  
  function unloadVault() {
    saveCurrentVault() ;
    currentVault = null ;
    unlockedVault = null ;
    masterPassword = null ;
  }
  
  function removeVault( name ) {
    localStorage.removeItem( name ) ;
  }
  
  addListener( 'input.vault-pass', 'change', function( event ) {
    if( document.activeElement == event.target ) {
      var vault = event.target.parentNode.getAttribute('data-vault') ;
      if( vault ) {
        ( loadVault( event.target.value, vault ) ? learnUi : manageUi )( false ) ;
      } else {
        generateVault() ;
      }
    }
  });
  
  addListener( '.button-create', 'click', function( event ) {
    generateVault() ;
  });
  
  addListener( '.button.vault-create', 'click', function() {
    createUi() ;
  });
  
  addListener( '.button.vault-lock', 'click', function() {
    unloadVault() ;
    manageUi() ;
  });
  
  addListener( '.button.vault-unlock', 'click', function( event ) {
    var vault = event.target.parentNode.getAttribute('data-vault') ;
    var password = event.target.parentNode.querySelector('.vault-pass').value ;
    loadVault( password, vault ) ;
    manageUi() ;
  });
  
  addListener( '.button.vault-delete', 'click', function( event ) {
    var vault = event.target.parentNode.getAttribute('data-vault') ;
    applyTemplate( templates.confirm( 'Are you sure you want to delete vault "' + vault + '"?', 'vault-delete-sure', 'button-manage', {
      vault: vault
    }));
  });
  
  addListener( '.button.vault-delete-sure', 'click', function( event ) {
    removeVault( event.target.parentNode.getAttribute('data-vault') ) ;
    manageUi() ;
  });
  
  addListener( '.alert-novault, .warning-novault', 'click', function( event ) {
    if( event.target.classList.contains('button-close') ) {
      return false ;
    }
    readVaults() ;
    ( vaults.length ? manageUi : createUi )();
  });
  
  addListener( '.button-savepass', 'click', function( event ) {
    var name = document.querySelector('.savecard input').value ;
    var pass = document.querySelector('.passcard .pass').textContent ;
    unlockedVault.passwords[ name ] = pass ;
    saveCurrentVault() ;
    passManageUi() ;
  });
  
  addListener( '.warning-nopass', 'click', function( event ) {
    if( event.target.classList.contains('button-close') ) {
      return false ;
    }
    generateUi();
  });
  
  addListener( '.button.learn-choose', 'click', function() {
    applyTemplate( templates.choosecard( unlockedVault ) ) ;
    
    if( !Object.keys( unlockedVault.passwords ).length ) {
      applyTemplate( templates.warning( 'No passwords to choose from, you may want to generate a few', 'nopass' ), true ) ;
    }
  });
  
  function passManageUi() {
    var passwords = unlockedVault.passwords ;
    applyTemplate( Object.keys( passwords ).map( function( key ) {
      return templates.storecard( key, passwords[ key ].length ) ;
    }).join('') + templates.importcard() );
  }
  
  addListener( '.button.learn-manage', 'click', function() {
    passManageUi() ;
  });
  
  addListener( '.button.pass-show', 'click', function( event ) {
    var name = event.target.parentNode.getAttribute('data-pass') ;
    var pass = unlockedVault.passwords[ name ] ;
    event.target.parentNode.querySelector('.pass').textContent = pass ;
    event.target.textContent = 'Hide' ;
    event.target.classList.add('pass-hide') ;
    event.target.classList.remove('pass-show') ;
  });
  
  addListener( '.button.pass-hide', 'click', function( event ) {
    var length = Number( event.target.parentNode.getAttribute('data-length') ) ;
    var stars = new Array( length ).fill('*').join('') ;
    event.target.parentNode.querySelector('.pass').textContent = stars ;
    event.target.textContent = 'Show' ;
    event.target.classList.add('pass-show') ;
    event.target.classList.remove('pass-hide') ;
  });
  
  addListener( '.button.pass-delete', 'click', function( event ) {
    var name = event.target.parentNode.getAttribute('data-pass') ;
    applyTemplate( templates.confirm( 'Are you sure you want to delete password "' + name + '"?', 'pass-delete-sure', 'learn-manage', {
      pass: name
    }));
  });
  
  addListener( '.button.pass-delete-sure', 'click', function( event ) {
    delete unlockedVault.passwords[ event.target.parentNode.getAttribute('data-pass') ] ;
    saveCurrentVault() ;
    passManageUi() ;
  });
  
  function importPassword() {
    var name = document.querySelector('input.import-name').value ;
    var password = Array.prototype.slice.call( document.querySelectorAll('input.import-pass') ).map( function( element ) {
      return element.value ;
    }).reduce( function( a, b ) {
      return a == b ? a : '' ;
    });
    
    if( !password ) {
      return applyTemplate( templates.alert( 'Passwords must match and cannot be empty'), true ) ;
    }
    
    unlockedVault.passwords[ name ] = password ;
    saveCurrentVault() ;
    passManageUi() ;
  }
  
  addListener( 'input.import-pass', 'change', function( event ) {
    if( document.activeElement == event.target ) {
      importPassword() ;
    }
  });
  
  addListener( '.button-import', 'click', function( event ) {
    importPassword() ;
  });
  
  addListener( '.gencard input', 'change', function( event ) {
    var defaults = unlockedVault ? unlockedVault.defaults : globalDefaults ;
    defaults[ event.target.id ] = event.target.type == 'checkbox' ? event.target.checked : event.target.value ;
    if( unlockedVault ) {
      saveCurrentVault() ;
    }
  });
  
  function learnCard( name ) {
    applyTemplate( templates.learncard( name, unlockedVault.passwords[ name ].length ) ) ;
    setTimeout( function() {
      document.querySelector('.learncard input').focus() ;
    }, 400 );
  }
  
  var learnQueue = [] ;
  function randomLearnCard() {
    if( !learnQueue.length ) {
      learnQueue = shuffle( Object.keys( unlockedVault.passwords ) ) ;
    }
    learnCard( learnQueue.pop() ) ;
  }
  
  addListener( '.button-choosepass', 'click', function( event ) {
    learnCard( event.target.textContent ) ;
  });
  
  addListener( '.button.pass-choose', 'click', function( event ) {
    learnCard( event.target.parentNode.getAttribute('data-pass') ) ;
  });
  
  addListener( '.button.learn-random, .button.learn-continue', 'click', function( event ) {
    randomLearnCard() ;
  });
  
  function evaluate( showWrong, showRight ) {
    var input = document.querySelector('.learncard input') ;
    var output = document.querySelector('.learncard .pass') ;
    
    var entered = input.value ;
    var correct = unlockedVault.passwords[ document.querySelector('.learncard').getAttribute('data-pass') ] ;
    
    input.setAttribute( 'data-value', input.value ) ;
    input.value = '' ;
    
    if( entered == correct ) {
      output.innerHTML = '<span class="right">Success!</span>' ;
      return setTimeout( randomLearnCard, 800 ) ;
    }
    
    if( entered.length > correct.length ) {
      output.innerHTML = '<span class="wrong">too long</span>' ;
      return ;
    }
    
    var stars = correct.split('').map( function( key, index ) {
      return entered[ index ] == key ;
    }).map( function( right, index ) {
      return '<span class="' + ( right ? 'right' : 'wrong' ) + '">' + ( ( right ? showRight : showWrong ) ? correct[ index ] : '*' ) + '</span>' ;
    }).join('');
    output.innerHTML = stars || '<span class="wrong">empty</span>' ;
  }
  
  addListener( '.button.learn-enter', 'click', function() {
    evaluate() ;
  });
  
  addListener( '.learncard input', 'change', function( event ) {
    if( document.activeElement == event.target ) {
      evaluate() ;
    }
  });
  
  addListener( '.button.learn-showpart', 'click', function( event ) {
    var input = document.querySelector('.learncard input') ;
    input.value = input.getAttribute('data-value') ;
    evaluate( true ) ;
  });
  
  addListener( '.button.learn-showfull', 'click', function( event ) {
    var input = document.querySelector('.learncard input') ;
    input.value = input.getAttribute('data-value') ;
    evaluate( true, true ) ;
  });
  
  addListener( '.button.learn-retry', 'click', function() {
    learnCard( document.querySelector('.learncard').getAttribute('data-pass') ) ;
  });
  
  function exportVault( name ) {
    if( name == currentVault ) {
      saveCurrentVault() ;
    }
    var magic = 'pwdvault' ;
    var content = JSON.stringify({
      name: name,
      vault: localStorage.getItem( name )
    });
    var url = URL.createObjectURL( new Blob([ magic, content ]) ) ;
    var link = document.createElement('a');
    link.href = url ;
    link.download = name + '.vault' ;
    link.click() ;
  }
  
  window.addEventListener( 'load', function() {
    readVaults() ;
    ( vaults.length ? manageUi : generateUi )() ;
  }) ;
})();