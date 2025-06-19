(function(global){
  global.saveGameState = function(state){
    try {
      localStorage.setItem('yusha-save', JSON.stringify(state));
    } catch(e) {
      console.error('Save failed', e);
    }
  };

  global.loadGameState = function(){
    try {
      const data = localStorage.getItem('yusha-save');
      return data ? JSON.parse(data) : null;
    } catch(e) {
      console.error('Load failed', e);
      return null;
    }
  };

  global.clearGameState = function(){
    try {
      localStorage.removeItem('yusha-save');
    } catch(e) {
      console.error('Clear failed', e);
    }
  };
})(this);
