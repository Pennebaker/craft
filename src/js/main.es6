loadjs([
  '/js/functions.min.' + staticAssetsVersion + '.js',
  '/js/app.min.' + staticAssetsVersion + '.js',
],
{
  async: false,
  success: () => {
    ready( () => {
        // Document Ready
    })
  }
})

loadjs([
  '/js/ls.bgset.min.' + staticAssetsVersion + '.js',
  '/js/ls.respimg.min.' + staticAssetsVersion + '.js',
  '/js/ls.attrchange.min.' + staticAssetsVersion + '.js',
  '/js/lazysizes.min.' + staticAssetsVersion + '.js',
],
{
  async: false,
  success: () => {
    document.addEventListener('lazybeforeunveil', e => {
      let bg = e.target.getAttribute('data-bg')
      if (bg) {
        e.target.style.backgroundImage = 'url(' + bg + ')'
      }
      if (e.target.getAttribute('map-api-key')) {
        loadjs.ready('googlemaps',
        {
          success: () => {
            initMaps()
          }
        })
      }
    })
  }
})
