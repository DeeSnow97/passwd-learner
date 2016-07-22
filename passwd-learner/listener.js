(function(){
  var descriptors = {} ;
  
  function handleDescriptor( query ) {
    var descriptor = descriptors[ query ] ;
    
    var current = Array.prototype.slice.call( document.querySelectorAll( query ) ) ;
    var handled = descriptor.handled ;
    
    current.map( function( element ) {
      if( !~handled.indexOf( element ) ) {
        descriptor.listeners.map( function( listener ) {
          element.addEventListener( listener.event, listener.callback ) ;
        });
      }
    });
    
    handled.map( function( element ) {
      if( !~current.indexOf( element ) ) {
        descriptor.listeners.map( function( listener ) {
          element.removeEventListener( listener.event, listener.callback ) ;
        });
      }
    });
    
    descriptor.handled = current.slice(0) ;
  }
  
  function getDescriptor( query ) {
    return descriptors[ query ] = descriptors[ query ] || {
      listeners: [],
      handled: []
    };
  }
  
  function removeDescriptor( query ) {
    var descriptor = descriptors[ query ] ;
    descriptor.handled.map( function( element ) {
      descriptor.listeners.map( function( listener ) {
        element.removeEventListener( listener.event, listener.callback ) ;
      });
    });
    descriptor.handled = [] ;
    descriptor.listeners = [] ; // safeguards ftw
    delete descriptors[ query ] ;
  }
  
  function addListener( query, event, listener ) {
    var descriptor = getDescriptor( query ) ;
    descriptor.listeners.push({
      event: event,
      callback: listener
    });
  }
  
  function removeListener( query, event, listener ) {
    if( !( query in descriptors ) ) {
      return false ;
    }
    
    var descriptor = descriptors[ query ] ;
    var before = descriptor.listeners.length ;
    descriptor.listeners = descriptor.listeners.filter( function( existing ) {
      var canStay = !( existing.event == event && existing.callback == listener ) ;
      if( !canStay ) {
        descriptor.handled.map( function( element ) {
          element.removeEventListener( event, listener ) ;
        });
      }
      return canStay ;
    });
    
    if( descriptor.listeners.length == before ) {
      return false ;
    }
    
    if( !descriptor.listeners.length ) {
      removeDescriptor( query ) ;
    }
    
    return true ;
  }
  
  function refresh() {
    Object.keys( descriptors ).map( handleDescriptor ) ;
  }
  
  requestAnimationFrame( function loop() {
    refresh() ;
    requestAnimationFrame( loop ) ;
  });
  
  window.addListener = addListener ;
  window.removeListener = removeListener ;
  
  window.descriptors = descriptors ;
})();